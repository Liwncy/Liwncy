import type { Context } from 'hono'
import type { AppEnv } from '../../../config/env'
import { ok } from '../../../common/response'

export class HotBansController {
  async getSideMenus(c: Context<AppEnv>) {
    const data = await c.get('services').hotBans.getSideMenus()
    return c.json(ok(data))
  }
}

export const hotBansController = new HotBansController()
