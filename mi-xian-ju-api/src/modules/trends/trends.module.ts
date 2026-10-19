import type { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { trendsController } from './trends.controller'

export function registerTrendsModule(app: Hono<AppEnv>) {
  app.route('/', trendsController)
}
