import { KvDataRepository } from '../../../repository/kv-data.repository'
import { filterEnabledMenus, normalizeMenuTree } from '../../../common/normalize-menu'
import type { MenuNode } from '../../../common/menu.types'

export class LayoutService {
  constructor(private readonly kv: KvDataRepository) {}

  async getTopMenu(): Promise<MenuNode[]> {
    const raw = (await this.kv.getJson<unknown[]>('webs/layout/topMenu/index')) ?? []
    return filterEnabledMenus(normalizeMenuTree(raw))
  }
}
