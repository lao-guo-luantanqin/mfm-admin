import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import { getToken, formatToken, removeToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";

const rawBaseURL = (
  import.meta.env.VITE_SERVER_BASEURL as string | undefined
)?.trim();
const baseURL = rawBaseURL ? rawBaseURL.replace(/\/$/, "") : undefined;

const AUTH_WHITELIST = [
  "/admin/auth/login",
  "/admin/auth/dev-login",
  "/admin/auth/refresh"
];

const defaultConfig: AxiosRequestConfig = {
  baseURL: baseURL || undefined,
  timeout: 30000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  private static requests = [];
  private static isRefreshing = false;
  private static initConfig: PureHttpRequestConfig = {};
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }

        const url = config.url ?? "";
        if (AUTH_WHITELIST.some(item => url.includes(item))) {
          return config;
        }

        return new Promise(resolve => {
          const data = getToken();
          if (data?.accessToken) {
            const now = Date.now();
            const expired = Number(data.expires) - now <= 0;
            if (expired) {
              if (!PureHttp.isRefreshing) {
                PureHttp.isRefreshing = true;
                useUserStoreHook()
                  .handRefreshToken({ refreshToken: data.refreshToken })
                  .then(res => {
                    const token = res.data.accessToken;
                    config.headers = config.headers ?? {};
                    config.headers.Authorization = formatToken(token);
                    PureHttp.requests.forEach(cb => cb(token));
                    PureHttp.requests = [];
                  })
                  .catch(() => {
                    removeToken();
                    PureHttp.requests = [];
                  })
                  .finally(() => {
                    PureHttp.isRefreshing = false;
                  });
              }
              resolve(PureHttp.retryOriginalRequest(config));
            } else {
              config.headers = config.headers ?? {};
              config.headers.Authorization = formatToken(data.accessToken);
              resolve(config);
            }
          } else {
            resolve(config);
          }
        });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        const payload = response.data as
          | { success?: boolean; msg?: string; message?: string }
          | undefined;
        if (payload && payload.success === false) {
          const errText = payload.msg || payload.message || "请求失败";
          message(errText, { type: "error" });
          return Promise.reject(new Error(errText));
        }
        return response.data;
      },
      (error: PureHttpError) => {
        const payload = error.response?.data as
          | { msg?: string; message?: string }
          | undefined;
        const errText =
          payload?.msg ||
          payload?.message ||
          (error.response?.status === 404
            ? "接口不存在：请确认 mfm-api 已启动且端口与 VITE_API_PROXY_TARGET 一致"
            : "");
        if (errText) {
          message(errText, { type: "error" });
        } else if (!error.response) {
          message("无法连接后端，请确认 mfm-api 已启动", { type: "error" });
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          removeToken();
        }
        error.isCancelRequest = Axios.isCancel(error);
        return Promise.reject(error);
      }
    );
  }

  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();
