<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchRecord } from "@/api/admin/collections";
import CollectionCrudTable from "@/components/busi/CollectionCrudTable.vue";
import { projectImageManageFilters } from "@/config/business-modules";
import { message } from "@/utils/message";

defineOptions({ name: "BusinessPropertyProjectImageManage" });

const route = useRoute();
const router = useRouter();

const projectId = computed(() => String(route.query.projectId ?? "").trim());
const projectName = ref(String(route.query.projectName ?? ""));

const lockedFilters = computed(() => ({ project_id: projectId.value }));
const createDefaults = computed(() => ({ project_id: projectId.value }));

async function ensureProjectContext() {
  if (!projectId.value) {
    message("缺少楼盘参数", { type: "warning" });
    await router.replace("/business/property-project/index");
    return false;
  }
  if (!projectName.value) {
    try {
      const res = await fetchRecord("mfm_property_project", projectId.value);
      projectName.value = String(
        res.data.document.project_name ?? "未命名楼盘"
      );
    } catch {
      projectName.value = "未命名楼盘";
    }
  }
  return true;
}

function goBack() {
  void router.push("/business/property-project/index");
}

onMounted(async () => {
  await ensureProjectContext();
});
</script>

<template>
  <div class="project-image-manage">
    <el-card shadow="never" class="project-image-manage__context">
      <div class="project-image-manage__header">
        <div class="project-image-manage__title-wrap">
          <el-button link type="primary" @click="goBack"
            >← 返回楼盘列表</el-button
          >
          <span class="project-image-manage__title">{{ projectName }}</span>
          <span class="project-image-manage__subtitle">图片管理</span>
        </div>
      </div>
    </el-card>

    <CollectionCrudTable
      v-if="projectId"
      collection="mfm_property_project_image"
      :filters="projectImageManageFilters"
      :locked-filters="lockedFilters"
      :create-defaults="createDefaults"
      :hide-columns="['project_id']"
      embedded
    />
  </div>
</template>

<style scoped lang="scss">
.project-image-manage {
  padding: 16px;

  &__context {
    margin-bottom: 12px;
  }

  &__header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  &__title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
</style>
