import { Hono } from 'hono'
import type { AppEnv } from '../../config/env'
import { adminController } from './admin.controller'

/** 后台管理 API：/api/admin/* */
export function registerAdminModule(app: Hono<AppEnv>) {
  const admin = new Hono<AppEnv>()

  admin.post('/auth/login', (c) => adminController.login(c))
  admin.get('/me', (c) => adminController.me(c))
  admin.get('/config', (c) => adminController.config(c))
  admin.post('/chains', (c) => adminController.createChain(c))
  admin.patch('/chains/:id', (c) => adminController.updateChain(c))
  admin.post('/chain-steps', (c) => adminController.createChainStep(c))
  admin.patch('/chain-steps/:id', (c) => adminController.updateChainStep(c))
  admin.post('/menus/import', (c) => adminController.importMenus(c))
  admin.post('/menus', (c) => adminController.createMenu(c))
  admin.patch('/menus/:id', (c) => adminController.updateMenu(c))
  admin.post('/functions/debug', (c) => adminController.debugFunction(c))
  admin.post('/functions', (c) => adminController.createFunction(c))
  admin.delete('/functions/:id', (c) => adminController.deleteFunction(c))
  admin.post('/sources', (c) => adminController.createSource(c))
  admin.delete('/sources/:id', (c) => adminController.deleteSource(c))
  admin.patch('/sources/:id', (c) => adminController.updateSource(c))
  admin.post('/adapters', (c) => adminController.createAdapter(c))
  admin.delete('/adapters/:id', (c) => adminController.deleteAdapter(c))
  admin.patch('/adapters/:id', (c) => adminController.updateAdapter(c))
  admin.post('/function-params', (c) => adminController.createFunctionParam(c))
  admin.delete('/function-params/:id', (c) => adminController.deleteFunctionParam(c))
  admin.patch('/function-params/:id', (c) => adminController.updateFunctionParam(c))
  admin.post('/function-routes', (c) => adminController.createFunctionRoute(c))
  admin.delete('/function-routes/:id', (c) => adminController.deleteFunctionRoute(c))
  admin.patch('/function-routes/:id', (c) => adminController.updateFunctionRoute(c))
  admin.post('/adapter-param-maps', (c) => adminController.createAdapterParamMap(c))
  admin.delete('/adapter-param-maps/:id', (c) => adminController.deleteAdapterParamMap(c))
  admin.patch('/adapter-param-maps/:id', (c) => adminController.updateAdapterParamMap(c))
  admin.post('/response-maps', (c) => adminController.createResponseMap(c))
  admin.delete('/response-maps/:id', (c) => adminController.deleteResponseMap(c))
  admin.patch('/response-maps/:id', (c) => adminController.updateResponseMap(c))
  admin.patch('/functions/:id', (c) => adminController.updateFunction(c))
  admin.post('/function-adapters', (c) => adminController.createFunctionAdapter(c))
  admin.delete('/function-adapters/:id', (c) => adminController.deleteFunctionAdapter(c))
  admin.patch('/function-adapters/:id', (c) => adminController.updateFunctionAdapter(c))

  app.route('/api/admin', admin)
}
