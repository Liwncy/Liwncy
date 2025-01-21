import {
    createRouter,
    createWebHistory,
    createWebHashHistory,
    NavigationGuardNext,
    RouteLocationNormalized,
    RouteRecordRaw
} from 'vue-router'
import routes from './module/base-routes'
import websRoutes from './module/webs-routes'
import docsRoutes from './module/docs-routes'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {useUserStore} from "../store/user";

NProgress.configure({showSpinner: false})

// 公共路由
export const  constantRoutes: RouteRecordRaw[] = [...routes, ...docsRoutes, ...websRoutes]
// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteRecordRaw[] = [];

const router = createRouter({
    // history: createWebHistory(),
    history: createWebHashHistory(),
    routes: constantRoutes,
    // 刷新时，滚动条位置还原
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
})

/**
 * Router 前置拦截
 *
 * 1.验证 token 存在, 并且有效, 否则 -> login.vue
 * 2.验证 permission 存在, 否则 -> 403.vue
 * 3.验证 router 是否存在, 否则 -> 404.vue
 *
 * @param to 目标
 * @param from 来至
 */
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    NProgress.start();

    const userStore = useUserStore();

    if (to.meta.requireAuth) {
        next();
    } else if (to.matched.length == 0) {
        if(from.fullPath.includes('/docs')){
            next({path: '/docs/404'})
        } else if(from.fullPath.includes('/webs')){
            next({path: '/webs/404'})
        } else if(from.fullPath.includes('/admin')){
            next({path: '/admin/error/404'})
        }else {
            next({path: '/webs/404'})
        }
    } else {
        next();
    }
})

router.afterEach(() => {
    NProgress.done();
})

export default router