import type { MenuNode } from '@/types/menu'

/** 从侧栏菜单树查找平台描述 */
export function findPlatformDescription(menus: MenuNode[], platformId: string | number) {
  for (const menu of menus) {
    const found = menu.children?.find((child) => child.id === platformId)
    if (!found) continue

    const description = found.payload?.description
    if (typeof description === 'string') return description

    if (found.subtitle) {
      return `${found.title} (${found.subtitle}) 热榜`
    }

    return `${found.title} 热榜资讯`
  }
  return `${platformId} 热榜资讯聚合`
}

export { getRankClass, formatHotValue, normalizeHotArticles } from '@/utils/hot-rank-normalize'
