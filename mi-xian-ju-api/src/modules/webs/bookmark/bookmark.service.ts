import { KvDataRepository } from '../../../repository/kv-data.repository'
import { normalizeMenuTree } from '../../../common/normalize-menu'
import type { MenuNode } from '../../../common/menu.types'

const DATA_SOURCE_VARIANT: Record<string, string> = {
  '0': 'index',
  '1': 'index_like',
  '2': 'index',
}

export class BookMarkService {
  constructor(private readonly kv: KvDataRepository) {}

  async getBookMarks(dataSource = '0'): Promise<MenuNode[]> {
    const variant = DATA_SOURCE_VARIANT[dataSource] ?? 'index'
    const raw = (await this.kv.getJson<unknown[]>(`webs/bookMark/sideMenu/${variant}`)) ?? []
    return normalizeMenuTree(raw)
  }
}
