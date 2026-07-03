import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { siteRoutes } from './site.routes'
import { docsRoutes } from './docs.routes'
import { adminRoutes } from './admin.routes'
import { useUserStore } from '@/store/user'
import { APP_NAME } from '@/config/setting'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: [...siteRoutes, ...docsRoutes, ...adminRoutes],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME

  if (to.meta.requireAuth && !userStore.isLoggedIn) {
    next({ path: '/admin/login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.guest && userStore.isLoggedIn && to.path === '/admin/login') {
    next('/admin/dashboard')
    return
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
