import WebsBasicLayout from '@/layouts/webs/BasicLayout.vue';
import Resources from "@/views/webs/resources/index.vue";
import Index from "@/views/webs/index.vue";
import BasicLayout from "@/layouts/admin/BasicLayout.vue";

// @ts-ignore
export default [
    {
        path: "/",
        redirect: "/webs/index",
        component: WebsBasicLayout,
        meta: {title: "首页"},
        children: [
            {
                path: "/webs/index",
                component: Index,
                meta: {title: "主页"},
            },
            {
                path: "/webs/book_mark",
                component: () => import('@/views/webs/bookMark/index.vue'),
                meta: {title: "书签"},
            },
            {
                path: "/webs/better_read",
                component: () => import('@/views/webs/betterRead/index.vue'),
                meta: {title: "随记"},
            },
            {
                path: "/webs/hot_bans",
                component: () => import('@/views/webs/hotBans/index.vue'),
                meta: {title: "热榜"},
            },
            {
                path: "/webs/resources",
                component: Resources,
                meta: {title: "生态"},
            },
        ],
    },
    {
        path: '/error',
        component: WebsBasicLayout,
        meta: {title: '错误页面'},
        children: [
            {
                path: '/webs/401',
                component: () => import('@/views/common/error/401.vue'),
                meta: {title: '401'},
            },
            {
                path: '/webs/403',
                component: () => import('@/views/common/error/403.vue'),
                meta: {title: '403'},
            },
            {
                path: '/webs/404',
                component: () => import('@/views/common/error/404.vue'),
                meta: {title: '404'},
            },
            {
                path: '/webs/500',
                component: () => import('@/views/common/error/500.vue'),
                meta: {title: '500'},
            }
        ]
    },
];

