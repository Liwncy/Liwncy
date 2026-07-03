<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'
import avatarUrl from '@/assets/touxiang.jpg'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const currentPath = ref(route.path)

watch(
  () => route.path,
  (path) => {
    currentPath.value = path
  },
  { immediate: true },
)

function resetThemeVariable() {
  appStore.resetThemeVariable()
}
</script>

<template>
  <lay-config-provider :theme="appStore.theme" :themeVariable="appStore.themeVariable">
    <lay-layout
      class="layui-layout-document"
      :class="{ 'site-theme-dark': appStore.theme === 'dark' }"
    >
      <lay-header>
        <lay-logo @click="router.push('/docs')">
          <img :src="avatarUrl" alt="logo" />
          <span class="title">芈仙居文档</span>
        </lay-logo>

        <ul class="layui-nav layui-layout-left" style="margin-top: 0; margin-bottom: 0">
          <li class="layui-nav-item">
            <router-link to="/">首页</router-link>
          </li>
          <li
            class="layui-nav-item"
            :class="{ 'layui-active': currentPath.includes('/docs/guide') }"
          >
            <router-link to="/docs/guide">指南</router-link>
          </li>
        </ul>

        <ul class="layui-nav layui-layout-right" style="margin-top: 0; margin-bottom: 0">
          <li class="layui-nav-item">
            <lay-dropdown>
              <a href="javascript:void(0);">
                <lay-icon size="15px" type="layui-icon-theme" />
              </a>
              <template #content>
                <div class="theme-panel">
                  <lay-color-picker v-model="appStore.themeVariable['--global-primary-color']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-normal-color']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-warm-color']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-danger-color']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-checked-color']" />
                  <lay-input
                    v-model="appStore.themeVariable['--global-border-radius']"
                    style="display: inline-block; width: 130px"
                  />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-1']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-2']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-3']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-4']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-5']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-6']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-7']" />
                  <lay-color-picker v-model="appStore.themeVariable['--global-neutral-color-8']" />
                  <lay-button
                    :fluid="true"
                    border="green"
                    border-style="dashed"
                    @click="resetThemeVariable"
                  >
                    重置配置
                  </lay-button>
                </div>
              </template>
            </lay-dropdown>
          </li>
          <li class="layui-nav-item">
            <a
              href="https://gitee.com/liwncy"
              target="_blank"
              rel="noopener noreferrer"
              style="display: inline-block; padding-right: 10px"
            >
              <lay-icon type="layui-icon-gitee" size="18px" color="#C71D23" />
            </a>
            <a
              href="https://github.com/liwncy"
              target="_blank"
              rel="noopener noreferrer"
              style="display: inline-block; padding-left: 10px"
            >
              <lay-icon type="layui-icon-github" size="18px" color="#213547" />
            </a>
          </li>
          <li class="layui-nav-item">
            <a href="javascript:void(0);">
              <lay-switch
                v-model="appStore.theme"
                class="switch"
                onswitch-value="dark"
                unswitch-value="light"
                onswitch-color="rgba(255, 255, 255, 0.05)"
                unswitch-color="rgba(255, 255, 255, 0.05)"
              >
                <template #onswitch-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="rgba(60, 60, 60, .7)"
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.1,22c-0.3,0-0.6,0-0.9,0c-5.5-0.5-9.5-5.4-9-10.9c0.4-4.8,4.2-8.6,9-9c0.4,0,0.8,0.2,1,0.5c0.2,0.3,0.2,0.8-0.1,1.1c-2,2.7-1.4,6.4,1.3,8.4c2.1,1.6,5,1.6,7.1,0c0.3-0.2,0.7-0.3,1.1-0.1c0.3,0.2,0.5,0.6,0.5,1c-0.2,2.7-1.5,5.1-3.6,6.8C16.6,21.2,14.4,22,12.1,22zM9.3,4.4c-2.9,1-5,3.6-5.2,6.8c-0.4,4.4,2.8,8.3,7.2,8.7c2.1,0.2,4.2-0.4,5.8-1.8c1.1-0.9,1.9-2.1,2.4-3.4c-2.5,0.9-5.3,0.5-7.5-1.1C9.2,11.4,8.1,7.7,9.3,4.4z"
                    />
                  </svg>
                </template>
                <template #unswitch-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="rgba(60, 60, 60, .7)"
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18zM12,8c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C16,9.8,14.2,8,12,8z"
                    />
                    <path d="M12,4c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,3.6,12.6,4,12,4z" />
                    <path d="M12,24c-0.6,0-1-0.4-1-1v-2c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,23.6,12.6,24,12,24z" />
                    <path
                      d="M5.6,6.6c-0.3,0-0.5-0.1-0.7-0.3L3.5,4.9c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C6.2,6.5,5.9,6.6,5.6,6.6z"
                    />
                    <path
                      d="M19.8,20.8c-0.3,0-0.5-0.1-0.7-0.3l-1.4-1.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C20.3,20.7,20,20.8,19.8,20.8z"
                    />
                    <path d="M3,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S3.6,13,3,13z" />
                    <path d="M23,13h-2c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S23.6,13,23,13z" />
                    <path
                      d="M4.2,20.8c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C4.7,20.7,4.5,20.8,4.2,20.8z"
                    />
                    <path
                      d="M18.4,6.6c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C18.9,6.5,18.6,6.6,18.4,6.6z"
                    />
                  </svg>
                </template>
              </lay-switch>
            </a>
          </li>
        </ul>
      </lay-header>

      <router-view />
    </lay-layout>
  </lay-config-provider>
</template>

<style scoped>
.layui-layout-document {
  min-height: 100vh;
}

.layui-layout-document > .layui-header {
  position: fixed;
  z-index: 99;
  width: 100%;
  border-bottom: 1px solid #eeeeee;
  background-image: radial-gradient(transparent 1px, #ffffff 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
}

.layui-layout-document .layui-header > .layui-nav {
  background-color: transparent;
}

.layui-layout-document .layui-header .layui-nav .layui-nav-item *,
.layui-layout-document .layui-header .layui-nav .layui-nav-item a,
.layui-layout-document .layui-header .layui-nav .layui-nav-item a:hover {
  color: rgba(0, 0, 0, 0.8);
}

.layui-layout-document .layui-header > .layui-nav .layui-active * {
  color: var(--global-checked-color) !important;
}

.layui-layout-document .layui-header .layui-logo {
  padding-left: 15px;
  text-align: left;
  cursor: pointer;
}

.layui-layout-document .layui-logo img {
  left: 15px;
  height: 42px;
  margin-top: -4px;
  border-radius: 10px;
}

.layui-layout-document .layui-logo .title {
  margin-left: 12px;
  color: #213547;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.2px;
  opacity: 0.86;
}

.layui-layout-document .layui-header .layui-form-switch {
  border: 1px solid rgba(60, 60, 60, 0.29);
  background-color: #f1f1f1 !important;
}

.switch svg {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
}

.theme-panel {
  width: 380px;
  padding: 0 10px 10px;
}

.theme-panel > * {
  margin-top: 9px;
  margin-right: 9px;
}

.layui-layout-document.site-theme-dark > .layui-header {
  border-bottom-color: var(--site-border);
  background: rgba(20, 27, 24, 0.9);
}

.layui-layout-document.site-theme-dark .layui-header .layui-nav .layui-nav-item *,
.layui-layout-document.site-theme-dark .layui-header .layui-nav .layui-nav-item a,
.layui-layout-document.site-theme-dark .layui-logo .title {
  color: rgba(255, 255, 255, 0.86);
}
</style>
