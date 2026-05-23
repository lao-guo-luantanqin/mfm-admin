<script setup lang="ts">
import CollectionCrudTable from "@/components/busi/CollectionCrudTable.vue";
import { collectionPageConfigs } from "@/config/business-modules";

defineOptions({ name: "BusinessPropertyProject" });

const config = collectionPageConfigs.mfm_property_project;
</script>

<template>
  <CollectionCrudTable
    collection="mfm_property_project"
    :title="config.title"
    :search-placeholder="config.searchPlaceholder"
    :columns="config.columns"
  />
</template>
