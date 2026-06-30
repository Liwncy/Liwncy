import type { Context } from 'hono'
import type { AppEnv } from '../../config/env'
import { HttpError } from '../../common/http-error'

/** 兼容 GithubIo request-github-data 的 Controller */
export class DataController {
  async get(c: Context<AppEnv>) {
    const fullPath = c.req.path.replace(/^\/data\/?/, '')

    try {
      const data = await c.get('services').data.getByPath(fullPath)
      if (typeof data === 'string') {
        return c.text(data)
      }
      return c.json(data)
    } catch (err) {
      if (err instanceof HttpError) {
        return c.json({ error: err.message, ...err.body }, err.status as 400 | 404)
      }
      throw err
    }
  }
}

export const dataController = new DataController()
