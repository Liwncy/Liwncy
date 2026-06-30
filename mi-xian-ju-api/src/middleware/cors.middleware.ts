import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../config/env'

/** 跨域（类似 CorsFilter） */
export const corsMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const origin = c.req.header('Origin') ?? '*'
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, clientid, token')
  c.header('Access-Control-Max-Age', '86400')

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204)
  }

  await next()
}
