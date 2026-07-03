import { Hono } from 'hono'
import type { AppEnv } from '../../config/env'
import { adminController } from './admin.controller'

/** 后台管理 API：/api/admin/* */
export function registerAdminModule(app: Hono<AppEnv>) {
  const admin = new Hono<AppEnv>()

  admin.post('/auth/login', (c) => adminController.login(c))
  admin.get('/me', (c) => adminController.me(c))
  admin.get('/config', (c) => adminController.config(c))
  admin.patch('/functions/:id', (c) => adminController.updateFunction(c))
  admin.patch('/function-adapters/:id', (c) => adminController.updateFunctionAdapter(c))

  app.route('/api/admin', admin)
}
