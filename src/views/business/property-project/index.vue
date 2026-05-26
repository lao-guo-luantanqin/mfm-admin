<script setup lang="ts">
import { useRouter } from "vue-router";
import CollectionCrudTable from "@/components/busi/CollectionCrudTable.vue";

defineOptions({ name: "BusinessPropertyProject" });

const router = useRouter();

function resolveId(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "$oid" in raw) {
    return String((raw as { $oid: string }).$oid);
  }
  return String(raw);
}

function goManageTags(row: Record<string, unknown>) {
  void router.push({
    path: "/business/property-project-tag/manage",
    query: {
      projectId: resolveId(row._id),
      projectName: String(row.project_name ?? "")
    }
  });
}

function goManageImages(row: Record<string, unknown>) {
  void router.push({
    path: "/business/property-project-image/manage",
    query: {
      projectId: resolveId(row._id),
      projectName: String(row.project_name ?? "")
    }
  });
}
</script>

<template>
  <CollectionCrudTable collection="mfm_property_project" :actions-width="260">
    <template #actions="{ row }">
      <el-button link type="primary" @click="goManageImages(row)">
        图片
      </el-button>
      <el-button link type="primary" @click="goManageTags(row)">
        标签
      </el-button>
    </template>
  </CollectionCrudTable>
</template>
