# mfm-admin

济南买房么 · 运营后台（[vue-pure-admin-thin](https://github.com/pure-admin/pure-admin-thin) + **mfm-api Admin 专用契约**）。

**Agent 入口**：[`AGENTS.md`](./AGENTS.md) · **文档门户**：[`doc/index.html`](./doc/index.html)

设计原则：**前端（pure-admin）定交互形态，后端 `/admin/*` 适配**，而不是让管理端去拼 C 端 JWT / sync-batch。

## 快速开始

```bash
# 1. 后端
cd ../mfm-api
# .env 中至少配置：
# MFM_API_SYNC_BATCH_ALLOWED_COLLECTIONS=mfm_property_project,mfm_banner
# MFM_API_ENVIRONMENT=dev
uv run -m mfm_api

# 2. 管理端
cd ../mfm-admin
cp .env.example .env.development.local
pnpm install
pnpm dev
```

打开 http://localhost:8848 ，开发环境可用「虚拟登录」。

> **虚拟登录失败？** ① compose 映射 **host:8001→container:8000**，`.env` 里**不要**设 `MFM_API_PORT=8001`（容器内须 8000）② `docker restart mfm-api` ③ `VITE_API_PROXY_TARGET=http://127.0.0.1:8001` 并重启 `pnpm dev`。

## Admin API（后端已为 pure-admin 适配）

| 用途                                     | 方法            | 路径                                       |
| ---------------------------------------- | --------------- | ------------------------------------------ |
| 登录（一次返回 token+roles+permissions） | POST            | `/admin/auth/login`                        |
| 开发虚拟登录                             | POST            | `/admin/auth/dev-login`                    |
| 当前会话                                 | GET             | `/admin/auth/me`                           |
| 动态菜单                                 | GET             | `/admin/menus`                             |
| 集合元数据                               | GET             | `/admin/collections`                       |
| 分页列表                                 | GET             | `/admin/collections/{name}/records`        |
| 新建/更新/删除                           | POST/PUT/DELETE | `/admin/collections/{name}/records[/{id}]` |

底层仍走 Mongo 白名单与 sync-batch，但对前端暴露 **REST + 分页** 形态。

## 前端改动要点（相对 pure-admin 原版）

- `api/user.ts` → `/admin/auth/login`
- `api/routes.ts` → `/admin/menus`
- `utils/http` → `VITE_SERVER_BASEURL`、关闭生产 mock
- 业务页 `views/business/collections/index.vue`（由后端菜单注册）

## 运营账号

- 开发：`POST /admin/auth/dev-login`（自动 superuser）
- 生产：注册邮箱用户并设 `is_superuser`，或配置 `MFM_API_ADMIN_ALLOWED_EMAILS`
