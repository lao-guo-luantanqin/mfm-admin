<script setup lang="ts">
import { ref, watch } from "vue";
import { fetchRecord, fetchRecordsPage } from "@/api/admin/collections";

defineOptions({ name: "MfmProjectSearch" });

type ProjectSuggestion = {
  value: string;
  id: string;
  district: string;
};

const props = defineProps<{
  projectId?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:projectId": [value: string];
}>();

const query = ref("");
const loading = ref(false);

async function loadProjectLabel(id: string) {
  if (!id.trim()) {
    query.value = "";
    return;
  }
  loading.value = true;
  try {
    const res = await fetchRecord("mfm_property_project", id.trim());
    query.value = String(res.data.document.project_name ?? "");
  } catch {
    query.value = "";
  } finally {
    loading.value = false;
  }
}

function searchProjects(
  queryString: string,
  cb: (results: ProjectSuggestion[]) => void
) {
  void (async () => {
    loading.value = true;
    try {
      const res = await fetchRecordsPage("mfm_property_project", {
        currentPage: 1,
        pageSize: 15,
        keyword: queryString.trim() || undefined
      });
      cb(
        res.data.list.map(row => ({
          value: String(row.project_name ?? "未命名"),
          id: String(row._id ?? ""),
          district: String(row.district_name ?? "")
        }))
      );
    } catch {
      cb([]);
    } finally {
      loading.value = false;
    }
  })();
}

function onSelect(item: ProjectSuggestion) {
  emit("update:projectId", item.id);
  query.value = item.value;
}

function onClear() {
  query.value = "";
  emit("update:projectId", "");
}

function onBlur() {
  if (props.projectId?.trim()) {
    void loadProjectLabel(props.projectId);
  }
}

watch(
  () => props.projectId,
  id => {
    void loadProjectLabel(id ?? "");
  },
  { immediate: true }
);
</script>

<template>
  <el-autocomplete
    v-model="query"
    class="mfm-project-search"
    :fetch-suggestions="searchProjects"
    :placeholder="placeholder ?? '输入项目名称搜索'"
    :trigger-on-focus="true"
    :debounce="300"
    clearable
    value-key="value"
    @select="onSelect"
    @clear="onClear"
    @blur="onBlur"
  >
    <template #default="{ item }">
      <div class="mfm-project-search__option">
        <span class="mfm-project-search__name">{{ item.value }}</span>
        <span v-if="item.district" class="mfm-project-search__meta">
          {{ item.district }}
        </span>
      </div>
    </template>
  </el-autocomplete>
</template>

<style scoped lang="scss">
.mfm-project-search {
  width: 100%;
}

.mfm-project-search__option {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.mfm-project-search__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mfm-project-search__meta {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
