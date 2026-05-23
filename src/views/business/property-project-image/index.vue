<script setup lang="ts">
import CollectionCrudTable from "@/components/busi/CollectionCrudTable.vue";
import { collectionPageConfigs } from "@/config/business-modules";

defineOptions({ name: "BusinessPropertyProjectImage" });

const config = collectionPageConfigs.mfm_property_project_image;
</script>

<template>
  <CollectionCrudTable
    collection="mfm_property_project_image"
    :title="config.title"
    :search-placeholder="config.searchPlaceholder"
    :columns="config.columns"
  />
</template>
