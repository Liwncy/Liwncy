import { Hono } from 'hono'
import type { AppEnv } from '../../config/env'
import { layoutController } from './layout/layout.controller'
import { bookMarkController } from './bookmark/bookmark.controller'
import { hotBansController } from './hot-bans/hot-bans.controller'
import { sideMenuController } from './side-menu/side-menu.controller'

/**
 * /api/webs/* 模块
 * 对齐 GithubIo Apifox Mock 路径，后续 mi-xian-ju-ui 迁移后逐步改为无前缀 REST。
 */
export function registerWebsModule(app: Hono<AppEnv>) {
  const webs = new Hono<AppEnv>()

  webs.get('/layout/topMenu', (c) => layoutController.getTopMenu(c))
  webs.get('/bookMark/getBookMarks', (c) => bookMarkController.getBookMarks(c))
  webs.get('/hotBans/getSideMenus', (c) => hotBansController.getSideMenus(c))
  webs.get('/:module/sideMenu', (c) => sideMenuController.getSideMenu(c))

  app.route('/api/webs', webs)
}
