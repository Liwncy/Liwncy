import { get } from '@/api/http'
import type { ApiResult } from '@/types/global'
import type { MenuNode } from '@/types/menu'

/**
 * 顶部导航菜单
 * - API: GET /api/webs/layout/topMenu
 * - 数据源: data/webs/layout/topMenu/index → KV 同步
 * - 失败时 SiteLayout 使用内置 defaultNav
 */
export function fetchTopMenus() {
  return get<ApiResult<MenuNode[]>>('/webs/layout/topMenu')
}
