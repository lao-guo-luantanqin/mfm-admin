<script setup lang="ts">
import { computed } from "vue";
import { fetchRecordsPage } from "@/api/admin/collections";

defineOptions({ name: "MfmProjectNameSuggest" });

type ProjectSuggestion = {
  value: string;
  id: string;
  district: string;
};

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const query = computed({
  get: () => props.modelValue ?? "",
  set: value => emit("update:modelValue", value)
});

function searchProjects(
  queryString: string,
  cb: (results: ProjectSuggestion[]) => void
) {
  void (async () => {
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
    }
  })();
}

function onSelect(item: ProjectSuggestion) {
  emit("update:modelValue", item.value);
}
</script>

<template>
  <el-autocomplete
    v-model="query"
    class="mfm-project-name-suggest"
    :fetch-suggestions="searchProjects"
    :placeholder="placeholder ?? '输入项目名称，可参考已有楼盘'"
    :trigger-on-focus="true"
    :debounce="300"
    clearable
    value-key="value"
    @select="onSelect"
  >
    <template #default="{ item }">
      <div class="mfm-project-name-suggest__option">
        <span class="mfm-project-name-suggest__name">{{ item.value }}</span>
        <span v-if="item.district" class="mfm-project-name-suggest__meta">
          {{ item.district }}
        </span>
      </div>
    </template>
  </el-autocomplete>
</template>

<style scoped lang="scss">
.mfm-project-name-suggest {
  width: 100%;
}

.mfm-project-name-suggest__option {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.mfm-project-name-suggest__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mfm-project-name-suggest__meta {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
