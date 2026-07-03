import type { RouteRecordRaw } from 'vue-router'
import DocsBasicLayout from '@/layouts/docs/BasicLayout.vue'

export const docsRoutes: RouteRecordRaw[] = [
  {
    path: '/docs',
    component: DocsBasicLayout,
    redirect: '/docs/guide/api-platform-admin-guide',
    meta: { title: '文档' },
    children: [
      {
        path: 'guide',
        component: () => import('@/views/docs/guide.vue'),
        redirect: '/docs/guide/api-platform-admin-guide',
        meta: { title: '指南' },
        children: [
          {
            path: 'api-platform-admin-guide',
            name: 'ApiPlatformAdminGuide',
            component: () => import('../../docs/api-platform-admin-guide.md'),
            meta: { title: '后台管理 API 接口平台操作步骤' },
          },
          {
            path: 'github-pages-spa-fallback',
            name: 'GithubPagesSpaFallback',
            component: () => import('../../docs/github-pages-spa-fallback.md'),
            meta: { title: 'GitHub Pages SPA 兜底方案' },
          },
          {
            path: ':slug',
            name: 'DocsGuideFallback',
            redirect: '/docs/guide/api-platform-admin-guide',
            meta: { title: '文档指南' },
          },
        ],
      },
    ],
  },
]
