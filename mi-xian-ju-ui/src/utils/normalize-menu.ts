import type { LegacyMenuRecord, MenuNode, MenuPayload, MenuTab } from '@/types/menu'

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function normalizeTab(raw: LegacyMenuRecord): MenuTab {
  return {
    id: str(raw.id),
    title: str(raw.title ?? raw.name, str(raw.id)),
    api: typeof raw.api === 'string' ? raw.api : undefined,
    sort: typeof raw.sort === 'number' ? raw.sort : undefined,
  }
}

function normalizePayload(raw: LegacyMenuRecord): MenuPayload | undefined {
  const payload: MenuPayload = {}

  if (raw.payload && typeof raw.payload === 'object' && !Array.isArray(raw.payload)) {
    Object.assign(payload, raw.payload as MenuPayload)
  }

  if (Array.isArray(raw.books)) payload.books = raw.books
  if (Array.isArray(raw.data)) {
    payload.tabs = raw.data.map((item) => normalizeTab(item as LegacyMenuRecord))
  } else if (raw.data && typeof raw.data === 'object') {
    const data = raw.data as LegacyMenuRecord
    Object.assign(payload, data)
    if (typeof data.title === 'string' && !payload.platform) {
      payload.platform = data.title
    }
  }

  if (typeof raw.sourceId === 'string') {
    payload.sourceId = raw.sourceId
    if (Array.isArray(raw.tabNames) && !payload.tabs?.length) {
      payload.tabs = raw.tabNames.map((name, index) => ({
        id: `${raw.sourceId}_${index}`,
        title: str(name),
        api: `/v2/${raw.sourceId}`,
      }))
    }
  }

  if (typeof raw.api === 'string') payload.api = raw.api
  if (typeof raw.description === 'string') payload.description = raw.description
  if (typeof raw.details === 'string') payload.details = raw.details

  return Object.keys(payload).length ? payload : undefined
}

export function normalizeMenuNode(raw: LegacyMenuRecord, parentId?: string | number | null): MenuNode {
  const id = raw.id ?? raw.path ?? raw.title ?? raw.name
  const node: MenuNode = {
    id: id as string | number,
    title: str(raw.title ?? raw.name, str(id)),
  }

  if (parentId !== undefined) node.parentId = parentId
  if (raw.subtitle !== undefined || raw.subTitle !== undefined) {
    node.subtitle = str(raw.subtitle ?? raw.subTitle)
  }
  if (typeof raw.icon === 'string') node.icon = raw.icon
  if (typeof raw.path === 'string') node.path = raw.path
  if (raw.i18nKey !== undefined || raw.useI18n !== undefined) {
    node.i18nKey = str(raw.i18nKey ?? raw.useI18n)
  }
  if (typeof raw.sort === 'number') node.sort = raw.sort
  if (typeof raw.enabled === 'boolean') node.enabled = raw.enabled

  const payload = normalizePayload(raw)
  if (payload) node.payload = payload

  if (Array.isArray(raw.children)) {
    node.children = raw.children.map((child) =>
      normalizeMenuNode(child as LegacyMenuRecord, node.id),
    )
  }

  return node
}

export function normalizeMenuTree(raw: unknown): MenuNode[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => normalizeMenuNode(item as LegacyMenuRecord))
}

export function filterEnabledMenus(nodes: MenuNode[]): MenuNode[] {
  return nodes
    .filter((node) => node.enabled !== false)
    .map((node) => ({
      ...node,
      children: node.children?.length ? filterEnabledMenus(node.children) : undefined,
    }))
}

/** 读取 payload 中的 API 地址（兼容旧 data.api） */
export function getMenuApi(node?: MenuNode): string | undefined {
  if (!node?.payload) return undefined
  return typeof node.payload.api === 'string' ? node.payload.api : undefined
}

/** 读取热榜 tabs */
export function getMenuTabs(node?: MenuNode): MenuTab[] {
  return node?.payload?.tabs ?? []
}

/** 读取书签列表 */
export function getMenuBooks<T = unknown>(node?: MenuNode): T[] {
  return (node?.payload?.books as T[] | undefined) ?? []
}

/** 读取今日热榜平台名 */
export function getMenuPlatform(node?: MenuNode): string | undefined {
  if (!node?.payload) return undefined
  if (typeof node.payload.platform === 'string') return node.payload.platform
  return node.title
}
