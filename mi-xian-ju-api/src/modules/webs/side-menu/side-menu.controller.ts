import type { Context } from 'hono'
import type { AppEnv } from '../../../config/env'
import { ok } from '../../../common/response'

export class SideMenuController {
  async getSideMenu(c: Context<AppEnv>) {
    const module = c.req.param('module') ?? ''
    const data = await c.get('services').sideMenu.getSideMenu(module)
    return c.json(ok(data))
  }
}

export const sideMenuController = new SideMenuController()
