<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  deleteRecord,
  fetchCollectionMeta,
  fetchRecordsPage,
  saveRecord,
  type CollectionMeta
} from "@/api/admin/collections";

defineOptions({ name: "BusinessCollections" });

const metaList = ref<CollectionMeta[]>([]);
const state = reactive({
  collection: "",
  keyword: "",
  page: 1,
  pageSize: 20,
  total: 0,
  loading: false,
  saving: false
});
const rows = ref<Array<Record<string, unknown>>>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("编辑文档");
const editorText = ref("");
const editingId = ref<string | null>(null);

const tableColumns = computed(() => {
  const sample = rows.value[0];
  if (!sample) return ["_id"];
  return [
    "_id",
    ...Object.keys(sample)
      .filter(k => k !== "_id")
      .slice(0, 4)
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

async function loadMeta() {
  const res = await fetchCollectionMeta();
  metaList.value = res.data;
  if (!state.collection && metaList.value.length) {
    state.collection = metaList.value[0].name;
  }
}

async function loadList() {
  if (!state.collection) return;
  state.loading = true;
  try {
    const res = await fetchRecordsPage(state.collection, {
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
  dialogTitle.value = "新建文档";
  editingId.value = null;
  editorText.value = "{\n  \n}";
  dialogVisible.value = true;
}

function openEdit(row: Record<string, unknown>) {
  dialogTitle.value = "编辑文档";
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
    await saveRecord(state.collection, parsed, editingId.value ?? undefined);
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
  await deleteRecord(state.collection, docId);
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

loadMeta();
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-medium">集合文档（高级）</span>
          <span class="text-sm text-gray-500">JSON 直编 · 白名单集合</span>
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
            placeholder="关键词"
            style="width: 240px"
            @keyup.enter="loadList"
          />
          <el-button type="primary" :loading="state.loading" @click="loadList">
            查询
          </el-button>
          <el-button type="success" @click="openCreate">新建</el-button>
        </div>
      </template>

      <el-table v-loading="state.loading" :data="rows" border stripe>
        <el-table-column
          v-for="col in tableColumns"
          :key="col"
          :label="col"
          min-width="140"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ previewCell(row[col]) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
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

      <div class="mt-4 flex justify-end">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <el-input v-model="editorText" type="textarea" :rows="18" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="state.saving" @click="saveDocument">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
