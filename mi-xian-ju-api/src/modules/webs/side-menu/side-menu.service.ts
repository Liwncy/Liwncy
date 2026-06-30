import { KvDataRepository } from '../../../repository/kv-data.repository'
import { filterEnabledMenus, normalizeMenuTree } from '../../../common/normalize-menu'
import type { MenuNode } from '../../../common/menu.types'

/** 通用 sideMenu 读取（liteVideo / aiTool / dailyhot 等） */
export class SideMenuService {
  constructor(private readonly kv: KvDataRepository) {}

  async getSideMenu(module: string): Promise<MenuNode[]> {
    const raw = (await this.kv.getJson<unknown[]>(`webs/${module}/sideMenu/index`)) ?? []
    return filterEnabledMenus(normalizeMenuTree(raw))
  }
}
