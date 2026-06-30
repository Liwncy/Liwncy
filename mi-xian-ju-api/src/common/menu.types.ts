/** 菜单作用域 — 对应未来 D1 `menu.scope` */
export type MenuScope = 'top' | 'side'

/** 热榜 Tab — 对应未来 D1 `menu_tab` 或 payload 内嵌 */
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
  /** 今日热榜等平台标识（Peark API title 参数） */
  platform?: string
  [key: string]: unknown
}

/**
 * 统一菜单节点 — 树形 JSON / 未来 D1 `menu` 表
 *
 * | JSON 字段 | D1 列 |
 * |-----------|-------|
 * | id        | id |
 * | parentId  | parent_id |
 * | title     | title |
 * | subtitle  | subtitle |
 * | icon      | icon |
 * | path      | path |
 * | i18nKey   | i18n_key |
 * | sort      | sort_order |
 * | enabled   | enabled |
 * | payload   | payload |
 */
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
