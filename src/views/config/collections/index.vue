<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  deleteConfigRecord,
  fetchConfigMeta,
  fetchConfigRecordsPage,
  saveConfigRecord,
  type ConfigMeta
} from "@/api/admin/config";
import { hasPerms } from "@/utils/auth";

defineOptions({ name: "ConfigCollections" });

const route = useRoute();
const metaList = ref<ConfigMeta[]>([]);
const state = reactive({
  collection: "page_config",
  keyword: "",
  page: 1,
  pageSize: 20,
  total: 0,
  loading: false,
  saving: false
});
const rows = ref<Array<Record<string, unknown>>>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("编辑配置");
const editorText = ref("");
const editingId = ref<string | null>(null);

const canWrite = hasPerms("admin:config:write");

const tableColumns = computed(() => {
  if (state.collection === "dict_config") {
    return ["dictKey", "entries"];
  }
  const sample = rows.value[0];
  if (!sample) return ["key"];
  return [
    "key",
    ...Object.keys(sample)
      .filter(k => !["_id", "key"].includes(k))
      .slice(0, 3)
  ];
});

function previewCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    const text = JSON.stringify(value);
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
  }
  return String(value);
}

function defaultJsonForCollection(collection: string): string {
  const templates: Record<string, Record<string, unknown>> = {
    global_config: { key: "default", style: {}, props: {} },
    page_config: { key: "home", props: {}, style: {}, sub: [] },
    component_config: {
      key: "exampleComponent",
      kind: "shell",
      props: {},
      style: {}
    },
    dict_config: { dictKey: "exampleDict", entries: [] },
    asset_config: {
      key: "example.asset",
      kind: "icon",
      url: "",
      tags: []
    }
  };
  return JSON.stringify(templates[collection] ?? {}, null, 2);
}

async function loadMeta() {
  const res = await fetchConfigMeta();
  metaList.value = res.data;
  const fromQuery = String(route.query.page ?? "");
  if (fromQuery && metaList.value.some(m => m.name === fromQuery)) {
    state.collection = fromQuery;
  } else if (
    !metaList.value.some(m => m.name === state.collection) &&
    metaList.value.length
  ) {
    state.collection = metaList.value[0].name;
  }
}

async function loadList() {
  if (!state.collection) return;
  state.loading = true;
  try {
    const res = await fetchConfigRecordsPage(state.collection, {
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
  dialogTitle.value = "新建配置";
  editingId.value = null;
  editorText.value = defaultJsonForCollection(state.collection);
  dialogVisible.value = true;
}

function openEdit(row: Record<string, unknown>) {
  dialogTitle.value = "编辑配置";
  editingId.value = String(row._id ?? "");
  editorText.value = JSON.stringify(row, null, 2);
  dialogVisible.value = true;
}

async function saveDocument() {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(editorText.value);
  } catch {
    message("JSON 格式无效", { type: "error" });
    return;
  }

  state.saving = true;
  try {
    await saveConfigRecord(
      state.collection,
      parsed,
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
  await ElMessageBox.confirm(`确认删除 _id=${docId}？`, "删除确认", {
    type: "warning"
  });
  await deleteConfigRecord(state.collection, docId);
  message("已删除", { type: "success" });
  await loadList();
}

watch(
  () => state.collection,
  () => {
    state.page = 1;
    loadList();
  }
);

onMounted(async () => {
  await loadMeta();
  await loadList();
});
</script>

<template>
  <div class="config-collections">
    <el-card shadow="never">
      <template #header>
        <div class="config-collections__header">
          <span class="config-collections__title">配置文档</span>
          <span class="text-sm text-gray-500">config_db · JSON 直编</span>
          <el-select v-model="state.collection" style="width: 240px">
            <el-option
              v-for="item in metaList"
              :key="item.name"
              :label="item.label"
              :value="item.name"
            />
          </el-select>
          <el-input
            v-model="state.keyword"
            clearable
            placeholder="按 key / dictKey 搜索"
            style="width: 240px"
            @keyup.enter="loadList"
            @clear="loadList"
          />
          <el-button type="primary" :loading="state.loading" @click="loadList">
            查询
          </el-button>
          <el-button v-if="canWrite" type="success" @click="openCreate">
            新建
          </el-button>
        </div>
      </template>

      <el-table v-loading="state.loading" :data="rows" border stripe>
        <el-table-column
          prop="_id"
          label="_id"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          v-for="col in tableColumns"
          :key="col"
          :label="col"
          min-width="140"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ previewCell(row[col]) }}</template>
        </el-table-column>
        <el-table-column v-if="canWrite" label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)"
              >编辑</el-button
            >
            <el-button link type="danger" @click="removeRow(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="config-collections__pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="state.total"
          :page-size="state.pageSize"
          :current-page="state.page"
          :page-sizes="[10, 20, 50]"
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-input v-model="editorText" type="textarea" :rows="20" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="state.saving" @click="saveDocument">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.config-collections {
  padding: 16px;

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  &__title {
    margin-right: 8px;
    font-weight: 600;
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
