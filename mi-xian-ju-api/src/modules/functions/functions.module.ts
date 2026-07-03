import { Hono } from 'hono'
import type { AppEnv } from '../../config/env'
import { functionsController } from './functions.controller'

/** 公开功能 API：/api/v1/:code */
export function registerFunctionsModule(app: Hono<AppEnv>) {
  const functions = new Hono<AppEnv>()

  functions.get('/:code', (c) => functionsController.invoke(c))
  functions.post('/:code', (c) => functionsController.invoke(c))

  app.route('/api/v1', functions)
}
