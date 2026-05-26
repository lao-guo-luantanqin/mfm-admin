import { http } from "@/utils/http";

export type CollectionMeta = {
  name: string;
  label: string;
};

export type RecordsPage = {
  list: Array<Record<string, unknown>>;
  total: number;
  pageSize: number;
  currentPage: number;
};

type ApiResult<T> = { success: boolean; data: T };

export const fetchCollectionMeta = () => {
  return http.request<ApiResult<CollectionMeta[]>>("get", "/admin/collections");
};

export const fetchRecordsPage = (
  collection: string,
  params: {
    currentPage: number;
    pageSize: number;
    keyword?: string;
    filters?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) => {
  return http.request<ApiResult<RecordsPage>>(
    "get",
    `/admin/collections/${encodeURIComponent(collection)}/records`,
    { params }
  );
};

export const fetchRecord = (collection: string, docId: string) => {
  return http.request<ApiResult<{ document: Record<string, unknown> }>>(
    "get",
    `/admin/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(docId)}`
  );
};

export const deleteRecord = (collection: string, docId: string) => {
  return http.request<ApiResult<{ ok: boolean }>>(
    "delete",
    `/admin/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(docId)}`
  );
};

export const saveRecord = (
  collection: string,
  document: Record<string, unknown>,
  docId?: string
) => {
  if (docId) {
    return http.request<ApiResult<{ document: Record<string, unknown> }>>(
      "put",
      `/admin/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(docId)}`,
      { data: { document } }
    );
  }
  return http.request<ApiResult<{ document: Record<string, unknown> }>>(
    "post",
    `/admin/collections/${encodeURIComponent(collection)}/records`,
    { data: { document } }
  );
};
