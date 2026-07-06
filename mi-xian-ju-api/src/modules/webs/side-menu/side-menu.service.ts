import { KvDataRepository } from '../../../repository/kv-data.repository'
import { D1PlatformRepository } from '../../../repository/d1-platform.repository'
import { filterEnabledMenus, normalizeMenuTree } from '../../../common/normalize-menu'
import type { MenuNode } from '../../../common/menu.types'

type PlatformMenuNode = {
  id: string
  parent_id: string | null
  title: string
  subtitle: string | null
  icon: string | null
  path: string | null
  i18n_key: string | null
  sort: number
  status: string
  payload: Record<string, unknown>
  children?: PlatformMenuNode[]
}

/** 通用 sideMenu 读取（liteVideo / aiTool / dailyhot 等） */
export class SideMenuService {
  constructor(
    private readonly kv: KvDataRepository,
    private readonly platform: D1PlatformRepository,
  ) {}

  async getSideMenu(module: string): Promise<MenuNode[]> {
    try {
      const d1Menus = await this.platform.listMenuTree('side', module)
      if (d1Menus.length) {
        return d1Menus.map((item) => this.toMenuNode(item))
      }
    } catch {
      // 表未迁移或 D1 暂不可用时回退 KV 菜单，保证前台可用。
    }

    const raw = (await this.kv.getJson<unknown[]>(`webs/${module}/sideMenu/index`)) ?? []
    return filterEnabledMenus(normalizeMenuTree(raw))
  }

  private toMenuNode(row: PlatformMenuNode): MenuNode {
    return {
      id: row.id,
      parentId: row.parent_id,
      title: row.title,
      ...(row.subtitle ? { subtitle: row.subtitle } : {}),
      ...(row.icon ? { icon: row.icon } : {}),
      ...(row.path ? { path: row.path } : {}),
      ...(row.i18n_key ? { i18nKey: row.i18n_key } : {}),
      sort: row.sort,
      enabled: row.status === 'enabled',
      ...(Object.keys(row.payload).length ? { payload: row.payload } : {}),
      ...(row.children?.length ? { children: row.children.map((child) => this.toMenuNode(child)) } : {}),
    }
  }
}
