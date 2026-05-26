<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  CollectionFormConfig,
  CollectionFormField
} from "@/config/collection-forms";
import MfmImageUpload from "@/components/busi/MfmImageUpload.vue";
import MfmGeoPointPicker from "@/components/busi/MfmGeoPointPicker.vue";
import MfmProjectSearch from "@/components/busi/MfmProjectSearch.vue";
import MfmProjectNameSuggest from "@/components/busi/MfmProjectNameSuggest.vue";
import MfmTagSearch from "@/components/busi/MfmTagSearch.vue";

defineOptions({ name: "CollectionFormDialog" });

const props = defineProps<{
  visible: boolean;
  title: string;
  config: CollectionFormConfig;
  modelValue: Record<string, unknown>;
  docId?: string | null;
  saving?: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  "update:modelValue": [value: Record<string, unknown>];
  save: [];
}>();

const formRef = ref();

const dialogVisible = computed({
  get: () => props.visible,
  set: v => emit("update:visible", v)
});

const form = computed({
  get: () => props.modelValue,
  set: v => emit("update:modelValue", v)
});

function setField(prop: string, value: unknown) {
  emit("update:modelValue", { ...props.modelValue, [prop]: value });
}

function onProjectPick(
  field: CollectionFormField,
  payload: string | { id: string; name: string }
) {
  const picked =
    typeof payload === "string" ? { id: payload, name: "" } : payload;
  if (field.bindProp) {
    setField(field.bindProp, picked.id);
  }
  if (field.bindProp === "project_id" && picked.name) {
    setField("project_name", picked.name);
  }
}

function onTagPick(
  field: CollectionFormField,
  payload: { id: string; name: string; category: string }
) {
  if (field.bindProp) {
    setField(field.bindProp, payload.id);
  }
  if (payload.name) {
    setField("tag_name", payload.name);
  }
  if (payload.category) {
    setField("category", payload.category);
  }
}

/** 虚拟字段不参与 Element Plus 内置校验，改由 validateFormData 处理 */
function formItemProp(field: CollectionFormField): string | undefined {
  if (
    field.type === "project-search" ||
    field.type === "tag-search" ||
    field.type === "doc-id" ||
    field.type === "geo-point"
  ) {
    return undefined;
  }
  return field.prop;
}

function fieldRowKey(field: CollectionFormField, index: number): string {
  return `${field.type}-${field.prop}-${field.label}-${index}`;
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      formRef.value?.clearValidate?.();
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="920px"
    destroy-on-close
    class="collection-form-dialog"
    top="4vh"
  >
    <div class="collection-form-dialog__body">
      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        label-position="top"
      >
        <section
          v-for="section in config.sections"
          :key="section.title"
          class="collection-form-dialog__section"
        >
          <h4 class="collection-form-dialog__section-title">
            {{ section.title }}
          </h4>
          <el-row :gutter="16">
            <el-col
              v-for="(field, fieldIndex) in section.fields"
              :key="fieldRowKey(field, fieldIndex)"
              :span="field.span ?? 24"
            >
              <el-form-item
                :label="field.label"
                :prop="formItemProp(field)"
                :required="field.required"
              >
                <MfmImageUpload
                  v-if="field.type === 'image'"
                  :model-value="form[field.prop]"
                  :storage="field.storage!"
                  :doc-id="docId"
                  :project-id="
                    field.uploadDeps?.projectId
                      ? String(form[field.uploadDeps.projectId] ?? '')
                      : undefined
                  "
                  :category="
                    field.uploadDeps?.category
                      ? String(form[field.uploadDeps.category] ?? '')
                      : undefined
                  "
                  value-mode="string"
                  :hint="field.hint"
                  @update:model-value="setField(field.prop, $event)"
                />
                <MfmImageUpload
                  v-else-if="field.type === 'image-object'"
                  :model-value="form[field.prop]"
                  :storage="field.storage!"
                  value-mode="object"
                  :hint="field.hint"
                  @update:model-value="setField(field.prop, $event)"
                />
                <MfmProjectSearch
                  v-else-if="field.type === 'project-search'"
                  :project-id="
                    field.bindProp
                      ? String(form[field.bindProp] ?? '')
                      : undefined
                  "
                  :placeholder="field.placeholder"
                  @pick="onProjectPick(field, $event)"
                />
                <MfmTagSearch
                  v-else-if="field.type === 'tag-search'"
                  :tag-id="
                    field.bindProp
                      ? String(form[field.bindProp] ?? '')
                      : undefined
                  "
                  :placeholder="field.placeholder"
                  @pick="onTagPick(field, $event)"
                />
                <MfmProjectNameSuggest
                  v-else-if="field.type === 'project-name-suggest'"
                  :model-value="String(form[field.prop] ?? '')"
                  :placeholder="field.placeholder"
                  @update:model-value="setField(field.prop, $event)"
                />
                <el-input
                  v-else-if="field.type === 'doc-id'"
                  :model-value="docId ?? String(form._id ?? '')"
                  :placeholder="field.placeholder"
                  disabled
                />
                <el-input
                  v-else-if="field.type === 'text'"
                  :model-value="String(form[field.prop] ?? '')"
                  :placeholder="field.placeholder"
                  :disabled="field.disabled"
                  @update:model-value="setField(field.prop, $event)"
                />
                <el-input
                  v-else-if="field.type === 'textarea'"
                  type="textarea"
                  :rows="3"
                  :model-value="String(form[field.prop] ?? '')"
                  :placeholder="field.placeholder"
                  @update:model-value="setField(field.prop, $event)"
                />
                <el-input-number
                  v-else-if="field.type === 'number'"
                  :model-value="
                    form[field.prop] === null || form[field.prop] === undefined
                      ? undefined
                      : Number(form[field.prop])
                  "
                  :placeholder="field.placeholder"
                  :disabled="field.disabled"
                  controls-position="right"
                  class="collection-form-dialog__number"
                  @update:model-value="setField(field.prop, $event)"
                />
                <el-select
                  v-else-if="field.type === 'select'"
                  :model-value="form[field.prop]"
                  :disabled="field.disabled"
                  class="collection-form-dialog__select"
                  @update:model-value="setField(field.prop, $event)"
                >
                  <el-option
                    v-for="opt in field.options"
                    :key="String(opt.value)"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-select
                  v-else-if="field.type === 'multi-select'"
                  :model-value="
                    Array.isArray(form[field.prop]) ? form[field.prop] : []
                  "
                  :disabled="field.disabled"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  class="collection-form-dialog__select"
                  @update:model-value="setField(field.prop, $event)"
                >
                  <el-option
                    v-for="opt in field.options"
                    :key="String(opt.value)"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-date-picker
                  v-else-if="field.type === 'date'"
                  :model-value="
                    form[field.prop] ? String(form[field.prop]) : ''
                  "
                  type="date"
                  value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                  :placeholder="field.placeholder ?? '选择日期'"
                  :disabled="field.disabled"
                  class="collection-form-dialog__date"
                  @update:model-value="setField(field.prop, $event)"
                />
                <el-input
                  v-else-if="
                    field.type === 'string-list' || field.type === 'number-list'
                  "
                  :model-value="String(form[field.prop] ?? '')"
                  :placeholder="field.placeholder"
                  :disabled="field.disabled"
                  @update:model-value="setField(field.prop, $event)"
                />
                <MfmGeoPointPicker
                  v-else-if="field.type === 'geo-point'"
                  :model-value="
                    (form[field.prop] as { lng?: number; lat?: number }) ?? {}
                  "
                  city="济南"
                  :hint="field.hint"
                  @update:model-value="setField(field.prop, $event)"
                />
                <div
                  v-else-if="field.type === 'switch'"
                  class="collection-form-dialog__switch"
                >
                  <el-switch
                    :model-value="Boolean(form[field.prop])"
                    @update:model-value="setField(field.prop, $event)"
                  />
                  <span class="collection-form-dialog__switch-hint">
                    {{ form[field.prop] ? "在线展示中" : "暂存/下线" }}
                  </span>
                </div>
                <p
                  v-if="
                    field.hint &&
                    field.type !== 'geo-point' &&
                    field.type !== 'image' &&
                    field.type !== 'image-object'
                  "
                  class="collection-form-dialog__hint"
                >
                  {{ field.hint }}
                </p>
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="emit('save')">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.collection-form-dialog {
  &__body {
    max-height: 72vh;
    padding-right: 4px;
    overflow-y: auto;
  }

  &__section {
    margin-bottom: 8px;

    & + & {
      padding-top: 16px;
      margin-top: 20px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  &__section-title {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__number,
  &__select,
  &__date {
    width: 100%;
  }

  &__hint {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }

  &__switch {
    display: flex;
    gap: 12px;
    align-items: center;
    min-height: 32px;
  }

  &__switch-hint {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
</style>
