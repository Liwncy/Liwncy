import WebsBasicLayout from '@/layouts/webs/BasicLayout.vue';
import Resources from "@/views/webs/resources/index.vue";
import Index from "@/views/webs/index.vue";
import BetterRead from "@/views/webs/betterRead/index.vue";

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
                path: "/webs/bookMark",
                component: () => import('@/views/webs/bookMark/index.vue'),
                meta: {title: "书签"},
            },
            {
                path: "/webs/notes",
                component: () => import('@/views/webs/notes/index.vue'),
                meta: {title: "随记"},
            },
            {
                path: "/webs/liteVideo",
                component: () => import('@/views/webs/liteVideo/index.vue'),
                meta: {title: "一点儿视频"},
            },
            {
                path: "/webs/liteImage",
                component: () => import('@/views/webs/liteImage/index.vue'),
                meta: {title: "一点儿图片"},
            },
            {
                path: "/webs/aiTool",
                component: () => import('@/views/webs/aiTool/index.vue'),
                meta: {title: "AI工具"},
            },
            {
                path: '/webs/betterRead',
                name: 'BetterRead',
                component: BetterRead,
                redirect: "/webs/betterRead/detail",
                meta: { title: "好读" },
                children: [
                    {
                        path: "/webs/betterRead/detail",
                        component: () =>
                            import("@/views/webs/betterRead/index.md"),
                        meta: { title: "文章" },
                    }
                ]
            },
            {
                path: "/webs/hotBans",
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

