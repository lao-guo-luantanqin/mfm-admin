import { http } from "@/utils/http";

type ApiResult<T> = { success: boolean; data: T };

export type AdminRole = {
  id: string;
  code: string;
  name: string;
  permissions: string[];
  description?: string | null;
  isSystem: boolean;
};

export type AdminRolePayload = {
  code: string;
  name: string;
  permissions: string[];
  description?: string | null;
};

export type AdminOperator = {
  id: string;
  email: string;
  isActive: boolean;
  isSuperuser: boolean;
  roleIds: string[];
  roles: AdminRole[];
};

export type OperatorsPage = {
  list: AdminOperator[];
  total: number;
  pageSize: number;
  currentPage: number;
};

export const PERM_ALL = "*:*:*";
export const PERM_ROLE_READ = "admin:role:read";
export const PERM_ROLE_WRITE = "admin:role:write";
export const PERM_USER_ROLE_READ = "admin:user:role:read";
export const PERM_USER_ROLE_WRITE = "admin:user:role:write";
export const PERM_COLLECTION_READ = "admin:collection:read";
export const PERM_COLLECTION_WRITE = "admin:collection:write";

export const PERMISSION_PRESETS = [
  PERM_ALL,
  PERM_ROLE_READ,
  PERM_ROLE_WRITE,
  PERM_USER_ROLE_READ,
  PERM_USER_ROLE_WRITE,
  PERM_COLLECTION_READ,
  PERM_COLLECTION_WRITE
];

export const fetchAdminRoles = () => {
  return http.request<ApiResult<AdminRole[]>>("get", "/admin/roles");
};

export const createAdminRole = (data: AdminRolePayload) => {
  return http.request<ApiResult<AdminRole>>("post", "/admin/roles", { data });
};

export const updateAdminRole = (roleId: string, data: AdminRolePayload) => {
  return http.request<ApiResult<AdminRole>>(
    "put",
    `/admin/roles/${encodeURIComponent(roleId)}`,
    { data }
  );
};

export const deleteAdminRole = (roleId: string) => {
  return http.request<ApiResult<null>>(
    "delete",
    `/admin/roles/${encodeURIComponent(roleId)}`
  );
};

export const fetchOperatorsPage = (params: {
  currentPage: number;
  pageSize: number;
  keyword?: string;
}) => {
  return http.request<ApiResult<OperatorsPage>>("get", "/admin/operators", {
    params
  });
};

export const setOperatorRoles = (userId: string, roleIds: string[]) => {
  return http.request<ApiResult<AdminOperator>>(
    "put",
    `/admin/operators/${encodeURIComponent(userId)}/roles`,
    { data: { roleIds } }
  );
};
