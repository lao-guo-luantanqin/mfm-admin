<script setup lang="ts">
import type { CollectionFilterDef } from "@/config/business-modules";
import type { CollectionFilterValues } from "@/composables/useCollectionFilters";
import MfmProjectSearch from "@/components/busi/MfmProjectSearch.vue";

defineOptions({ name: "CollectionFilterBar" });

const props = defineProps<{
  filters: CollectionFilterDef[];
  modelValue: CollectionFilterValues;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: CollectionFilterValues];
  search: [];
  reset: [];
}>();

function setField(prop: string, value: string | number | boolean | undefined) {
  emit("update:modelValue", {
    ...props.modelValue,
    [prop]: value === "" || value === null ? undefined : value
  });
}

function onSearchClick() {
  emit("search");
}

function onResetClick() {
  emit("reset");
}
</script>

<template>
  <div v-if="filters.length" class="collection-filter-bar">
    <template v-for="field in filters" :key="field.prop">
      <el-select
        v-if="field.type === 'select'"
        :model-value="modelValue[field.prop]"
        clearable
        :placeholder="field.label"
        class="collection-filter-bar__item"
        @update:model-value="v => setField(field.prop, v ?? undefined)"
      >
        <el-option
          v-for="opt in field.options"
          :key="String(opt.value)"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-input
        v-else-if="field.type === 'text'"
        :model-value="String(modelValue[field.prop] ?? '')"
        clearable
        :placeholder="field.label"
        class="collection-filter-bar__item"
        @update:model-value="v => setField(field.prop, v || undefined)"
        @keyup.enter="onSearchClick"
      />

      <div
        v-else-if="field.type === 'boolean'"
        class="collection-filter-bar__switch"
      >
        <span class="collection-filter-bar__switch-label">{{
          field.label
        }}</span>
        <el-select
          :model-value="
            modelValue[field.prop] === undefined
              ? undefined
              : modelValue[field.prop]
                ? '1'
                : '0'
          "
          clearable
          placeholder="全部"
          class="collection-filter-bar__item collection-filter-bar__item--narrow"
          @update:model-value="
            v =>
              setField(
                field.prop,
                v === undefined || v === null ? undefined : v === '1'
              )
          "
        >
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </div>

      <MfmProjectSearch
        v-else-if="field.type === 'project'"
        :project-id="String(modelValue[field.prop] ?? '')"
        :placeholder="field.label"
        class="collection-filter-bar__item collection-filter-bar__item--wide"
        @update:project-id="v => setField(field.prop, v || undefined)"
      />
    </template>

    <el-button @click="onResetClick">重置</el-button>
    <el-button type="primary" @click="onSearchClick">筛选</el-button>
  </div>
</template>

<style scoped lang="scss">
.collection-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;

  &__item {
    width: 160px;

    &--narrow {
      width: 100px;
    }

    &--wide {
      width: 220px;
    }
  }

  &__switch {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__switch-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }
}
</style>
