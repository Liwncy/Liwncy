import type { Context } from 'hono'
import type { AppEnv } from '../../../config/env'
import { ok } from '../../../common/response'

export class BookMarkController {
  async getBookMarks(c: Context<AppEnv>) {
    const dataSource = c.req.query('dataSource') ?? '0'
    const data = await c.get('services').bookMark.getBookMarks(dataSource)
    return c.json(ok(data))
  }
}

export const bookMarkController = new BookMarkController()
