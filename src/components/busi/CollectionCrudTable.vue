<script setup lang="ts">
import { onMounted } from "vue";
import type { CollectionColumnDef } from "@/config/business-modules";
import { useCollectionCrud } from "@/composables/useCollectionCrud";
import CollectionFormDialog from "@/components/busi/CollectionFormDialog.vue";
import { resolveImageUrl } from "@/utils/media/qiniu-upload";
import { hasPerms } from "@/utils/auth";

defineOptions({ name: "CollectionCrudTable" });

const props = defineProps<{
  collection: string;
  title: string;
  searchPlaceholder?: string;
  columns: CollectionColumnDef[];
}>();

const {
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
} = useCollectionCrud(props.collection);

const canWrite = hasPerms("admin:collection:write");

function cellText(
  row: Record<string, unknown>,
  col: CollectionColumnDef
): string {
  const raw = resolveValue(row, col.prop);
  if (raw == null || raw === "") return "—";
  if (col.type === "boolean") return raw ? "是" : "否";
  if (col.type === "tag" && col.tagMap && typeof raw === "string") {
    return col.tagMap[raw]?.label ?? raw;
  }
  return String(raw);
}

function tagType(row: Record<string, unknown>, col: CollectionColumnDef) {
  const raw = resolveValue(row, col.prop);
  if (col.type === "tag" && col.tagMap && typeof raw === "string") {
    return col.tagMap[raw]?.type ?? "info";
  }
  return "info" as const;
}

function imageUrl(
  row: Record<string, unknown>,
  col: CollectionColumnDef
): string {
  return resolveImageUrl(resolveValue(row, col.prop));
}

function resolveValue(row: Record<string, unknown>, prop: string): unknown {
  return row[prop];
}

onMounted(() => {
  loadList();
});
</script>

<template>
  <div class="collection-crud">
    <el-card shadow="never">
      <template #header>
        <div class="collection-crud__header">
          <span class="collection-crud__title">{{ title }}</span>
          <el-input
            v-model="state.keyword"
            clearable
            :placeholder="searchPlaceholder ?? '关键词'"
            class="collection-crud__search"
            @keyup.enter="onSearch"
            @clear="onSearch"
          />
          <el-button type="primary" :loading="state.loading" @click="onSearch">
            查询
          </el-button>
          <el-button v-if="canWrite" type="success" @click="openCreate"
            >新建</el-button
          >
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
          v-for="col in columns"
          :key="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
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
              :type="resolveValue(row, col.prop) ? 'success' : 'info'"
              size="small"
            >
              {{ cellText(row, col) }}
            </el-tag>
            <span v-else>{{ cellText(row, col) }}</span>
          </template>
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
}
</style>
