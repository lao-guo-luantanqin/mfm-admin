import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

/** 后端动态菜单 — 契约对齐 pure-admin ``getAsyncRoutes`` */
export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/admin/menus");
};
