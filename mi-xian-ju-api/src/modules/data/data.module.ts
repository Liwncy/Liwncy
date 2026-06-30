import { Hono } from 'hono'
import type { AppEnv } from '../../config/env'
import { dataController } from './data.controller'

/** /data/* 模块（GitHub Raw 兼容层） */
export function registerDataModule(app: Hono<AppEnv>) {
  const data = new Hono<AppEnv>()
  data.get('/*', (c) => dataController.get(c))
  app.route('/data', data)
}
