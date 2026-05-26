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
import {
  collectionPageConfigs,
  type CollectionFilterDef
} from "@/config/business-modules";
import {
  useCollectionSort,
  type CollectionSortDefaults
} from "@/composables/useCollectionSort";
import { useCollectionFilters } from "@/composables/useCollectionFilters";

function newDocumentId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export type UseCollectionCrudOptions = {
  sortDefaults?: CollectionSortDefaults;
  filters?: CollectionFilterDef[];
  initialFilters?: Record<string, string | number | boolean | undefined>;
  /** 始终参与查询、不可在筛选栏重置的固定条件（如楼盘上下文 project_id） */
  lockedFilters?: Record<string, string | number | boolean | undefined>;
  /** 新建文档时预填字段 */
  createDefaults?: Record<string, unknown>;
};

export function useCollectionCrud(
  collection: string,
  options: UseCollectionCrudOptions = {}
) {
  const formConfig = getCollectionFormConfig(collection);
  const pageConfig = collectionPageConfigs[collection];
  const filterDefs = options.filters ?? pageConfig?.filters ?? [];
  const sortDefaults = options.sortDefaults ?? pageConfig?.defaultSort;

  const { sortState, onSortChange, sortParams } =
    useCollectionSort(sortDefaults);
  const {
    values: filterValues,
    resetFilters,
    filterParams
  } = useCollectionFilters(filterDefs);

  if (options.initialFilters) {
    Object.assign(filterValues, options.initialFilters);
  }

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
      const activeFilters = {
        ...filterParams(),
        ...(options.lockedFilters ?? {})
      };
      const res = await fetchRecordsPage(collection, {
        currentPage: state.page,
        pageSize: state.pageSize,
        keyword: state.keyword.trim() || undefined,
        filters:
          Object.keys(activeFilters).length > 0
            ? JSON.stringify(activeFilters)
            : undefined,
        ...sortParams()
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
      formData.value = {
        ...(formConfig.defaults ?? {}),
        ...(options.createDefaults ?? {})
      };
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
    void loadList();
  }

  function onFilterSearch() {
    onSearch();
  }

  function onFilterReset() {
    resetFilters();
    onSearch();
  }

  function handleSortChange(payload: {
    prop: string;
    order: "ascending" | "descending" | null;
  }) {
    onSortChange(payload);
    state.page = 1;
    void loadList();
  }

  return {
    formConfig,
    pageConfig,
    filterDefs,
    filterValues,
    state,
    rows,
    sortState,
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
    onSearch,
    onFilterSearch,
    onFilterReset,
    handleSortChange
  };
}
