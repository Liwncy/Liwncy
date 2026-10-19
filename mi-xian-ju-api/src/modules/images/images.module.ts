import type { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { imagesController } from './images.controller'

export function registerImagesModule(app: Hono<AppEnv>) {
  app.route('/', imagesController)
}
