import { http } from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    avatar: string;
    username: string;
    nickname: string;
    roles: Array<string>;
    permissions: Array<string>;
    accessToken: string;
    refreshToken: string;
    expires: Date | string | number;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expires: Date | string | number;
  };
};

/** 管理端登录 — 一次返回 pure-admin ``setToken`` 所需字段 */
export const getLogin = (data?: { username: string; password: string }) => {
  return http.request<UserResult>("post", "/admin/auth/login", { data });
};

/** 开发环境虚拟登录 */
export const getDevLogin = (openid = "mfm-admin-dev") => {
  return http.request<UserResult>("post", "/admin/auth/dev-login", {
    data: { openid }
  });
};

/** 管理端 refresh token 续期 */
export const refreshTokenApi = (data?: { refreshToken: string }) => {
  return http.request<RefreshTokenResult>("post", "/admin/auth/refresh", {
    data
  });
};
