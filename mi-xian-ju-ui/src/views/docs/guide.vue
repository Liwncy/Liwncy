<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { docMenus } from '@/data/docs'

const route = useRoute()
const router = useRouter()
const currentPath = ref(route.path)
const isMenuDisplay = ref(false)
const menuDisplay = computed(() => (isMenuDisplay.value ? '220px' : '0px'))

watch(
  () => route.path,
  (path) => {
    currentPath.value = path
  },
  { immediate: true },
)

function handleMenuOpen(open: boolean) {
  isMenuDisplay.value = open
}

function handleClick(path: string) {
  router.push(path)
  handleMenuOpen(false)
}
</script>

<template>
  <lay-layout class="docs-guide-layout">
    <lay-side class="layui-menu-ref-2">
      <lay-scroll style="overflow-y: scroll">
        <ul class="layui-menu layui-menu-lg layui-menu-docs">
          <li
            v-for="menu in docMenus"
            :key="menu.id"
            class="layui-menu-item-group"
            lay-options="{type: 'group', isAllowSpread: true}"
          >
            <div class="layui-menu-body-title">{{ menu.title }}</div>
            <hr />
            <ul>
              <li
                v-for="children in menu.children"
                :key="children.slug"
                :class="[currentPath === children.path ? 'layui-menu-item-checked2' : '']"
                @click="handleClick(children.path)"
              >
                <div class="layui-menu-body-title">
                  <router-link :to="children.path" :title="children.title">
                    <span>{{ children.menuTitle }}</span>
                    <span class="layui-font-12 layui-font-gray">
                      {{ children.subTitle }}
                    </span>
                  </router-link>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </lay-scroll>
    </lay-side>

    <lay-body id="docsContent">
      <div
        class="layui-menu-toggle"
        style="width: auto !important; height: auto !important; padding: 0 !important; padding-left: 8px"
        @click="handleMenuOpen(true)"
      >
        <lay-icon type="layui-icon-menu-fill" style="font-size: 32px" />
      </div>
      <div class="docs-content-wrap" @click="handleMenuOpen(false)">
        <div class="docs-markdown-body">
          <router-view />
        </div>
      </div>
    </lay-body>
    <lay-backtop target="#docsContent" :showHeight="100" :bottom="32" :right="32" position="absolute" />
  </lay-layout>
</template>

<style>
.docs-guide-layout {
  min-height: 100vh;
}

.layui-layout-document > .layui-layout > .layui-side {
  position: fixed;
  z-index: 98;
  height: calc(100% - 60px);
  margin-top: 60px;
  overflow-x: hidden;
  border-right: 1px solid var(--docs-border-color, #d8dde3);
}

.layui-layout-document > .layui-layout > .layui-body {
  position: absolute;
  left: 200px;
  width: calc(100% - 200px);
  height: calc(100% - 60px);
  margin-top: 60px;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--site-bg);
  background-image:
    radial-gradient(circle at 12% 8%, rgba(22, 186, 170, 0.05) 0%, transparent 42%),
    radial-gradient(circle at 88% 92%, rgba(22, 183, 119, 0.04) 0%, transparent 42%);
}

.layui-layout-document .layui-menu-docs {
  padding-top: 10px;
}

.layui-layout-document .layui-menu-docs .layui-menu-body-title .layui-font-gray {
  padding-left: 10px;
}

.layui-layout-document .layui-menu-docs .layui-menu-body-title a {
  overflow: hidden;
  text-overflow: ellipsis;
}

.layui-layout-document .layui-menu li,
.layui-layout-document .layui-menu-body-title a {
  padding: 5px 15px;
}

.layui-layout-document .layui-side hr {
  margin: 8px;
  border-color: var(--docs-border-color, #d8dde3);
}

.layui-layout-document .layui-menu-item-checked2 {
  border-radius: 6px;
  background: rgba(22, 186, 170, 0.1) !important;
}

.layui-layout-document .layui-menu-item-checked2 .layui-menu-body-title a {
  color: var(--site-accent) !important;
}

.docs-content-wrap {
  min-height: 100%;
  margin-right: 180px;
  padding: 20px;
  transition: margin 240ms 60ms;
}

.layui-menu-toggle {
  display: none;
}

.site-theme-dark.layui-layout-document > .layui-layout > .layui-side {
  border-right-color: var(--docs-border-color-dark, rgba(255, 255, 255, 0.18));
  background: var(--site-surface);
}

@media screen and (max-width: 768px) {
  .layui-menu-toggle {
    display: block !important;
  }

  .layui-menu-ref-2 {
    width: v-bind(menuDisplay) !important;
  }

  .layui-layout-document > .layui-layout > .layui-body {
    left: 0;
    width: 100%;
  }

  .docs-content-wrap {
    margin-right: 0;
    padding: 16px;
  }
}
</style>
