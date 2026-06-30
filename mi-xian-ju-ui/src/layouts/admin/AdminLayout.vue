<template>
  <lay-config-provider :theme="appStore.theme" :themeVariable="appStore.themeVariable">
    <lay-layout class="admin-layout">
      <lay-side width="220px" :theme="appStore.theme">
        <div class="admin-logo">{{ APP_NAME }} Admin</div>
        <lay-menu :selectedKey="selectedKey" @change="onMenuChange">
          <lay-menu-item id="/admin/dashboard">
            <template #icon><lay-icon type="layui-icon-console" /></template>
            <template #title>控制台</template>
          </lay-menu-item>
        </lay-menu>
      </lay-side>

      <lay-layout>
        <lay-header class="admin-header">
          <span>{{ route.meta.title ?? '管理后台' }}</span>
          <div class="admin-header-actions">
            <span>{{ userStore.nickname }}</span>
            <lay-button size="sm" @click="handleLogout">退出</lay-button>
          </div>
        </lay-header>
        <lay-body class="admin-body">
          <router-view />
        </lay-body>
      </lay-layout>
    </lay-layout>
  </lay-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { APP_NAME } from '@/config/setting'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const selectedKey = computed(() => route.path)

function onMenuChange(id: string) {
  router.push(id)
}

function handleLogout() {
  userStore.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-body {
  padding: 20px;
}
</style>
