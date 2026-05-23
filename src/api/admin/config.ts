import { http } from "@/utils/http";

export type ConfigMeta = {
  name: string;
  label: string;
};

export type ConfigRecordsPage = {
  list: Array<Record<string, unknown>>;
  total: number;
  pageSize: number;
  currentPage: number;
};

type ApiResult<T> = { success: boolean; data: T };

export const fetchConfigMeta = () => {
  return http.request<ApiResult<ConfigMeta[]>>("get", "/admin/config");
};

export const fetchConfigRecordsPage = (
  collection: string,
  params: { currentPage: number; pageSize: number; keyword?: string }
) => {
  return http.request<ApiResult<ConfigRecordsPage>>(
    "get",
    `/admin/config/${encodeURIComponent(collection)}/records`,
    { params }
  );
};

export const fetchConfigRecord = (collection: string, docId: string) => {
  return http.request<ApiResult<{ document: Record<string, unknown> }>>(
    "get",
    `/admin/config/${encodeURIComponent(collection)}/records/${encodeURIComponent(docId)}`
  );
};

export const deleteConfigRecord = (collection: string, docId: string) => {
  return http.request<ApiResult<{ ok: boolean }>>(
    "delete",
    `/admin/config/${encodeURIComponent(collection)}/records/${encodeURIComponent(docId)}`
  );
};

export const saveConfigRecord = (
  collection: string,
  document: Record<string, unknown>,
  docId?: string
) => {
  if (docId) {
    return http.request<ApiResult<{ document: Record<string, unknown> }>>(
      "put",
      `/admin/config/${encodeURIComponent(collection)}/records/${encodeURIComponent(docId)}`,
      { data: { document } }
    );
  }
  return http.request<ApiResult<{ document: Record<string, unknown> }>>(
    "post",
    `/admin/config/${encodeURIComponent(collection)}/records`,
    { data: { document } }
  );
};
