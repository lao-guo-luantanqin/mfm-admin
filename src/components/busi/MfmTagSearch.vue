<script setup lang="ts">
import { ref, watch } from "vue";
import { fetchRecord, fetchRecordsPage } from "@/api/admin/collections";

defineOptions({ name: "MfmTagSearch" });

export type TagSuggestion = {
  value: string;
  id: string;
  category: string;
};

const props = defineProps<{
  tagId?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:tagId": [value: string];
  pick: [payload: { id: string; name: string; category: string }];
}>();

const query = ref("");
const loading = ref(false);

async function loadTagLabel(id: string) {
  if (!id.trim()) {
    query.value = "";
    return;
  }
  loading.value = true;
  try {
    const res = await fetchRecord("mfm_property_tag", id.trim());
    query.value = String(res.data.document.name ?? "");
  } catch {
    query.value = "";
  } finally {
    loading.value = false;
  }
}

function searchTags(
  queryString: string,
  cb: (results: TagSuggestion[]) => void
) {
  void (async () => {
    loading.value = true;
    try {
      const res = await fetchRecordsPage("mfm_property_tag", {
        currentPage: 1,
        pageSize: 20,
        keyword: queryString.trim() || undefined
      });
      cb(
        res.data.list.map(row => ({
          value: String(row.name ?? "未命名"),
          id: String(row._id ?? ""),
          category: String(row.category ?? "")
        }))
      );
    } catch {
      cb([]);
    } finally {
      loading.value = false;
    }
  })();
}

function onSelect(item: TagSuggestion) {
  emit("update:tagId", item.id);
  emit("pick", {
    id: item.id,
    name: item.value,
    category: item.category
  });
  query.value = item.value;
}

function onClear() {
  query.value = "";
  emit("update:tagId", "");
  emit("pick", { id: "", name: "", category: "" });
}

function onBlur() {
  if (props.tagId?.trim()) {
    void loadTagLabel(props.tagId);
  }
}

watch(
  () => props.tagId,
  id => {
    void loadTagLabel(id ?? "");
  },
  { immediate: true }
);
</script>

<template>
  <el-autocomplete
    v-model="query"
    class="mfm-tag-search"
    :fetch-suggestions="searchTags"
    :placeholder="placeholder ?? '输入标签名称搜索'"
    :trigger-on-focus="true"
    :debounce="300"
    clearable
    value-key="value"
    @select="onSelect"
    @clear="onClear"
    @blur="onBlur"
  >
    <template #default="{ item }">
      <div class="mfm-tag-search__option">
        <span class="mfm-tag-search__name">{{ item.value }}</span>
        <span v-if="item.category" class="mfm-tag-search__meta">
          {{ item.category }}
        </span>
      </div>
    </template>
  </el-autocomplete>
</template>

<style scoped lang="scss">
.mfm-tag-search {
  width: 100%;
}

.mfm-tag-search__option {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.mfm-tag-search__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mfm-tag-search__meta {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
