import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './env'
import { registerBookmarkModule } from './modules/bookmark/bookmark.module'
import { registerHealthModule } from './modules/health/health.module'
import { registerImagesModule } from './modules/images/images.module'
import { registerTrendsModule } from './modules/trends/trends.module'

export function createApp() {
  const app = new Hono<AppEnv>()
  app.use('*', cors())
  registerHealthModule(app)
  registerBookmarkModule(app)
  registerTrendsModule(app)
  registerImagesModule(app)
  return app
}
