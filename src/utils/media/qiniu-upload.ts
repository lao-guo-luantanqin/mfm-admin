import { fetchQiniuUploadToken } from "@/api/media/qiniu";
import { compressImage } from "./compress-image";

/** 七牛测试域名（*.hb-bkt.clouddn.com）备案前通常仅有 HTTP，HTTPS 证书未就绪 */
const QINIU_TEST_HOST_SUFFIX = "hb-bkt.clouddn.com";

/**
 * 规范化媒体公开 URL。
 * 测试域名强制 http，避免 el-image 因证书错误显示「加载失败」。
 */
export function normalizeMediaPublicUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (
    trimmed.includes(QINIU_TEST_HOST_SUFFIX) &&
    trimmed.toLowerCase().startsWith("https://")
  ) {
    return trimmed.replace(/^https:\/\//i, "http://");
  }
  return trimmed;
}

function cdnBase(): string {
  const raw = (import.meta.env.VITE_CDN_BASE_URL as string | undefined)?.trim();
  const base = raw
    ? raw.replace(/\/$/, "")
    : "http://tfh32mszr.hb-bkt.clouddn.com";
  return normalizeMediaPublicUrl(base);
}

export function publicUrlFromObjectKey(objectKey: string): string {
  return `${cdnBase()}/${objectKey.replace(/^\//, "")}`;
}

export type UploadImageResult = {
  url: string;
  objectKey: string;
  name: string;
  extname: string;
};

/** 压缩 → 取 token → 直传七牛 → 返回 CDN URL */
export async function uploadImageToQiniu(
  file: File,
  objectKey: string,
  onProgress?: (phase: "compressing" | "uploading") => void
): Promise<UploadImageResult> {
  onProgress?.("compressing");
  const compressed = await compressImage(file);
  onProgress?.("uploading");

  const tokenRes = await fetchQiniuUploadToken(objectKey);
  const cred = tokenRes.data;

  const body = new FormData();
  body.append("token", cred.uploadToken);
  body.append("key", cred.objectKey);
  body.append("file", compressed, compressed.name);

  const response = await fetch(cred.uploadUrl, { method: "POST", body });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `七牛上传失败 (${response.status})`);
  }

  const ext = compressed.name.split(".").pop() || "jpg";
  return {
    url: publicUrlFromObjectKey(cred.objectKey),
    objectKey: cred.objectKey,
    name: compressed.name,
    extname: ext
  };
}

/** 从 DB 值（string 或 { url }）提取展示 URL */
export function resolveImageUrl(value: unknown): string {
  if (typeof value === "string") {
    return normalizeMediaPublicUrl(value);
  }
  if (value && typeof value === "object" && "url" in value) {
    return normalizeMediaPublicUrl(
      String((value as { url?: string }).url ?? "")
    );
  }
  return "";
}
