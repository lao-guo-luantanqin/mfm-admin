---
name: mfm-admin
description: 济南买房么运营后台（vue-pure-admin-thin + mfm-api /admin/*）。开发登录、动态菜单、集合 CRUD、HTTP 封装或新增 business 页时使用。
---

# mfm-admin 运营后台

## 何时使用

- 修改 `src/views/business/`、`src/api/admin/`、登录/菜单/HTTP
- 对接 mfm-api Admin 路由或扩展 `admin_async_routes()`
- Review 管理端 PR 的数据边界与 API 边界

## 阅读顺序

1. 仓库根 **`AGENTS.md`** §0–§3（命令、目录、硬约束）
2. **`doc/admin-api.html`** — `/admin/*` 路由表
3. 按任务打开 **`doc/modules/*.html`** 专题
4. 后端契约：mfm-api OpenAPI `/api/docs`（tag: `admin`）

## 硬约束

- **仅** `VITE_SERVER_BASEURL` + **`src/utils/http`**；禁止第二套 Axios
- **仅** `/admin/*`；禁止 C 端 API 写业务库
- 新 HTTP 封装 → `src/api/admin/` 或扩展 `user.ts` / `routes.ts`
- 新页面 → `src/views/` + 后端 `admin_async_routes()` 注册 component
- 集合可写范围以后端 `MFM_API_SYNC_BATCH_ALLOWED_COLLECTIONS` 为准

## 常见任务

### 新增 Admin 业务页

1. `src/views/business/<feature>/index.vue` + `defineOptions({ name })`
2. `src/api/admin/<feature>.ts` 封装 REST
3. mfm-api：`api/admin/` + `schemas/admin/` + `services/admin/`
4. `services/admin/menus/registry.py` 增加菜单节点
5. 更新 `doc/admin-api.html` 路由表

### 联调

```bash
# 终端 1
cd ../mfm-api && uv run -m mfm_api

# 终端 2
cd ../mfm-admin && pnpm dev
```

`.env.development.local`：`VITE_SERVER_BASEURL=http://127.0.0.1:8000`

### 质量闸门

```bash
pnpm typecheck
pnpm verify:harness
```

## 与 pure-admin 差异（勿回退）

| 区域 | MFM 真值                                                  |
| ---- | --------------------------------------------------------- |
| 登录 | `POST /admin/auth/login` · `api/user.ts`                  |
| 菜单 | `GET /admin/menus` · `api/routes.ts`                      |
| CRUD | `views/business/collections` · `api/admin/collections.ts` |
| Mock | 生产关闭；开发可用 `VITE_DEV_MOCK_LOGIN` + dev-login      |

## 验收清单

- [ ] 登录与动态菜单正常
- [ ] Bearer / refresh 无循环 401
- [ ] 新 API 路径与 OpenAPI 一致
- [ ] 未引入 C 端 `/api/*` 写操作
- [ ] `pnpm verify:harness` 通过
