import { http } from "@/utils/http";

export type QiniuUploadToken = {
  uploadToken: string;
  bucket: string;
  objectKey: string;
  uploadUrl: string;
};

type ApiResult<T> = { success: boolean; data: T };

export function fetchQiniuUploadToken(objectKey: string) {
  return http.request<ApiResult<QiniuUploadToken>>(
    "post",
    "/media/qiniu/upload-token",
    { data: { objectKey: objectKey } }
  );
}
