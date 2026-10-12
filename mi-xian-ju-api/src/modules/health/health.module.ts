import type { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { healthController } from './health.controller'

export function registerHealthModule(app: Hono<AppEnv>) {
  app.route('/', healthController)
}
