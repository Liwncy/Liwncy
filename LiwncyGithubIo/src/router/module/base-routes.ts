import BasicLayout from '@/layouts/admin/BasicLayout.vue';
import Login from '@/views/common/login/index.vue';


export default [
    {
        path: '/admin',
        redirect: '/workSpace'
    },
    {
        path: '/login',
        component: Login,
        meta: {title: '登录页面'},
    },
    {
        path: '/workspace',
        redirect: '/workspace/workbench',
        component: BasicLayout,
        meta: {title: '工作空间'},
        children: [
            {
                path: '/workspace/workbench',
                name: 'Workbench',
                component: () => import('@/views/admin/workSpace/workbench/index.vue'),
                meta: {title: '工作台', requireAuth: true, affix: true, closable: false},
            },
            {
                path: '/workspace/console',
                component: () => import('@/views/admin/workSpace/console/index.vue'),
                meta: {title: '控制台', requireAuth: true},
            },
            {
                path: '/workspace/analysis',
                component: () => import('@/views/admin/workSpace/analysis/index.vue'),
                meta: {title: '分析页', requireAuth: true},
            },
            {
                path: '/workspace/monitor',
                component: () => import('@/views/admin/workSpace/monitor/index.vue'),
                meta: {title: '监控页', requireAuth: true},
            }
        ]
    },
    {
        path: '/error',
        component: BasicLayout,
        meta: {title: '错误页面'},
        children: [
            {
                path: '/error/401',
                component: () => import('@/views/common/error/401.vue'),
                meta: {title: '401'},
            },
            {
                path: '/error/403',
                component: () => import('@/views/common/error/403.vue'),
                meta: {title: '403'},
            },
            {
                path: '/error/404',
                component: () => import('@/views/common/error/404.vue'),
                meta: {title: '404'},
            },
            {
                path: '/error/500',
                component: () => import('@/views/common/error/500.vue'),
                meta: {title: '500'},
            }
        ]
    },
    {
        path: '/system',
        component: BasicLayout,
        meta: {title: '系统管理'},
        children: [
            {
                path: '/system/user',
                component: () => import('@/views/admin/system/user/index.vue'),
                meta: {title: '用户管理', requireAuth: true},
            },
            {
                path: '/system/role',
                component: () => import('@/views/admin/system/role/index.vue'),
                meta: {title: '角色管理', requireAuth: true},
            },
            {
                path: '/system/menu',
                component: () => import('@/views/admin/system/menu/index.vue'),
                meta: {title: '菜单管理', requireAuth: true},
            },
            {
                path: '/system/organization',
                component: () => import('@/views/admin/system/organization/index.vue'),
                meta: {title: '机构管理', requireAuth: true},
            },
            {
                path: '/system/dictionary',
                component: () => import('@/views/admin/system/dictionary/index.vue'),
                meta: {title: '字典管理', requireAuth: true},
            },
            {
                path: '/system/file',
                component: () => import('@/views/admin/system/file/index.vue'),
                meta: {title: '文件管理', requireAuth: true},
            },
            {
                path: '/system/login',
                component: () => import('@/views/admin/system/login/index.vue'),
                meta: {title: '登录日志', requireAuth: true},
            },
            {
                path: '/system/option',
                component: () => import('@/views/admin/system/option/index.vue'),
                meta: {title: '操作日志', requireAuth: true},
            },
        ]
    },
    {
        path: '/result',
        component: BasicLayout,
        meta: {title: '错误页面'},
        children: [
            {
                path: '/result/success',
                component: () => import('@/views/common/result/success.vue'),
                meta: {title: '成功页面', requireAuth: true},
            },
            {
                path: '/result/failure',
                component: () => import('@/views/common/result/failure.vue'),
                meta: {title: '失败页面', requireAuth: true},
            },
        ]
    },
    {
        path: '/list',
        component: BasicLayout,
        meta: {title: '列表页面'},
        children: [
            {
                path: '/table/base',
                component: () => import('@/views/admin/table/base.vue'),
                meta: {title: '查询列表', requireAuth: true},
            },
            {
                path: '/table/card',
                component: () => import('@/views/admin/table/card.vue'),
                meta: {title: '卡片列表', requireAuth: true},
            },
            {
                path: '/table/project',
                component: () => import('@/views/admin/table/project.vue'),
                meta: {title: '项目列表', requireAuth: true},
            },
            {
                path: '/table/article',
                component: () => import('@/views/admin/table/article.vue'),
                meta: {title: '文章列表', requireAuth: true},
            }
        ]
    },
    {
        path: '/form',
        component: BasicLayout,
        meta: {title: '表单页面'},
        children: [
            {
                path: '/form/base',
                component: () => import('@/views/admin/form/base.vue'),
                meta: {title: '基础表单', requireAuth: true},
            },
            {
                path: '/form/step',
                component: () => import('@/views/admin/form/step.vue'),
                meta: {title: '分步表单', requireAuth: true},
            },
            {
                path: '/form/intricate',
                name: 'Intricate',
                component: () => import('@/views/admin/form/intricate.vue'),
                meta: {title: '复杂表单', requireAuth: true},
            },
            {
                path: '/form/step',
                name: 'Step',
                component: () => import('@/views/admin/form/step.vue'),
                meta: {title: '分步表单', requireAuth: true},
            },
        ]
    },
    {
        path: '/directive',
        component: BasicLayout,
        meta: {title: '内置指令'},
        children: [
            {
                path: '/directive/permission',
                component: () => import('@/views/admin/directive/permission.vue'),
                meta: {title: '权限指令', requireAuth: true},
            },
        ]
    },
    {
        path: '/component',
        component: BasicLayout,
        meta: {title: '常用组件'},
        children: [
            {
                path: '/component/qrcode',
                component: () => import('@/views/admin/component/qrcode.vue'),
                meta: {title: '二维码', requireAuth: true},
            },
            {
                path: '/component/barcode',
                component: () => import('@/views/admin/component/barcode.vue'),
                meta: {title: '条形码', requireAuth: true},
            },
            {
                path: '/component/treeSelect',
                component: () => import('@/views/admin/component/treeSelect.vue'),
                meta: {title: '下拉树', requireAuth: true},
            },
        ]
    },
    {
        path: '/enrollee',
        component: BasicLayout,
        meta: {title: '个人中心'},
        children: [
            {
                path: '/enrollee/profile',
                component: () => import('@/views/admin/enrollee/profile/index.vue'),
                meta: {title: '我的资料', requireAuth: true},
            },
            {
                path: '/enrollee/message',
                component: () => import('@/views/admin/enrollee/message/index.vue'),
                meta: {title: '我的消息', requireAuth: true},
            },

        ]
    },

]
