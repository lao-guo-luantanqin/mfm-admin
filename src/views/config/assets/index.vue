<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { hasPerms } from "@/utils/auth";
import MfmImageUpload from "@/components/busi/MfmImageUpload.vue";
import {
  deleteConfigRecord,
  fetchConfigRecordsPage,
  saveConfigRecord
} from "@/api/admin/config";
import {
  normalizeMediaPublicUrl,
  resolveImageUrl
} from "@/utils/media/qiniu-upload";

defineOptions({ name: "ConfigAssets" });

type AssetForm = {
  key: string;
  kind: string;
  url: string;
  md5: string;
  mimeType: string;
  width?: number;
  height?: number;
  tags: string[];
  notes: string;
};

const COLLECTION = "asset_config";

const kindOptions = [
  { label: "图标", value: "icon" },
  { label: "图片", value: "image" },
  { label: "背景", value: "background" },
  { label: "贴纸", value: "sticker" },
  { label: "插画", value: "illustration" }
];

const canWrite = hasPerms("admin:config:write");

const state = reactive({
  keyword: "",
  page: 1,
  pageSize: 20,
  total: 0,
  loading: false,
  saving: false
});

const rows = ref<Array<Record<string, unknown>>>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("编辑资产");
const editingId = ref<string | null>(null);

const emptyForm = (): AssetForm => ({
  key: "",
  kind: "icon",
  url: "",
  md5: "",
  mimeType: "",
  width: undefined,
  height: undefined,
  tags: [],
  notes: ""
});

const form = ref<AssetForm>(emptyForm());

function tagsPreview(row: Record<string, unknown>): string {
  const tags = row.tags;
  if (!Array.isArray(tags) || !tags.length) return "";
  return tags.map(String).join(", ");
}

async function loadList() {
  state.loading = true;
  try {
    const res = await fetchConfigRecordsPage(COLLECTION, {
      currentPage: state.page,
      pageSize: state.pageSize,
      keyword: state.keyword.trim() || undefined
    });
    rows.value = res.data.list;
    state.total = res.data.total;
  } finally {
    state.loading = false;
  }
}

function openCreate() {
  dialogTitle.value = "新建资产";
  editingId.value = null;
  form.value = emptyForm();
  dialogVisible.value = true;
}

function openEdit(row: Record<string, unknown>) {
  dialogTitle.value = "编辑资产";
  editingId.value = String(row._id ?? "");
  form.value = {
    key: String(row.key ?? ""),
    kind: String(row.kind ?? "icon"),
    url: resolveImageUrl(row.url),
    md5: String(row.md5 ?? ""),
    mimeType: String(row.mimeType ?? ""),
    width:
      row.width != null && Number.isFinite(Number(row.width))
        ? Number(row.width)
        : undefined,
    height:
      row.height != null && Number.isFinite(Number(row.height))
        ? Number(row.height)
        : undefined,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    notes: String(row.notes ?? "")
  };
  dialogVisible.value = true;
}

function validateForm(): string | null {
  const key = form.value.key.trim();
  if (!key) return "请填写资产键 key";
  if (!/^[a-z][a-z0-9._-]*$/i.test(key)) {
    return "key 仅允许字母、数字、点、横线，且以字母开头";
  }
  if (!form.value.url.trim()) return "请上传图片或填写 CDN 地址";
  return null;
}

function buildDocument(): Record<string, unknown> {
  const key = form.value.key.trim();
  const url = normalizeMediaPublicUrl(form.value.url.trim());
  const doc: Record<string, unknown> = {
    key,
    kind: form.value.kind.trim() || null,
    url
  };

  const md5 = form.value.md5.trim();
  if (md5) doc.md5 = md5;

  const mimeType = form.value.mimeType.trim();
  if (mimeType) doc.mimeType = mimeType;

  if (form.value.width != null && Number.isFinite(form.value.width)) {
    doc.width = form.value.width;
  }

  if (form.value.height != null && Number.isFinite(form.value.height)) {
    doc.height = form.value.height;
  }

  if (form.value.tags.length) {
    doc.tags = form.value.tags.map(t => t.trim()).filter(Boolean);
  }

  const notes = form.value.notes.trim();
  if (notes) doc.notes = notes;

  return doc;
}

async function saveAsset() {
  const err = validateForm();
  if (err) {
    message(err, { type: "warning" });
    return;
  }

  state.saving = true;
  try {
    await saveConfigRecord(
      COLLECTION,
      buildDocument(),
      editingId.value ?? undefined
    );
    message("保存成功", { type: "success" });
    dialogVisible.value = false;
    await loadList();
  } finally {
    state.saving = false;
  }
}

async function removeRow(row: Record<string, unknown>) {
  const docId = String(row._id ?? "");
  await ElMessageBox.confirm(
    `确认删除资产「${String(row.key ?? "")}」？`,
    "删除确认",
    { type: "warning" }
  );
  await deleteConfigRecord(COLLECTION, docId);
  message("已删除", { type: "success" });
  await loadList();
}

async function copyUrl(row: Record<string, unknown>) {
  const url = resolveImageUrl(row.url);
  if (!url) {
    message("暂无 CDN 地址", { type: "warning" });
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    message("已复制 URL", { type: "success" });
  } catch {
    message(url, { type: "info" });
  }
}

onMounted(() => {
  void loadList();
});
</script>

<template>
  <div class="config-assets">
    <el-card shadow="never">
      <template #header>
        <div class="config-assets__header">
          <div class="config-assets__title-block">
            <span class="config-assets__title">数字资产</span>
            <span class="config-assets__subtitle"
              >config_db · asset_config · key → CDN url</span
            >
          </div>
          <el-input
            v-model="state.keyword"
            clearable
            placeholder="按 key 搜索"
            style="width: 220px"
            @keyup.enter="loadList"
            @clear="loadList"
          />
          <el-button type="primary" :loading="state.loading" @click="loadList">
            查询
          </el-button>
          <el-button v-if="canWrite" type="success" @click="openCreate">
            新建资产
          </el-button>
        </div>
      </template>

      <el-table v-loading="state.loading" :data="rows" border stripe>
        <el-table-column label="预览" width="88" align="center">
          <template #default="{ row }">
            <el-image
              v-if="resolveImageUrl(row.url)"
              :src="resolveImageUrl(row.url)"
              fit="contain"
              class="config-assets__thumb"
              :preview-src-list="[resolveImageUrl(row.url)]"
            />
            <span v-else class="config-assets__no-thumb">—</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="key"
          label="资产键 key"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="kind" label="类型" width="100" />
        <el-table-column label="CDN url" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ resolveImageUrl(row.url) || "未上传" }}
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ tagsPreview(row) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="copyUrl(row)">
              复制 URL
            </el-button>
            <template v-if="canWrite">
              <el-button link type="primary" @click="openEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" @click="removeRow(row)">
                删除
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="config-assets__pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="state.total"
          :page-size="state.pageSize"
          :current-page="state.page"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="
            p => {
              state.page = p;
              loadList();
            }
          "
          @size-change="
            s => {
              state.pageSize = s;
              state.page = 1;
              loadList();
            }
          "
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="640px"
      destroy-on-close
    >
      <el-form label-width="100px" @submit.prevent>
        <el-form-item label="资产键 key" required>
          <el-input
            v-model="form.key"
            :disabled="!!editingId"
            placeholder="如 home.shell.searchIcon"
          />
        </el-form-item>
        <el-form-item label="类型 kind">
          <el-select v-model="form.kind" style="width: 100%">
            <el-option
              v-for="opt in kindOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="CDN 图片" required>
          <MfmImageUpload
            :model-value="form.url"
            storage="static-asset"
            :asset-key="form.key"
            hint="上传至七牛后自动写入 url；须先填写 key"
            @update:model-value="form.url = String($event ?? '')"
          />
        </el-form-item>
        <el-form-item label="或粘贴 URL">
          <el-input
            v-model="form.url"
            placeholder="https://cdn.../mfm-assets/prod/static/..."
          />
        </el-form-item>
        <el-form-item label="标签 tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="home, tabbar, visual-d"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注 notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="2"
            placeholder="运营说明，不下发客户端"
          />
        </el-form-item>
        <el-collapse>
          <el-collapse-item title="高级字段（可选）" name="advanced">
            <el-form-item label="md5">
              <el-input v-model="form.md5" />
            </el-form-item>
            <el-form-item label="mimeType">
              <el-input v-model="form.mimeType" placeholder="image/png" />
            </el-form-item>
            <el-form-item label="宽 / 高">
              <div class="config-assets__size-row">
                <el-input-number
                  v-model="form.width"
                  :min="0"
                  controls-position="right"
                  placeholder="宽"
                />
                <el-input-number
                  v-model="form.height"
                  :min="0"
                  controls-position="right"
                  placeholder="高"
                />
              </div>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          v-if="canWrite"
          type="primary"
          :loading="state.saving"
          @click="saveAsset"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.config-assets {
  padding: 16px;

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  &__title-block {
    display: flex;
    flex-direction: column;
    margin-right: auto;
  }

  &__title {
    font-weight: 600;
  }

  &__subtitle {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__thumb {
    width: 48px;
    height: 48px;
    border-radius: 6px;
  }

  &__no-thumb {
    color: var(--el-text-color-placeholder);
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__size-row {
    display: flex;
    gap: 12px;
  }
}
</style>
