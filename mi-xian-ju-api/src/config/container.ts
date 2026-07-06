import type { Bindings } from '../config/env'
import { KvDataRepository } from '../repository/kv-data.repository'
import { D1PlatformRepository } from '../repository/d1-platform.repository'
import { DataService } from '../modules/data/data.service'
import { LayoutService } from '../modules/webs/layout/layout.service'
import { BookMarkService } from '../modules/webs/bookmark/bookmark.service'
import { HotBansService } from '../modules/webs/hot-bans/hot-bans.service'
import { SideMenuService } from '../modules/webs/side-menu/side-menu.service'
import { FunctionsService } from '../modules/functions/functions.service'
import { AdminService } from '../modules/admin/admin.service'

/**
 * 依赖容器（轻量 DI，类似 Spring ApplicationContext 工厂）
 * 每个请求根据 c.env 创建 Service 实例。
 */
export function createServices(env: Bindings) {
  const kv = new KvDataRepository(env.DATA_KV)
  const platform = new D1PlatformRepository(env.DB)
  const functions = new FunctionsService(platform)

  return {
    data: new DataService(kv),
    layout: new LayoutService(kv),
    bookMark: new BookMarkService(kv),
    hotBans: new HotBansService(kv),
    sideMenu: new SideMenuService(kv, platform),
    functions,
    admin: new AdminService(platform, env, functions),
  }
}

export type Services = ReturnType<typeof createServices>
