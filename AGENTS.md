# mfm-admin · 运营后台

**相关**：后端 `../mfm-api/AGENTS.md` · 小程序 `../mfm-uniapp-vue3/AGENTS.md` · DAS `../mfm-datacenter/AGENTS.md` · Admin API 实现 `../mfm-api/mfm_api/api/admin/`。

## §0 快速开始

- 依赖：`pnpm install`（Node ≥20.19 或 ≥22.13）
- 环境：复制 **`.env.example`** → **`.env.development.local`**，设 `VITE_SERVER_BASEURL` 指向 mfm-api
- 开发：先 `../mfm-api` 执行 `uv run -m mfm_api`，再 **`pnpm dev`** → http://localhost:8848
- 质量闸门：`pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm verify:harness`

## §1 架构概览

**pure-admin 定交互，mfm-api `/admin/*` 定契约** — 管理端不拼 C 端 JWT，不走 clientDB。数据流与模块边界见 **`doc/explanation/c4-container.html`**、**`doc/explanation/admin-api.html`**。

## §2 目录结构（以本节为准；与文档冲突时优先代码与本节）

```text
src/
├── api/              HTTP 封装（MFM 业务在 admin/；鉴权 user.ts · 菜单 routes.ts）
├── utils/http/       Axios 唯一入口
├── router/           静态 modules/ + 动态 initRouter（后端菜单）
├── store/modules/    Pinia：user / permission / multiTags / settings / app
├── views/
│   ├── login/        登录（含开发虚拟登录）
│   └── business/     MFM 业务页（总览 / 集合 CRUD 等）
├── layout/           壳层（侧栏 · 顶栏 · 标签页）
└── components/       pure-admin 通用组件（Re*）

doc/                  Agent 专题（HTML 真值）；门户 doc/index.html
.agents/skills/       可执行工作流（mfm-admin/SKILL.md）
```

## §3 关键约定

1. **路径别名**：`@/` → `src/`。
2. **HTTP 唯一入口**：**`src/utils/http/index.ts`**；`baseURL` 来自 **`VITE_SERVER_BASEURL`**；鉴权白名单见 `AUTH_WHITELIST`。
3. **Admin API 边界**：新增接口进 **`src/api/admin/`** 或扩展 **`user.ts`/`routes.ts`**；路径对齐 **`mfm_api/schemas/admin/`**；**禁止**调用 C 端 `/api/*` 做运营写操作。
4. **动态路由**：登录后 **`getAsyncRoutes()`** → **`GET /admin/menus`**；component 路径对应 **`src/views/`** 下 SFC。
5. **集合 CRUD**：页 **`views/business/collections/index.vue`** · API **`api/admin/collections.ts`** · 白名单由后端 env 控制；业务库真值经此路径维护。
6. **鉴权存储**：pure-admin `setToken`（Cookie + localStorage）；401/403 清 token 回登录。
7. **文档分层**：短规则在本文；展开进 **`doc/`**（HTML 真值），门户 **`doc/index.html`**。

## §4 文档地图（Diátaxis）

| 象限            | 门户                         | 要点                                                                             |
| --------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| **Tutorial**    | `doc/tutorial/index.html`    | 入门：`getting-started.html`                                                     |
| **How-to**      | `doc/how-to/index.html`      | 约定、测试、部署                                                                 |
| **Reference**   | `doc/reference/index.html`   | 鉴权、动态路由、集合 CRUD、HTTP、Pinia、Layout                                   |
| **Explanation** | `doc/explanation/index.html` | C4 L2/L3、Admin API；L1 → `../mfm-uniapp-vue3/doc/explanation/c4-workspace.html` |

浏览器总门户 **`doc/index.html`** · 管理端开发技能 **`.agents/skills/mfm-admin/SKILL.md`** · HTTP 契约运行时真值：mfm-api OpenAPI **`/api/docs`**（admin tag）· Harness：`pnpm verify:harness`

## §5 不要做的事

- 直连 Mongo/Redis 或暴露数据库连接串。
- 用 C 端 `/api/*` 或旧 sync-batch 拼表单替代 **`/admin/collections`** REST。
- 在 `utils/http` 外再建第二套 Axios 实例。
- 在前端硬编码「可写集合」列表绕过后端白名单。
