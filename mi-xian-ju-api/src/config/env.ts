/** Cloudflare Workers 绑定与环境变量（类似 application.yml + Bean 环境） */
export type Bindings = {
  DATA_KV: KVNamespace
  // DB: D1Database
  APP_NAME: string
  CRYPTO_KEY?: string
  ADMIN_PASSWORD?: string
}

/** Hono 应用上下文类型 */
export type AppEnv = {
  Bindings: Bindings
}
