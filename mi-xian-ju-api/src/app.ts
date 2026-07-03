import { Hono } from 'hono'
import type { AppEnv } from './config/env'
import { corsMiddleware } from './middleware/cors.middleware'
import { errorHandlerMiddleware } from './middleware/error-handler.middleware'
import { injectServicesMiddleware } from './middleware/inject-services.middleware'
import { registerHealthModule } from './modules/health/health.module'
import { registerDataModule } from './modules/data/data.module'
import { registerWebsModule } from './modules/webs/webs.module'
import { registerAdminModule } from './modules/admin/admin.module'
import { registerFunctionsModule } from './modules/functions/functions.module'
import { fail } from './common/response'
import { HttpError } from './common/http-error'

/** 应用启动与模块注册（类似 SpringBootApplication + @Import） */
export function createApp() {
  const app = new Hono<AppEnv>()

  app.use('*', corsMiddleware)
  app.use('*', errorHandlerMiddleware)
  app.use('*', injectServicesMiddleware)

  registerHealthModule(app)
  registerDataModule(app)
  registerWebsModule(app)
  registerAdminModule(app)
  registerFunctionsModule(app)

  app.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json(fail(err.status, err.message), err.status as 400 | 401 | 403 | 404 | 500 | 502)
    }
    console.error(err)
    return c.json(fail(500, 'Internal Server Error'), 500)
  })

  app.notFound((c) => c.json(fail(404, 'Not Found'), 404))

  return app
}
