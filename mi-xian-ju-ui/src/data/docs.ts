export interface DocItem {
  slug: string
  title: string
  menuTitle: string
  subTitle: string
  description: string
  category: string
  updatedAt: string
}

export interface DocMenuGroup {
  id: number
  title: string
  children: Array<DocItem & { id: number; path: string }>
}

export const docs: DocItem[] = [
  {
    slug: 'api-platform-admin-guide',
    title: '后台管理 API 接口平台操作步骤',
    menuTitle: '接口平台后台',
    subTitle: 'ap',
    description: '记录功能接口、参数契约、平台适配、响应映射等后台配置流程。',
    category: 'API 平台',
    updatedAt: '2026-07-03',
  },
  {
    slug: 'github-pages-spa-fallback',
    title: 'GitHub Pages 部署 Vue 子页面直达方案',
    menuTitle: 'Pages 子页面',
    subTitle: 'sf',
    description: '记录 history 路由在 GitHub Pages 上通过 404.html 兜底的部署方式。',
    category: '部署笔记',
    updatedAt: '2026-07-03',
  },
]

export const docMenus: DocMenuGroup[] = [
  {
    id: 1,
    title: '项目笔记',
    children: docs.map((item, index) => ({
      ...item,
      id: index + 1,
      path: `/docs/guide/${item.slug}`,
    })),
  },
]
