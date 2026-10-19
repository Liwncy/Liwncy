<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import avatarUrl from '../assets/touxiang.jpg'
import BrandIcon from '../components/BrandIcon.vue'
import { FluidCursor } from '@/components/shadcn/fluid-cursor'
import Live2D from '../components/Live2D.vue'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/shadcn/navigation-menu'
import { useAppStore } from '../store/app'
import '../styles/layout.css'

const { theme, toggleTheme } = useAppStore()
const route = useRoute()

type NavLink = { title: string; to: string }
type NavGroup = { title: string; items: NavLink[] }

const groups: NavGroup[] = [
  { title: '闲暇时序', items: [{ title: '今日热榜', to: '/trends' }] },
  { title: '璇玑百宝', items: [{ title: '常用书签', to: '/bookmark' }] },
  { title: '人间烟火', items: [] },
  { title: '乐在逍遥', items: [{ title: '勾栏听曲', to: '/videos' }, { title: '走马观花', to: '/images' }] },
]

function groupCurrent(group: NavGroup) {
  return group.items.some((item) => route.path === item.to || route.path.startsWith(`${item.to}/`))
}
</script>

<template>
  <div class="site" :class="{ 'site-theme-dark': theme === 'dark' }">
    <FluidCursor />
    <Live2D />
    <header class="site-header">
      <RouterLink class="site-logo" to="/">
        <img :src="avatarUrl" alt="" />
        <span>芈 仙 居</span>
      </RouterLink>
      <NavigationMenu class="h-full max-w-none flex-none items-stretch justify-start" aria-label="站点">
        <NavigationMenuList class="h-full items-center justify-start gap-12 max-[720px]:gap-7">
          <NavigationMenuItem>
            <NavigationMenuLink
              as-child
              :active="route.path === '/'"
              class="bg-transparent p-0 text-[15px] hover:bg-transparent hover:text-foreground focus:bg-transparent data-active:bg-transparent data-active:text-primary"
            >
              <RouterLink to="/">首页</RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem v-for="group in groups" :key="group.title">
            <span v-if="group.items.length === 0" class="text-[15px]">{{ group.title }}</span>
            <template v-else>
              <NavigationMenuTrigger
                class="[&_svg]:hidden"
                :data-current="groupCurrent(group) ? 'true' : undefined"
              >
                {{ group.title }}
              </NavigationMenuTrigger>
              <NavigationMenuContent class="min-w-36">
                <NavigationMenuLink
                  v-for="item in group.items"
                  :key="item.to"
                  as-child
                  :active="route.path === item.to"
                >
                  <RouterLink :to="item.to">{{ item.title }}</RouterLink>
                </NavigationMenuLink>
              </NavigationMenuContent>
            </template>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div class="site-tools">
        <a href="https://gitee.com/liwncy" target="_blank" rel="noopener noreferrer" aria-label="Gitee">
          <BrandIcon name="gitee" />
        </a>
        <a href="https://github.com/liwncy" target="_blank" rel="noopener noreferrer" aria-label="Github">
          <BrandIcon name="github" />
        </a>
        <button type="button" class="site-theme" :aria-label="theme === 'dark' ? '浅色模式' : '深色模式'" @click="toggleTheme">
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8M6 6l1.3 1.3M16.7 16.7 18 18M18 6l-1.3 1.3M7.3 16.7 6 18" />
          </svg>
        </button>
      </div>
    </header>
    <div class="site-main">
      <RouterView />
    </div>
  </div>
</template>
