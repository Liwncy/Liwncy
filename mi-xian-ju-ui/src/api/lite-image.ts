import { get } from '@/api/http'
import menus from '@/config/lite-image-menus.json'
import type { ApiResult } from '@/types/global'
import type { MenuNode } from '@/types/menu'
import { filterEnabledMenus, normalizeMenuTree } from '@/utils/normalize-menu'

export async function fetchLiteImageMenus() {
  try {
    const res = await get<ApiResult<MenuNode[]>>('/webs/liteImage/sideMenu')
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
