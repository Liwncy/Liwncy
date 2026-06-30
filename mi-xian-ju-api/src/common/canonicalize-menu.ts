import { normalizeNavPath } from './nav-path'
import type { MenuNode, MenuPayload, MenuTab } from './menu.types'

function canonicalizePayload(payload?: MenuPayload): MenuPayload | undefined {
  if (!payload) return undefined

  const next: MenuPayload = { ...payload }

  if (Array.isArray(next.tabs)) {
    next.tabs = next.tabs.map((tab, index) => {
      const item: MenuTab = {
        id: String(tab.id),
        title: tab.title,
      }
      if (tab.api) item.api = tab.api
      item.sort = tab.sort ?? index + 1
      return item
    })
  }

  return Object.keys(next).length ? next : undefined
}

function canonicalizeNode(node: MenuNode, index: number, topMenu: boolean): MenuNode {
  const out: MenuNode = {
    id: node.id,
    title: node.title,
    sort: node.sort ?? index + 1,
    enabled: node.enabled ?? true,
  }

  if (node.subtitle) out.subtitle = node.subtitle
  if (node.icon) out.icon = node.icon
  if (node.i18nKey) out.i18nKey = node.i18nKey

  if (node.path) {
    out.path = topMenu ? normalizeNavPath(node.path) : node.path
  }

  const payload = canonicalizePayload(node.payload)
  if (payload) out.payload = payload

  if (node.children?.length) {
    out.children = node.children.map((child, childIndex) =>
      canonicalizeNode(child, childIndex, topMenu),
    )
  }

  return out
}

/** 将 MenuNode 树转为写入 data/ KV 的标准 JSON */
export function canonicalizeMenuTree(nodes: MenuNode[], options: { topMenu?: boolean } = {}) {
  const topMenu = options.topMenu ?? false
  return nodes.map((node, index) => canonicalizeNode(node, index, topMenu))
}
