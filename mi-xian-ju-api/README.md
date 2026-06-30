# 芈仙居 API（mi-xian-ju-api）

Cloudflare Workers 后端，Hono + Spring 式分层，为 [mi-xian-ju-ui](../mi-xian-ju-ui)（待建）提供数据接口。

## 项目结构

```
src/
├── main.ts                 # 入口（Workers fetch handler）
├── app.ts                  # 应用装配、模块注册
├── config/
│   ├── env.ts              # 环境类型（Bindings）
│   └── container.ts        # Service 工厂（轻量 DI）
├── common/
│   ├── response.ts         # 统一 ApiResult
│   └── http-error.ts       # 业务异常
├── middleware/
│   ├── cors.middleware.ts
│   ├── error-handler.middleware.ts
│   └── inject-services.middleware.ts
├── repository/
│   └── kv-data.repository.ts
└── modules/
    ├── health/             # Controller + module
    ├── data/               # /data/* GitHub Raw 兼容
    └── webs/               # /api/webs/* 业务 API
        ├── layout/
        ├── bookmark/
        ├── hot-bans/
        └── side-menu/
```

## 路由

| 路径 | 说明 |
|------|------|
| `GET /` | 健康检查 |
| `GET /data/*` | 兼容 GitHub Raw |
| `GET /api/webs/*` | 兼容现有 GithubIo Mock 路径 |

## 开发

```bash
cd mi-xian-ju-api
pnpm install

wrangler login
wrangler kv namespace create DATA_KV
wrangler kv namespace create DATA_KV --preview
# 将 id 填入 wrangler.toml

pnpm sync:kv -- --dry-run
pnpm sync:kv              # 本地 wrangler dev（preview KV）
pnpm sync:kv -- --remote  # 线上 production KV（deploy 前）
pnpm fetch:menus              # 从 Apifox Mock 拉菜单（带 clientid）→ data/ → 可选 --sync-kv
pnpm fetch:menus -- --sync-kv
pnpm dev        # http://127.0.0.1:8787
pnpm typecheck
pnpm deploy
```

### 从 Apifox 拉取菜单

与 GithubIo `request.ts` 相同，请求 Apifox Mock 时需在 Header 携带 `clientid`（默认 `6e64c2eeb9c6716965a67a6f8d3879e0`），否则返回随机假数据。

```bash
pnpm fetch:menus -- --sync-kv
pnpm fetch:menus -- --api-base=http://127.0.0.1:8787/api --sync-kv  # 从本地 Worker
```

## 前端对接

```env
VITE_API_B_URL = 'https://<worker>.workers.dev/data'
VITE_API_URL   = 'https://<worker>.workers.dev/api'
```

## 分层约定（给 Java 后端同学）

| Spring Boot | 本项目 |
|-------------|--------|
| `@RestController` | `*.controller.ts` |
| `@Service` | `*.service.ts` |
| Repository / Mapper | `repository/*.repository.ts` |
| `@ControllerAdvice` | `error-handler.middleware.ts` |
| Filter | `*.middleware.ts` |
| `application.yml` | `wrangler.toml` + `.dev.vars` |
| Module 注册 | `*.module.ts` + `app.ts` |
