/** 对齐旧版 js_sdk/mfm-storage/storage-service.js · 七牛 object_key 路径规范 */

export type StoragePathParams = {
  module: string;
  sub?: string;
  fileName: string;
  businessId?: string;
};

function dateShard(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

function uniqueFileName(originalName: string): string {
  const parts = originalName.split(".");
  const ext = parts.length > 1 ? parts.pop()! : "jpg";
  const uniqueId = Math.random().toString(36).slice(2, 10);
  return `${uniqueId}_${Date.now()}.${ext}`;
}

export function buildObjectKey(
  params: StoragePathParams,
  env = "prod"
): string {
  const { module, sub, fileName, businessId } = params;
  const parts = ["mfm-assets", env, module];
  if (businessId) parts.push(businessId);
  if (sub) parts.push(sub);
  parts.push(dateShard(), uniqueFileName(fileName));
  return parts.join("/");
}

export function bannerObjectKey(fileName: string): string {
  return buildObjectKey({ module: "marketing", sub: "banners", fileName });
}

/** 配置库 ``asset_config`` 等站点静态图标/插画 */
export function staticAssetObjectKey(
  fileName: string,
  assetKey?: string
): string {
  const safeKey = (assetKey ?? "misc")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return buildObjectKey({
    module: "static",
    sub: safeKey || "misc",
    fileName
  });
}

export function projectCoverObjectKey(
  fileName: string,
  projectId?: string
): string {
  return buildObjectKey({
    module: "project",
    sub: "covers",
    fileName,
    businessId: projectId
  });
}

/** 图片分类 → 云存储英文目录（对齐旧版 mfm-property-project-image） */
export const PROJECT_IMAGE_CATEGORY_DIRS: Record<string, string> = {
  效果图: "rendition",
  实景图: "reality",
  样板间: "showroom",
  配套图: "facility",
  区位图: "location",
  户型图: "layout",
  总平图: "masterplan",
  板块图: "sector",
  规划许可证: "planning_permit",
  预售许可证: "presale_permit"
};

export function projectImageObjectKey(
  fileName: string,
  projectId: string,
  category: string
): string {
  const sub = PROJECT_IMAGE_CATEGORY_DIRS[category] ?? "other";
  return buildObjectKey({
    module: "project",
    businessId: projectId,
    sub,
    fileName
  });
}
