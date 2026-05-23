import { reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  deleteRecord,
  fetchRecordsPage,
  saveRecord
} from "@/api/admin/collections";
import {
  formDataToDocument,
  getCollectionFormConfig,
  rowToFormData,
  validateFormData
} from "@/config/collection-forms";

function newDocumentId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export function useCollectionCrud(collection: string) {
  const formConfig = getCollectionFormConfig(collection);

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
  const dialogTitle = ref("编辑文档");
  const editorText = ref("");
  const formData = ref<Record<string, unknown>>({});
  const editingId = ref<string | null>(null);
  const editingRow = ref<Record<string, unknown> | null>(null);

  async function loadList() {
    if (!collection) return;
    state.loading = true;
    try {
      const res = await fetchRecordsPage(collection, {
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
    dialogTitle.value = "新建";
    editingId.value = null;
    editingRow.value = null;
    if (formConfig) {
      formData.value = { ...(formConfig.defaults ?? {}) };
      editorText.value = "";
    } else {
      editorText.value = "{\n  \n}";
    }
    dialogVisible.value = true;
  }

  function openEdit(row: Record<string, unknown>) {
    dialogTitle.value = "编辑";
    editingId.value = String(row._id ?? "");
    editingRow.value = { ...row };
    if (formConfig) {
      formData.value = rowToFormData(row, formConfig);
      editorText.value = "";
    } else {
      editorText.value = JSON.stringify(row, null, 2);
    }
    dialogVisible.value = true;
  }

  async function saveDocument() {
    let parsed: Record<string, unknown>;

    if (formConfig) {
      const err = validateFormData(formData.value, formConfig);
      if (err) {
        message(err, { type: "warning" });
        return;
      }
      const patch = formDataToDocument(formData.value, formConfig);
      parsed = editingRow.value
        ? { ...editingRow.value, ...patch }
        : { ...patch };
    } else {
      try {
        parsed = JSON.parse(editorText.value);
      } catch {
        message("JSON 格式无效", { type: "error" });
        return;
      }
    }

    if (editingId.value) {
      parsed._id = editingId.value;
    } else if (!parsed._id) {
      parsed._id = newDocumentId();
    }

    state.saving = true;
    try {
      await saveRecord(collection, parsed, editingId.value ?? undefined);
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
    await deleteRecord(collection, docId);
    message("已删除", { type: "success" });
    await loadList();
  }

  function onSearch() {
    state.page = 1;
    loadList();
  }

  return {
    formConfig,
    state,
    rows,
    dialogVisible,
    dialogTitle,
    editorText,
    formData,
    editingId,
    loadList,
    openCreate,
    openEdit,
    saveDocument,
    removeRow,
    onSearch
  };
}
