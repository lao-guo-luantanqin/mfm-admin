# 济南买房么 · 运营后台（mfm-admin）

本文件是 **vue-pure-admin-thin** 运营后台的 **AI 协作入口**：对接 **mfm-api `/admin/*`** 专用契约，**禁止**直连 C 端 `/api/*` 或拼 sync-batch 形态。

**相关**：后端见 **`../mfm-api/AGENTS.md`**；小程序见 **`../mfm-uniapp-vue3/AGENTS.md`**；Admin API 实现见 **`../mfm-api/mfm_api/api/admin/`**。

---

## §0 快速开始

- 安装依赖：`pnpm install`（Node ≥20.19 或 ≥22.13，包管理器见 `package.json`）
- 本地环境：复制 **`.env.example`** 为 **`.env.development.local`**，设置 `VITE_SERVER_BASEURL` 指向 mfm-api
- 开发：先启动 **`../mfm-api`**（`uv run -m mfm_api`），再 **`pnpm dev`** → http://localhost:8848
- 质量闸门：`pnpm typecheck`；Lint：`pnpm lint`；Harness 校对：`pnpm verify:harness`

---

## §1 目录结构（以本节为准；与文档冲突时优先代码与本节）

```text
src/
├── api/              HTTP 封装；MFM 业务在 admin/，鉴权在 user.ts、菜单在 routes.ts
├── components/       pure-admin 通用组件（Re* 前缀）；业务页优先放 views/
├── config/           platform-config 加载与全局配置
├── directives/       权限、复制、ripple 等
├── layout/           壳层：侧栏、顶栏、标签页、搜索、设置
├── router/           静态路由 modules/ + 动态路由 initRouter（后端菜单）
├── store/modules/    Pinia：user / permission / multiTags / settings / app
├── utils/http/       Axios 封装（唯一 HTTP 客户端）
├── views/
│   ├── login/        登录页（含开发虚拟登录）
│   ├── business/     MFM 业务页（总览 / 楼盘 / Banner / 集合 JSON）
│   ├── error/        403 / 404 / 500
│   └── permission/   pure-admin 权限演示（可保留作参考）
├── main.ts
└── App.vue

doc/                  Agent 专题文档（HTML 真值）；门户 doc/index.html
.agents/skills/       可执行工作流与技能索引
scripts/              Harness 校对等脚本
public/               platform-config.json 等静态资源
```

---

## §2 架构概览

**pure-admin 定交互形态，mfm-api `/admin/*` 适配后端**——管理端不拼 C 端 JWT，不走 clientDB。

```text
Browser → Axios (utils/http) → mfm-api /admin/*
         ↓
    Pinia user + permission → 动态菜单 + 路由守卫 → views/business/*
```

详见 **`doc/architecture.html`**、**`doc/admin-api.html`**。

---

## §3 关键约定

1. **路径别名**：`@/` → `src/`（`tsconfig.json`）。
2. **HTTP 唯一入口**：**`src/utils/http/index.ts`**；`baseURL` 来自 **`VITE_SERVER_BASEURL`**；鉴权白名单见 `AUTH_WHITELIST`（login / dev-login / refresh）。
3. **Admin API 边界**：新增管理端接口进 **`src/api/admin/`** 或扩展 **`user.ts` / `routes.ts`**；路径与 **`mfm_api/schemas/admin/`** 对齐；**禁止**调用 C 端域 API 做运营写操作。
4. **动态路由**：登录后 **`getAsyncRoutes()`** → **`GET /admin/menus`**；后端 **`admin_async_routes()`** 注册 component 路径对应 **`src/views/`** 下 SFC。
5. **集合 CRUD**：通用页 **`views/business/collections/index.vue`**；API 在 **`api/admin/collections.ts`**；白名单由后端 **`MFM_API_SYNC_BATCH_ALLOWED_COLLECTIONS`** 控制。
6. **鉴权存储**：pure-admin **`setToken`** 方案（Cookie `authorized-token` + localStorage `user-info`）；401/403 清 token 并回登录。
7. **相对 pure-admin 的 MFM 改动**：`api/user.ts` → `/admin/auth/*`；`api/routes.ts` → `/admin/menus`；关闭生产 mock；新增 business/collections 页。
8. **文档**：短规则在本文；展开进 **`doc/`**（HTML 真值）；门户 **`doc/index.html`**。

---

## §4 文档地图

入口：**`doc/index.html`**（Agent 文档门户 · 搜索/筛选 · Harness 摘要）。

| 主题                   | 文件                                |
| ---------------------- | ----------------------------------- |
| 文档套件门户           | `doc/index.html`                    |
| 系统架构与栈           | `doc/architecture.html`             |
| Admin API 边界与路由表 | `doc/admin-api.html`                |
| 鉴权与会话             | `doc/modules/auth-session.html`     |
| 动态菜单与路由         | `doc/modules/dynamic-routes.html`   |
| 集合文档 CRUD          | `doc/modules/collections-crud.html` |
| HTTP 客户端            | `doc/modules/http-client.html`      |
| Pinia 全局状态         | `doc/modules/pinia-state.html`      |
| Layout 壳层            | `doc/modules/layout-shell.html`     |
| 编码约定与护栏         | `doc/conventions.html`              |
| 构建与环境             | `doc/pages/deployment.html`         |
| 测试与验收             | `doc/pages/testing.html`            |
| 管理端开发技能         | `.agents/skills/mfm-admin/SKILL.md` |

公共样式/交互：`doc/assets/style.css` · `doc/assets/common.js` · Harness 校对：`pnpm verify:harness`

_HTTP 契约运行时真值：mfm-api OpenAPI `/api/docs`（admin tag）；Harness 文档快照：2026-05-23_

---

## §5 不要做的事

- 直连 Mongo / Redis 或暴露数据库连接串。
- 用 C 端 `/api/*` 或旧 sync-batch 拼表单替代 **`/admin/collections`** REST。
- 在 `utils/http` 外再建第二套 Axios 实例。
- 绕过后端白名单在前端硬编码「可写集合」列表（展示可从 meta 接口读，权限以后端为准）。
