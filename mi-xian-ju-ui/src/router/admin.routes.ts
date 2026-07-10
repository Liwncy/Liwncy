import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/layouts/admin/AdminLayout.vue'

/** 精简 Admin 路由 */
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/login/index.vue'),
    meta: { title: '登录', guest: true },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requireAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard/index.vue'),
        meta: { title: '控制台', requireAuth: true },
      },
      {
        path: 'api/functions',
        name: 'AdminApiFunctions',
        component: () => import('@/views/admin/api-platform/functions.vue'),
        meta: { title: '功能接口', requireAuth: true },
      },
      {
        path: 'api/functions/:id/configs',
        name: 'AdminApiFunctionConfigs',
        component: () => import('@/views/admin/api-platform/function-configs.vue'),
        meta: { title: '接口详情', requireAuth: true },
      },
      {
        path: 'api/sources',
        name: 'AdminApiSources',
        component: () => import('@/views/admin/api-platform/sources.vue'),
        meta: { title: '平台源', requireAuth: true },
      },
      {
        path: 'api/adapters',
        name: 'AdminApiAdapters',
        component: () => import('@/views/admin/api-platform/adapters.vue'),
        meta: { title: 'Adapter', requireAuth: true },
      },
      {
        path: 'api/menus',
        name: 'AdminApiMenus',
        component: () => import('@/views/admin/api-platform/menus.vue'),
        meta: { title: '菜单配置', requireAuth: true },
      },
    ],
  },
]
