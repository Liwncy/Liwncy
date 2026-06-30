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
    ],
  },
]
