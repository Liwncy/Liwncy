/** 菜单作用域 — 对应未来 D1 `menu.scope` */
export type MenuScope = 'top' | 'side'

/** 热榜 Tab */
export interface MenuTab {
  id: string
  title: string
  api?: string
  sort?: number
}

/** 扩展载荷 — 对应未来 D1 `menu.payload` JSON 列 */
export interface MenuPayload {
  books?: unknown[]
  tabs?: MenuTab[]
  api?: string
  description?: string
  details?: string
  platform?: string
  [key: string]: unknown
}

/** 统一菜单节点 */
export interface MenuNode {
  id: string | number
  parentId?: string | number | null
  title: string
  subtitle?: string
  icon?: string
  path?: string
  i18nKey?: string
  sort?: number
  enabled?: boolean
  payload?: MenuPayload
  children?: MenuNode[]
}

export type LegacyMenuRecord = Record<string, unknown>

/** @deprecated 使用 MenuNode */
export type NavItem = MenuNode

/** 侧栏菜单组 / 子项（MenuNode 别名，兼容 MenuSidebar） */
export type SideMenuGroup = MenuNode
export type SideMenuChild = MenuNode
