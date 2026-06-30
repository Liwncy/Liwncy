/** 将 KV / 旧路由中的 /webs/* 路径映射为新站路由 */
export function normalizeNavPath(path: string) {
  return path
    .replace(/^\/webs\/index\/?$/i, '/')
    .replace(/^\/webs\/xysx\/?$/i, '/hot-bans')
    .replace(/^\/webs\/xjbb\/?$/i, '/ai-tools')
    .replace(/^\/webs\/rjyh\/?$/i, '/personality-test')
    .replace(/^\/webs\/lzxy\/?$/i, '/lite-video')
    .replace(/^\/webs\/life\/?$/, '/hot-bans')
    .replace(/^\/webs\/book_mark\/?$/i, '/bookmark')
    .replace(/^\/webs\/bookMark\/?$/i, '/bookmark')
    .replace(/^\/webs\/hot_bans\/?$/i, '/hot-bans')
    .replace(/^\/webs\/hotBans\/?$/i, '/hot-bans')
    .replace(/^\/webs\/dailyhot\/?$/i, '/daily-hot')
    .replace(/^\/webs\/aiTool\/?$/i, '/ai-tools')
    .replace(/^\/webs\/liteVideo\/?$/i, '/lite-video')
    .replace(/^\/webs\/liteImage\/?$/i, '/lite-image')
    .replace(/^\/webs\/liteWord\/?$/i, '/lite-word')
    .replace(/^\/webs\/personalityTest\/?$/i, '/personality-test')
    .replace(/^\/webs\/betterRead\/?.*$/i, '/read')
    .replace(/^\/webs\//, '/')
    .replace(/_/g, '-')
}

export function normalizeNavItem<T extends { path?: string; children?: T[] }>(item: T): T {
  const normalized: T = {
    ...item,
    path: item.path ? normalizeNavPath(item.path) : item.path,
  }
  if (item.children?.length) {
    normalized.children = item.children.map(normalizeNavItem)
  }
  return normalized
}

/** 过滤暂无页面或已禁用的菜单项 */
export function filterNavItems<T extends { path?: string; enabled?: boolean; children?: T[] }>(
  items: T[],
) {
  return items
    .filter((item) => item.enabled !== false && !item.path?.includes('/resources'))
    .map((item) => {
      if (!item.children?.length) return item
      return {
        ...item,
        children: item.children.filter(
          (child) =>
            child.enabled !== false &&
            !child.path?.includes('/resources') &&
            !child.path?.startsWith('/life/') &&
            child.path !== '/life',
        ),
      }
    })
}
