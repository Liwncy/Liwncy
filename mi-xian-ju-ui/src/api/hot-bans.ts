import { get } from '@/api/http'
import menus from '@/config/hot-bans-menus.json'
import type { ApiResult } from '@/types/global'
import type { MenuNode } from '@/types/menu'
import { filterEnabledMenus, normalizeMenuTree } from '@/utils/normalize-menu'

/** 热榜侧栏菜单 */
export async function fetchHotBanMenus() {
  try {
    const res = await get<ApiResult<MenuNode[]>>('/webs/hotBans/getSideMenus')
    if (res.data?.length) return res
  } catch {
    // KV 未同步时使用本地配置
  }
  return {
    code: 200,
    success: true,
    msg: '操作成功',
    data: filterEnabledMenus(normalizeMenuTree(menus)),
  } satisfies ApiResult<MenuNode[]>
}
