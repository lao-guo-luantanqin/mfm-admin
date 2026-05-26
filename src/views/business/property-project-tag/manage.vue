<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import {
  deleteRecord,
  fetchRecord,
  fetchRecordsPage,
  saveRecord
} from "@/api/admin/collections";
import MfmTagSearch from "@/components/busi/MfmTagSearch.vue";
import { tagCategoryLabel, tagCategoryTagMap } from "@/config/business-modules";
import { useCollectionSort } from "@/composables/useCollectionSort";
import { hasPerms } from "@/utils/auth";
import { message } from "@/utils/message";

defineOptions({ name: "BusinessPropertyProjectTagManage" });

type ProjectTagRow = Record<string, unknown>;

function newDocumentId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

function resolveId(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "$oid" in raw) {
    return String((raw as { $oid: string }).$oid);
  }
  return String(raw);
}

const route = useRoute();
const router = useRouter();
const canWrite = hasPerms("admin:collection:write");

const projectId = computed(() => String(route.query.projectId ?? "").trim());
const projectName = ref(String(route.query.projectName ?? ""));

const tagState = reactive({
  loading: false,
  saving: false
});
const { onSortChange, sortParams } = useCollectionSort({
  sortBy: "sort_order",
  sortOrder: "desc"
});
const projectTags = ref<ProjectTagRow[]>([]);

const addDialogVisible = ref(false);
const addForm = reactive({
  tagId: "",
  tagName: "",
  category: "",
  sortOrder: 50
});

const editDialogVisible = ref(false);
const editForm = reactive({
  id: "",
  tagName: "",
  category: "",
  sortOrder: 50
});

async function ensureProjectContext() {
  if (!projectId.value) {
    message("缺少楼盘参数", { type: "warning" });
    await router.replace("/business/property-project/index");
    return false;
  }
  if (!projectName.value) {
    try {
      const res = await fetchRecord("mfm_property_project", projectId.value);
      projectName.value = String(
        res.data.document.project_name ?? "未命名楼盘"
      );
    } catch {
      projectName.value = "未命名楼盘";
    }
  }
  return true;
}

async function loadProjectTags() {
  if (!projectId.value) return;
  tagState.loading = true;
  try {
    const res = await fetchRecordsPage("mfm_property_project_tag", {
      currentPage: 1,
      pageSize: 200,
      filters: JSON.stringify({ project_id: projectId.value }),
      ...sortParams()
    });
    projectTags.value = res.data.list;
  } finally {
    tagState.loading = false;
  }
}

function goBack() {
  void router.push("/business/property-project/index");
}

function openAddTag() {
  addForm.tagId = "";
  addForm.tagName = "";
  addForm.category = "";
  addForm.sortOrder = 50;
  addDialogVisible.value = true;
}

function onAddTagPick(payload: { id: string; name: string; category: string }) {
  addForm.tagId = payload.id;
  addForm.tagName = payload.name;
  addForm.category = payload.category;
}

async function submitAddTag() {
  if (!addForm.tagId.trim()) {
    message("请选择标签", { type: "warning" });
    return;
  }
  if (projectTags.value.some(row => resolveId(row.tag_id) === addForm.tagId)) {
    message("该楼盘已绑定此标签", { type: "warning" });
    return;
  }

  tagState.saving = true;
  try {
    await saveRecord("mfm_property_project_tag", {
      _id: newDocumentId(),
      project_id: projectId.value,
      project_name: projectName.value,
      tag_id: addForm.tagId,
      tag_name: addForm.tagName,
      category: addForm.category,
      sort_order: addForm.sortOrder
    });
    message("已添加标签", { type: "success" });
    addDialogVisible.value = false;
    await loadProjectTags();
  } finally {
    tagState.saving = false;
  }
}

function openEditTag(row: ProjectTagRow) {
  editForm.id = resolveId(row._id);
  editForm.tagName = String(row.tag_name ?? "");
  editForm.category = String(row.category ?? "");
  editForm.sortOrder = Number(row.sort_order ?? 50);
  editDialogVisible.value = true;
}

async function submitEditTag() {
  const row = projectTags.value.find(r => resolveId(r._id) === editForm.id);
  if (!row) return;

  tagState.saving = true;
  try {
    await saveRecord(
      "mfm_property_project_tag",
      {
        ...row,
        project_id: projectId.value,
        project_name: projectName.value,
        sort_order: editForm.sortOrder
      },
      editForm.id
    );
    message("已更新排序", { type: "success" });
    editDialogVisible.value = false;
    await loadProjectTags();
  } finally {
    tagState.saving = false;
  }
}

async function removeTag(row: ProjectTagRow) {
  const docId = resolveId(row._id);
  const tagName = String(row.tag_name ?? docId);
  await ElMessageBox.confirm(
    `确认从「${projectName.value}」移除标签「${tagName}」？`,
    "删除确认",
    { type: "warning" }
  );
  await deleteRecord("mfm_property_project_tag", docId);
  message("已移除标签", { type: "success" });
  await loadProjectTags();
}

function tagCategoryType(category: string) {
  return tagCategoryTagMap[category]?.type ?? "info";
}

function onTagSortChange(payload: {
  prop: string;
  order: "ascending" | "descending" | null;
}) {
  onSortChange(payload);
  void loadProjectTags();
}

onMounted(async () => {
  if (await ensureProjectContext()) {
    await loadProjectTags();
  }
});
</script>

<template>
  <div class="project-tag-manage">
    <el-card shadow="never">
      <template #header>
        <div class="project-tag-manage__header">
          <div class="project-tag-manage__title-wrap">
            <el-button link type="primary" @click="goBack"
              >← 返回楼盘列表</el-button
            >
            <span class="project-tag-manage__title">{{ projectName }}</span>
            <span class="project-tag-manage__subtitle">标签管理</span>
          </div>
          <el-button v-if="canWrite" type="primary" @click="openAddTag">
            添加标签
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="tagState.loading"
        :data="projectTags"
        row-key="_id"
        border
        stripe
        :default-sort="{ prop: 'sort_order', order: 'descending' }"
        @sort-change="onTagSortChange"
      >
        <el-table-column
          prop="tag_name"
          label="标签"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag
              :type="tagCategoryType(String(row.category ?? ''))"
              size="small"
            >
              {{ tagCategoryLabel(String(row.category ?? "")) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="sort_order"
          label="排序"
          width="88"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column v-if="canWrite" label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditTag(row)">
              排序
            </el-button>
            <el-button link type="danger" @click="removeTag(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="project-tag-manage__footer">
        共 {{ projectTags.length }} 个标签
      </div>
    </el-card>

    <el-dialog
      v-model="addDialogVisible"
      title="添加标签"
      width="480px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="标签" required>
          <MfmTagSearch
            :tag-id="addForm.tagId"
            placeholder="搜索并选择标签"
            @pick="onAddTagPick"
          />
        </el-form-item>
        <el-form-item v-if="addForm.category" label="分类">
          <el-tag :type="tagCategoryType(addForm.category)" size="small">
            {{ tagCategoryLabel(addForm.category) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="addForm.sortOrder"
            :min="0"
            :max="9999"
            controls-position="right"
          />
          <div class="project-tag-manage__hint">数字越大，展示越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="tagState.saving"
          @click="submitAddTag"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editDialogVisible"
      title="调整排序"
      width="420px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="标签">
          <span>{{ editForm.tagName }}</span>
        </el-form-item>
        <el-form-item label="分类">
          <el-tag :type="tagCategoryType(editForm.category)" size="small">
            {{ tagCategoryLabel(editForm.category) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="editForm.sortOrder"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="tagState.saving"
          @click="submitEditTag"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.project-tag-manage {
  padding: 16px;

  &__header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  &__title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__footer {
    margin-top: 12px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__hint {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
