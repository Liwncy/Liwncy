import type { Context } from 'hono'
import type { AppEnv } from '../../../config/env'
import { ok } from '../../../common/response'

export class LayoutController {
  async getTopMenu(c: Context<AppEnv>) {
    const data = await c.get('services').layout.getTopMenu()
    return c.json(ok(data))
  }
}

export const layoutController = new LayoutController()
