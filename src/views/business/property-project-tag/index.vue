<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

defineOptions({ name: "BusinessPropertyProjectTag" });

const router = useRouter();

onMounted(() => {
  void router.replace("/business/property-project/index");
});
</script>

<template>
  <div />
</template>
