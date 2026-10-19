import type { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { wordsController } from './words.controller'

export function registerWordsModule(app: Hono<AppEnv>) {
  app.route('/', wordsController)
}
