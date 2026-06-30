import type { RouteRecordRaw } from 'vue-router'
import SiteLayout from '@/layouts/site/SiteLayout.vue'

/** 主站路由：无 /webs 前缀 */
export const siteRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: SiteLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/site/home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'bookmark',
        name: 'BookMark',
        component: () => import('@/views/site/bookmark/index.vue'),
        meta: { title: '书签', fullBleed: true },
      },
      {
        path: 'notes',
        name: 'Notes',
        component: () => import('@/views/site/notes/index.vue'),
        meta: { title: '随记', fullBleed: true },
      },
      {
        path: 'read',
        name: 'Read',
        component: () => import('@/views/site/read/index.vue'),
        meta: { title: '阅读', fullBleed: true },
      },
      {
        path: 'ai-tools',
        name: 'AiTools',
        component: () => import('@/views/site/ai-tools/index.vue'),
        meta: { title: 'AI 工具', fullBleed: true },
      },
      {
        path: 'personality-test',
        name: 'PersonalityTest',
        component: () => import('@/views/site/personality-test/index.vue'),
        meta: { title: '性格测试' },
      },
      {
        path: 'hot-bans',
        name: 'HotBans',
        component: () => import('@/views/site/hot-bans/index.vue'),
        meta: { title: '热榜', fullBleed: true },
      },
      {
        path: 'daily-hot',
        name: 'DailyHot',
        component: () => import('@/views/site/daily-hot/index.vue'),
        meta: { title: '今日热榜', fullBleed: true },
      },
      {
        path: 'lite-video',
        name: 'LiteVideo',
        component: () => import('@/views/site/lite-video/index.vue'),
        meta: { title: '视频', fullBleed: true },
      },
      {
        path: 'lite-image',
        name: 'LiteImage',
        component: () => import('@/views/site/lite-image/index.vue'),
        meta: { title: '图片', fullBleed: true },
      },
      {
        path: 'lite-word',
        name: 'LiteWord',
        component: () => import('@/views/site/lite-word/index.vue'),
        meta: { title: '文案', fullBleed: true },
      },
    ],
  },
]
