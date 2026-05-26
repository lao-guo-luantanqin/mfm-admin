<script setup lang="ts">
import { computed, onMounted } from "vue";
import { collectionPageConfigs } from "@/config/business-modules";
import { useCollectionCrud } from "@/composables/useCollectionCrud";
import CollectionFormDialog from "@/components/busi/CollectionFormDialog.vue";
import CollectionFilterBar from "@/components/busi/CollectionFilterBar.vue";
import { resolveImageUrl } from "@/utils/media/qiniu-upload";
import { hasPerms } from "@/utils/auth";
import type { CollectionFilterDef } from "@/config/business-modules";

defineOptions({ name: "CollectionCrudTable" });

const props = defineProps<{
  collection: string;
  filters?: CollectionFilterDef[];
  initialFilters?: Record<string, string | number | boolean | undefined>;
  lockedFilters?: Record<string, string | number | boolean | undefined>;
  createDefaults?: Record<string, unknown>;
  hideColumns?: string[];
  actionsWidth?: number;
  /** 嵌入子页时隐藏标题并收紧顶栏 */
  embedded?: boolean;
}>();

const pageConfig = computed(() => collectionPageConfigs[props.collection]);

const {
  formConfig,
  filterDefs,
  filterValues,
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
  onSearch,
  onFilterSearch,
  onFilterReset,
  handleSortChange
} = useCollectionCrud(props.collection, {
  filters: props.filters,
  initialFilters: props.initialFilters,
  lockedFilters: props.lockedFilters,
  createDefaults: props.createDefaults
});

const canWrite = hasPerms("admin:collection:write");
const columns = computed(() => {
  const all = pageConfig.value?.columns ?? [];
  if (!props.hideColumns?.length) return all;
  const hidden = new Set(props.hideColumns);
  return all.filter(col => !hidden.has(col.prop));
});
const title = computed(() => pageConfig.value?.title ?? props.collection);
const searchPlaceholder = computed(
  () => pageConfig.value?.searchPlaceholder ?? "关键词"
);

function cellText(
  row: Record<string, unknown>,
  col: (typeof columns.value)[number]
): string {
  const raw = row[col.prop];
  if (raw == null || raw === "") return "—";
  if (col.type === "boolean") return raw ? "是" : "否";
  if (col.type === "tag" && col.tagMap && typeof raw === "string") {
    return col.tagMap[raw]?.label ?? raw;
  }
  return String(raw);
}

function tagType(
  row: Record<string, unknown>,
  col: (typeof columns.value)[number]
) {
  const raw = row[col.prop];
  if (col.type === "tag" && col.tagMap && typeof raw === "string") {
    return col.tagMap[raw]?.type ?? "info";
  }
  return "info" as const;
}

function imageUrl(
  row: Record<string, unknown>,
  col: (typeof columns.value)[number]
): string {
  return resolveImageUrl(row[col.prop]);
}

onMounted(() => {
  void loadList();
});
</script>

<template>
  <div
    class="collection-crud"
    :class="{ 'collection-crud--embedded': embedded }"
  >
    <el-card shadow="never">
      <template #header>
        <div class="collection-crud__header">
          <span v-if="!embedded" class="collection-crud__title">{{
            title
          }}</span>
          <el-input
            v-model="state.keyword"
            clearable
            :placeholder="searchPlaceholder"
            class="collection-crud__search"
            @keyup.enter="onSearch"
            @clear="onSearch"
          />
          <el-button type="primary" :loading="state.loading" @click="onSearch">
            查询
          </el-button>
          <el-button v-if="canWrite" type="success" @click="openCreate">
            新建
          </el-button>
        </div>
      </template>

      <CollectionFilterBar
        v-if="filterDefs.length"
        :model-value="filterValues"
        :filters="filterDefs"
        @update:model-value="patch => Object.assign(filterValues, patch)"
        @search="onFilterSearch"
        @reset="onFilterReset"
      />

      <el-table
        v-loading="state.loading"
        :data="rows"
        border
        stripe
        @sort-change="handleSortChange"
      >
        <el-table-column
          prop="_id"
          label="_id"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :sortable="col.sortable ? 'custom' : false"
          :sort-orders="col.sortable ? ['descending', 'ascending'] : undefined"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-image
              v-if="col.type === 'image' && imageUrl(row, col)"
              :src="imageUrl(row, col)"
              fit="cover"
              class="collection-crud__thumb"
              :preview-src-list="[imageUrl(row, col)]"
              preview-teleported
            />
            <span v-else-if="col.type === 'image'">—</span>
            <el-tag
              v-else-if="col.type === 'tag'"
              :type="tagType(row, col)"
              size="small"
            >
              {{ cellText(row, col) }}
            </el-tag>
            <el-tag
              v-else-if="col.type === 'boolean'"
              :type="row[col.prop] ? 'success' : 'info'"
              size="small"
            >
              {{ cellText(row, col) }}
            </el-tag>
            <span v-else>{{ cellText(row, col) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="canWrite || $slots.actions"
          label="操作"
          :width="actionsWidth ?? (canWrite ? 160 : 120)"
          fixed="right"
        >
          <template #default="{ row }">
            <slot name="actions" :row="row" />
            <el-button
              v-if="canWrite"
              link
              type="primary"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canWrite"
              link
              type="danger"
              @click="removeRow(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="collection-crud__pager">
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

    <CollectionFormDialog
      v-if="formConfig"
      v-model:visible="dialogVisible"
      v-model="formData"
      :title="dialogTitle"
      :config="formConfig"
      :doc-id="editingId"
      :saving="state.saving"
      @save="saveDocument"
    />

    <el-dialog
      v-else
      v-model="dialogVisible"
      :title="dialogTitle"
      width="720px"
    >
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

<style scoped lang="scss">
.collection-crud {
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

  &__search {
    width: 260px;
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__thumb {
    width: 56px;
    height: 56px;
    border-radius: 6px;
  }

  &--embedded {
    padding: 0;
  }
}
</style>
