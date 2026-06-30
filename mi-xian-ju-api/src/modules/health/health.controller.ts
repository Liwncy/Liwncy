import type { Context } from 'hono'
import type { AppEnv } from '../../config/env'
import { ok } from '../../common/response'

/** 健康检查 Controller */
export class HealthController {
  index(c: Context<AppEnv>) {
    return c.json({
      name: c.env.APP_NAME,
      status: 'ok',
      version: '0.1.0',
    })
  }
}

export const healthController = new HealthController()
