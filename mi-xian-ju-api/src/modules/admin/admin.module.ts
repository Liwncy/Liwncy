import { Hono } from 'hono'
import type { AppEnv } from '../../config/env'
import { adminController } from './admin.controller'

/** 后台管理 API：/api/admin/* */
export function registerAdminModule(app: Hono<AppEnv>) {
  const admin = new Hono<AppEnv>()

  admin.post('/auth/login', (c) => adminController.login(c))
  admin.get('/me', (c) => adminController.me(c))
  admin.get('/config', (c) => adminController.config(c))
  admin.post('/functions/debug', (c) => adminController.debugFunction(c))
  admin.post('/functions', (c) => adminController.createFunction(c))
  admin.post('/sources', (c) => adminController.createSource(c))
  admin.patch('/sources/:id', (c) => adminController.updateSource(c))
  admin.post('/adapters', (c) => adminController.createAdapter(c))
  admin.patch('/adapters/:id', (c) => adminController.updateAdapter(c))
  admin.post('/function-params', (c) => adminController.createFunctionParam(c))
  admin.patch('/function-params/:id', (c) => adminController.updateFunctionParam(c))
  admin.post('/function-routes', (c) => adminController.createFunctionRoute(c))
  admin.patch('/function-routes/:id', (c) => adminController.updateFunctionRoute(c))
  admin.post('/adapter-param-maps', (c) => adminController.createAdapterParamMap(c))
  admin.patch('/adapter-param-maps/:id', (c) => adminController.updateAdapterParamMap(c))
  admin.post('/response-maps', (c) => adminController.createResponseMap(c))
  admin.patch('/response-maps/:id', (c) => adminController.updateResponseMap(c))
  admin.patch('/functions/:id', (c) => adminController.updateFunction(c))
  admin.post('/function-adapters', (c) => adminController.createFunctionAdapter(c))
  admin.patch('/function-adapters/:id', (c) => adminController.updateFunctionAdapter(c))

  app.route('/api/admin', admin)
}
