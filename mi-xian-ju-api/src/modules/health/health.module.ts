import { Hono } from 'hono'
import type { AppEnv } from '../../config/env'
import { healthController } from './health.controller'

/** 健康检查模块路由注册 */
export function registerHealthModule(app: Hono<AppEnv>) {
  app.get('/', (c) => healthController.index(c))
}
