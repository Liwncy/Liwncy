import type { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { bookmarkController } from './bookmark.controller'

export function registerBookmarkModule(app: Hono<AppEnv>) {
  app.route('/', bookmarkController)
}
