import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './env'
import { HttpError } from './http'
import { registerBookmarkModule } from './modules/bookmark/bookmark.module'
import { registerHealthModule } from './modules/health/health.module'
import { registerTrendsModule } from './modules/trends/trends.module'
import { registerCatalog } from './routes/catalog'
import { registerPageRoutes } from './routes/call'

export function createApp() {
  const app = new Hono<AppEnv>()
  app.use('*', cors())
  registerHealthModule(app)
  registerBookmarkModule(app)
  registerTrendsModule(app)
  registerPageRoutes(app)
  registerCatalog(app)
  app.onError((error, c) => {
    if (error instanceof HttpError) {
      return c.json({ code: error.status, msg: error.message, data: null }, error.status as 400)
    }
    console.error(error)
    return c.json({ code: 500, msg: '没办成', data: null }, 500)
  })
  return app
}
