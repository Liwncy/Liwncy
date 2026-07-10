<template>
  <lay-config-provider :theme="appStore.theme" :themeVariable="appStore.themeVariable">
    <lay-layout class="layui-layout-admin mxj-admin-layout" :class="{ collapse }">
      <lay-side :width="sideWidth" class="admin-side dark">
        <div class="admin-logo">
          <span class="admin-logo-mark">芈</span>
          <span v-if="!collapse" class="admin-logo-text">{{ APP_NAME }} Admin</span>
        </div>
        <div class="side-menu-wrapper">
        <div v-if="!collapse" class="admin-menu-caption">API 转接</div>
          <lay-menu
            :tree="true"
            :collapse="collapse"
            :openKeys="openKeys"
            :selectedKey="selectedKey"
            theme="dark"
            @changeOpenKeys="changeOpenKeys"
            @changeSelectedKey="onMenuChange"
          >
            <lay-sub-menu id="workspace">
              <template #icon><lay-icon type="layui-icon-console" /></template>
              <template #title>工作台</template>
              <lay-menu-item id="/admin/dashboard">
                <template #icon><lay-icon type="layui-icon-home" /></template>
                <template #title>控制台</template>
              </lay-menu-item>
            </lay-sub-menu>

            <lay-sub-menu id="api-platform">
              <template #icon><lay-icon type="layui-icon-engine" /></template>
              <template #title>API 平台</template>
              <lay-menu-item id="/admin/api/functions">
                <template #icon><lay-icon type="layui-icon-app" /></template>
                <template #title>功能接口</template>
              </lay-menu-item>
              <lay-menu-item id="/admin/api/sources">
                <template #icon><lay-icon type="layui-icon-website" /></template>
                <template #title>平台源</template>
              </lay-menu-item>
              <lay-menu-item id="/admin/api/adapters">
                <template #icon><lay-icon type="layui-icon-set" /></template>
                <template #title>Adapter</template>
              </lay-menu-item>
            </lay-sub-menu>

            <lay-sub-menu id="content-nav">
              <template #icon><lay-icon type="layui-icon-template" /></template>
              <template #title>内容导航</template>
              <lay-menu-item id="/admin/api/menus">
                <template #icon><lay-icon type="layui-icon-list" /></template>
                <template #title>菜单配置</template>
              </lay-menu-item>
            </lay-sub-menu>
          </lay-menu>
        </div>
      </lay-side>

      <lay-layout class="admin-main-layout">
        <lay-header class="admin-header">
          <lay-menu class="admin-header-left">
            <lay-menu-item @click="toggleCollapse">
              <lay-icon :type="collapse ? 'layui-icon-spread-left' : 'layui-icon-shrink-right'" />
            </lay-menu-item>
            <lay-menu-item @click="refreshPage">
              <lay-icon type="layui-icon-refresh-one" />
            </lay-menu-item>
            <lay-menu-item class="admin-breadcrumb">
              <span>首页</span>
              <lay-icon type="layui-icon-right" />
              <span>{{ routeTitle }}</span>
            </lay-menu-item>
          </lay-menu>
          <lay-menu class="admin-header-right">
            <lay-menu-item @click="router.push('/')">
              <lay-icon type="layui-icon-home" />
            </lay-menu-item>
            <lay-menu-item>
              <lay-fullscreen v-slot="{ toggle, isFullscreen }">
                <lay-icon
                  :type="isFullscreen ? 'layui-icon-screen-restore' : 'layui-icon-screen-full'"
                  @click="toggle()"
                />
              </lay-fullscreen>
            </lay-menu-item>
            <lay-menu-item>
              <lay-dropdown placement="bottom">
                <span class="admin-user">
                  <lay-icon type="layui-icon-username" />
                  {{ userStore.nickname }}
                </span>
                <template #content>
                  <lay-dropdown-menu>
                    <lay-dropdown-menu-item @click="router.push('/admin/dashboard')">
                      控制台
                    </lay-dropdown-menu-item>
                    <lay-line />
                    <lay-dropdown-menu-item @click="handleLogout">
                      退出登录
                    </lay-dropdown-menu-item>
                  </lay-dropdown-menu>
                </template>
              </lay-dropdown>
            </lay-menu-item>
          </lay-menu>
        </lay-header>
        <lay-body class="admin-body">
          <div class="admin-tabbar">
            <div class="admin-tab-scroll">
              <div
                v-for="tab in visitedTabs"
                :key="tab.path"
                class="admin-tab-item"
                :class="{ active: tab.path === route.path }"
                @click="switchTab(tab.path)"
              >
                <span class="dot"></span>
                <span>{{ tab.title }}</span>
                <lay-icon
                v-if="tab.path !== HOME_TAB.path"
                  class="admin-tab-close"
                  type="layui-icon-close"
                  @click.stop="closeTab(tab.path)"
                />
              </div>
            </div>
            <lay-dropdown placement="bottom-end">
              <button class="admin-tab-more" type="button">
                <lay-icon type="layui-icon-down" />
              </button>
              <template #content>
                <lay-dropdown-menu>
                  <lay-dropdown-menu-item @click="closeAllTabs">关闭全部</lay-dropdown-menu-item>
                  <lay-dropdown-menu-item @click="closeOtherTabs">关闭其他</lay-dropdown-menu-item>
                  <lay-dropdown-menu-item @click="closeCurrentTab">关闭当前</lay-dropdown-menu-item>
                </lay-dropdown-menu>
              </template>
            </lay-dropdown>
          </div>
          <div class="admin-content">
            <router-view v-if="routerAlive" />
          </div>
        </lay-body>
      </lay-layout>
    </lay-layout>
  </lay-config-provider>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { APP_NAME } from '@/config/setting'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const collapse = ref(false)
const routerAlive = ref(true)
const HOME_TAB = { path: '/admin/dashboard', title: '控制台' }
const visitedTabs = ref([{ ...HOME_TAB }])

const routeTitle = computed(() => route.meta.title ?? '管理后台')
const selectedKey = computed(() =>
  route.path.startsWith('/admin/api/functions') ? '/admin/api/functions' : route.path,
)
const openKeys = ref<string[]>([getOpenKey(route.path)])
const sideWidth = computed(() => (collapse.value ? '60px' : '220px'))

function getOpenKey(path: string) {
  if (path.startsWith('/admin/api/menus')) return 'content-nav'
  if (path.startsWith('/admin/api')) return 'api-platform'
  return 'workspace'
}

function changeOpenKeys(keys: string[]) {
  openKeys.value = keys
}

function onMenuChange(id: string) {
  if (!id.startsWith('/')) return
  router.push(id)
}

function addVisitedTab() {
  const path = route.path
  const title = String(route.meta.title ?? '管理后台')
  const tab = visitedTabs.value.find((item) => item.path === path)
  if (tab) {
    tab.title = title
    return
  }
  visitedTabs.value.push({ path, title })
}

function switchTab(path: string) {
  if (path !== route.path) router.push(path)
}

function closeTab(path: string) {
  if (path === HOME_TAB.path) return

  const index = visitedTabs.value.findIndex((item) => item.path === path)
  if (index === -1) return

  const isActive = path === route.path
  visitedTabs.value.splice(index, 1)

  if (isActive) {
    const nextTab = visitedTabs.value[index] ?? visitedTabs.value[index - 1]
    if (nextTab) router.push(nextTab.path)
  }
}

function closeCurrentTab() {
  closeTab(route.path)
}

function closeOtherTabs() {
  if (route.path === HOME_TAB.path) {
    visitedTabs.value = [{ ...HOME_TAB }]
    return
  }
  visitedTabs.value = [
    { ...HOME_TAB },
    { path: route.path, title: String(route.meta.title ?? '管理后台') },
  ]
}

function closeAllTabs() {
  visitedTabs.value = [{ ...HOME_TAB }]
  if (route.path !== HOME_TAB.path) router.push(HOME_TAB.path)
}

function toggleCollapse() {
  collapse.value = !collapse.value
}

async function refreshPage() {
  routerAlive.value = false
  await nextTick()
  routerAlive.value = true
}

function handleLogout() {
  userStore.logout()
  router.push('/admin/login')
}

watch(
  () => route.path,
  (path) => {
    addVisitedTab()
    const key = getOpenKey(path)
    if (!openKeys.value.includes(key)) {
      openKeys.value = [...openKeys.value, key]
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.mxj-admin-layout {
  min-height: 100vh;
  background: #f4f6f8;
  overflow: hidden;
}

.admin-side {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 10000;
  height: 100vh;
  background: linear-gradient(180deg, #1c2523 0%, #141918 100%) !important;
  box-shadow: 2px 0 16px rgba(15, 31, 27, 0.18);
}

.admin-logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.92);
  line-height: 50px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, #1f9d8a, #36c49f);
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(31, 157, 138, 0.28);
}

.admin-logo-text {
  min-width: 0;
  overflow: hidden;
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.side-menu-wrapper {
  width: 100%;
  height: calc(100vh - 50px);
  padding: 12px 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.admin-menu-caption {
  margin: 0 8px 10px;
  color: rgba(255, 255, 255, 0.38);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.side-menu-wrapper :deep(.layui-nav) {
  background: transparent;
}

.side-menu-wrapper :deep(.layui-nav-item),
.side-menu-wrapper :deep(.layui-nav-child) {
  border-radius: 10px;
  overflow: hidden;
}

.side-menu-wrapper :deep(.layui-nav-item > a),
.side-menu-wrapper :deep(.layui-nav-child a) {
  min-height: 40px;
  line-height: 40px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.76);
}

.side-menu-wrapper :deep(.layui-nav-child a) {
  padding-left: 2em !important;
}

.side-menu-wrapper :deep(.layui-nav-item.layui-this > a),
.side-menu-wrapper :deep(.layui-nav-child .layui-this > a) {
  color: #fff;
  background: rgba(31, 157, 138, 0.24);
  box-shadow: inset 3px 0 0 #36c49f;
}

.side-menu-wrapper :deep(.layui-nav-item > a:hover),
.side-menu-wrapper :deep(.layui-nav-child a:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.admin-main-layout {
  width: calc(100% - 220px);
  height: 100vh;
  margin-left: 220px;
  transition: width 0.3s, margin-left 0.3s;
}

.collapse .admin-main-layout {
  width: calc(100% - 60px);
  margin-left: 60px;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px !important;
  line-height: 50px;
  padding: 0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 10px rgba(0, 21, 41, 0.08);
  z-index: 9999;
}

.admin-header-left,
.admin-header-right {
  height: 50px !important;
  line-height: 50px;
  background: transparent;
}

.admin-header :deep(.layui-nav-item) {
  height: 50px !important;
  line-height: 50px;
}

.admin-header :deep(.layui-icon) {
  color: #666;
  font-size: 16px;
}

.admin-header :deep(.layui-icon:hover) {
  color: var(--global-primary-color);
}

.admin-breadcrumb {
  color: #999;
}

.admin-breadcrumb :deep(.layui-menu-body-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.admin-body {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
  background:
    radial-gradient(circle at top left, rgba(31, 157, 138, 0.08), transparent 28%),
    #f5f7f7;
  overflow: hidden;
}

.admin-tabbar {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 0 0 0 12px;
  border-top: 1px solid whitesmoke;
  box-shadow: 0 1px 8px rgba(0, 21, 41, 0.05);
  background: rgba(255, 255, 255, 0.9);
}

.admin-tab-scroll {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}

.admin-tab-scroll::-webkit-scrollbar {
  height: 0;
}

.admin-tab-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 12px;
  border-radius: 16px;
  color: dimgray;
  background: rgba(31, 157, 138, 0.06);
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.admin-tab-item.active {
  color: #17372f;
  font-weight: 600;
  background: rgba(31, 157, 138, 0.1);
}

.admin-tab-close {
  padding: 2px;
  border-radius: 50%;
  font-size: 12px !important;
}

.admin-tab-close:hover {
  color: #fff !important;
  background: rgba(31, 157, 138, 0.78);
}

.admin-tab-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 40px;
  border: 0;
  border-left: 1px solid rgba(31, 157, 138, 0.12);
  color: #6f7f7b;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
}

.admin-tab-more:hover {
  color: var(--global-primary-color);
  background: rgba(31, 157, 138, 0.06);
}

.admin-tab-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--global-primary-color);
}

.admin-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.admin-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.admin-content::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #e2e2e2;
}
</style>
