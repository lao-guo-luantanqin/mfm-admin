<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus, Loading } from "@element-plus/icons-vue";
import type { ImageStorageKind } from "@/config/collection-forms";
import {
  bannerObjectKey,
  projectCoverObjectKey,
  projectImageObjectKey
} from "@/utils/storage/mfm-storage";
import {
  resolveImageUrl,
  uploadImageToQiniu
} from "@/utils/media/qiniu-upload";
import { message } from "@/utils/message";

defineOptions({ name: "MfmImageUpload" });

const props = withDefaults(
  defineProps<{
    modelValue: unknown;
    storage: ImageStorageKind;
    /** 编辑已有文档时的 _id（楼盘封面路径含 projectId） */
    docId?: string | null;
    /** project-image：关联楼盘 _id */
    projectId?: string;
    /** project-image：图片分类（中文） */
    category?: string;
    /** image=存 string URL；image-object=存 { url, name, extname } */
    valueMode?: "string" | "object";
    hint?: string;
  }>(),
  {
    valueMode: "string",
    docId: null,
    projectId: "",
    category: ""
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: unknown];
}>();

const uploading = ref(false);
const phaseText = ref("");

const previewUrl = computed(() => resolveImageUrl(props.modelValue));

const uploadBlockedReason = computed(() => {
  if (props.storage !== "project-image") return "";
  if (!props.projectId?.trim()) return "请先选择楼盘";
  if (!props.category?.trim()) return "请先选择图片分类";
  return "";
});

function resolveObjectKey(fileName: string): string {
  if (props.storage === "banner") {
    return bannerObjectKey(fileName);
  }
  if (props.storage === "project-image") {
    return projectImageObjectKey(
      fileName,
      props.projectId!.trim(),
      props.category!.trim()
    );
  }
  return projectCoverObjectKey(fileName, props.docId ?? undefined);
}

function beforeUpload(file: File) {
  if (!file.type.startsWith("image/")) {
    message("请选择图片文件", { type: "warning" });
    return false;
  }
  const block = uploadBlockedReason.value;
  if (block) {
    message(block, { type: "warning" });
    return false;
  }
  void doUpload(file);
  return false;
}

async function doUpload(file: File) {
  uploading.value = true;
  try {
    const result = await uploadImageToQiniu(
      file,
      resolveObjectKey(file.name),
      p => {
        phaseText.value = p === "compressing" ? "压缩中…" : "上传中…";
      }
    );
    if (props.valueMode === "object") {
      emit("update:modelValue", {
        url: result.url,
        name: result.name,
        extname: result.extname
      });
    } else {
      emit("update:modelValue", result.url);
    }
    message("图片上传成功", { type: "success" });
  } catch (err) {
    message(err instanceof Error ? err.message : "上传失败", { type: "error" });
  } finally {
    uploading.value = false;
    phaseText.value = "";
  }
}

function removeImage() {
  emit("update:modelValue", props.valueMode === "object" ? null : "");
}
</script>

<template>
  <div class="mfm-image-upload">
    <div v-if="previewUrl" class="mfm-image-upload__preview">
      <el-image :src="previewUrl" fit="cover" class="mfm-image-upload__img" />
      <div class="mfm-image-upload__actions">
        <el-upload
          :show-file-list="false"
          accept="image/*"
          :disabled="uploading || !!uploadBlockedReason"
          :before-upload="beforeUpload"
        >
          <el-button
            size="small"
            :disabled="uploading || !!uploadBlockedReason"
          >
            更换
          </el-button>
        </el-upload>
        <el-button size="small" type="danger" plain @click="removeImage">
          移除
        </el-button>
      </div>
    </div>
    <el-upload
      v-else
      class="mfm-image-upload__trigger"
      drag
      :show-file-list="false"
      accept="image/*"
      :disabled="uploading || !!uploadBlockedReason"
      :before-upload="beforeUpload"
    >
      <el-icon v-if="uploading" class="is-loading"><Loading /></el-icon>
      <el-icon v-else class="mfm-image-upload__plus"><Plus /></el-icon>
      <div class="el-upload__text">
        {{
          uploading ? phaseText : uploadBlockedReason || "拖拽或点击上传图片"
        }}
      </div>
    </el-upload>
    <p v-if="hint" class="mfm-image-upload__hint">{{ hint }}</p>
    <p v-if="uploadBlockedReason && !previewUrl" class="mfm-image-upload__warn">
      {{ uploadBlockedReason }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.mfm-image-upload {
  &__preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  &__img {
    width: 160px;
    height: 120px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__trigger {
    width: 100%;
  }

  &__plus {
    font-size: 28px;
    color: var(--el-text-color-secondary);
  }

  &__hint {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__warn {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--el-color-warning);
  }
}
</style>
