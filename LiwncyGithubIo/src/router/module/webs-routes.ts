import WebsBasicLayout from '@/layouts/webs/BasicLayout.vue';
import Resources from "@/views/webs/resources.vue";
import Index from "@/views/webs/index.vue";

// @ts-ignore
export default [
    {
        path: "/",
        redirect: "/webs/index",
        component: WebsBasicLayout,
        meta: { title: "首页" },
        children: [
            {
                path: "/webs/index",
                component: Index,
                meta: { title: "指南" },
            },
            {
                path: "/webs/resources",
                component: Resources,
                meta: { title: "生态" },
            },
        ],
    },
];

