import type { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { videosController } from './videos.controller'

export function registerVideosModule(app: Hono<AppEnv>) {
  app.route('/', videosController)
}
