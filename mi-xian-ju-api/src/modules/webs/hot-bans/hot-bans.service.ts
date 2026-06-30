import { KvDataRepository } from '../../../repository/kv-data.repository'
import { filterEnabledMenus, normalizeMenuTree } from '../../../common/normalize-menu'
import type { MenuNode } from '../../../common/menu.types'

export class HotBansService {
  constructor(private readonly kv: KvDataRepository) {}

  async getSideMenus(): Promise<MenuNode[]> {
    const raw = (await this.kv.getJson<unknown[]>('webs/hotBans/sideMenu/index')) ?? []
    return filterEnabledMenus(normalizeMenuTree(raw))
  }
}
