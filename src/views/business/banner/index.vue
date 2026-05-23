<script setup lang="ts">
import CollectionCrudTable from "@/components/busi/CollectionCrudTable.vue";
import { collectionPageConfigs } from "@/config/business-modules";

defineOptions({ name: "BusinessBanner" });

const config = collectionPageConfigs.mfm_banner;
</script>

<template>
  <CollectionCrudTable
    collection="mfm_banner"
    :title="config.title"
    :search-placeholder="config.searchPlaceholder"
    :columns="config.columns"
  />
</template>
