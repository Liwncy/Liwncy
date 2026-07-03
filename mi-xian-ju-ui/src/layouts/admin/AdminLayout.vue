<template>
  <lay-config-provider :theme="appStore.theme" :themeVariable="appStore.themeVariable">
    <lay-layout class="layui-layout-admin mxj-admin-layout" :class="{ collapse }">
      <lay-side :width="sideWidth" class="admin-side dark">
        <div class="admin-logo">
          <span v-if="!collapse">{{ APP_NAME }} Admin</span>
          <span v-else>芈</span>
        </div>
        <div class="side-menu-wrapper">
        <lay-menu
          :collapse="collapse"
          :selectedKey="selectedKey"
          theme="dark"
          @changeSelectedKey="onMenuChange"
        >
          <lay-menu-item id="/admin/dashboard">
            <template #icon><lay-icon type="layui-icon-console" /></template>
            <template #title>控制台</template>
          </lay-menu-item>
          <lay-menu-item id="/admin/api/functions">
            <template #icon><lay-icon type="layui-icon-app" /></template>
            <template #title>功能接口</template>
          </lay-menu-item>
          <lay-menu-item id="/admin/api/contracts">
            <template #icon><lay-icon type="layui-icon-form" /></template>
            <template #title>参数契约</template>
          </lay-menu-item>
          <lay-menu-item id="/admin/api/adapters">
            <template #icon><lay-icon type="layui-icon-set" /></template>
            <template #title>平台适配</template>
          </lay-menu-item>
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
              <span>{{ route.meta.title ?? '管理后台' }}</span>
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
            <div class="admin-tab-item active">
              <span class="dot"></span>
              {{ route.meta.title ?? '管理后台' }}
            </div>
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
import { computed, nextTick, ref } from 'vue'
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

const selectedKey = computed(() => route.path)
const sideWidth = computed(() => (collapse.value ? '60px' : '220px'))

function onMenuChange(id: string) {
  router.push(id)
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
</script>

<style scoped>
.mxj-admin-layout {
  min-height: 100vh;
  background: #f4f6f8;
}

.admin-side {
  z-index: 10000;
  background: rgba(34, 36, 37, 0.98) !important;
  box-shadow: 2px 0 8px rgba(29, 35, 41, 0.05);
}

.admin-logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.92);
  font-size: 18px;
  font-weight: 600;
  line-height: 50px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.side-menu-wrapper {
  width: 100%;
  height: calc(100vh - 50px);
  overflow-y: auto;
}

.side-menu-wrapper::-webkit-scrollbar {
  width: 8px;
}

.side-menu-wrapper::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgb(40, 51, 62);
}

.admin-main-layout {
  width: 0;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px !important;
  line-height: 50px;
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
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
  background: whitesmoke;
  overflow: hidden;
}

.admin-tabbar {
  display: flex;
  height: 40px;
  flex: 0 0 40px;
  border-top: 1px solid whitesmoke;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  background: #fff;
}

.admin-tab-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-right: 1px solid whitesmoke;
  color: dimgray;
  font-size: 14px;
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
  padding: 10px;
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
