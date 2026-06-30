import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../config/env'
import { createServices, type Services } from '../config/container'

declare module 'hono' {
  interface ContextVariableMap {
    services: Services
  }
}

/** 注入 Service 到请求上下文（类似 Spring 请求作用域 Bean） */
export const injectServicesMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set('services', createServices(c.env))
  await next()
}
