<script setup lang="ts">
import '@/assets/styles/lite-word.css'
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { useLiteWord } from './useLiteWord'

const {
  menus,
  currentPath,
  currentMenu,
  isMenuVisible,
  menuVisible,
  contentPreview,
  loading,
  hasActiveMenu,
  handleMenuClick,
  copyContent,
  refreshContent,
} = useLiteWord()
</script>

<template>
  <SitePageLayout :menu-visible="menuVisible">
    <template #sidebar>
      <MenuSidebar
        v-model:visible="isMenuVisible"
        :menus="menus"
        :current-path="currentPath"
        @child-click="handleMenuClick"
      />
    </template>

    <lay-container :fluid="true" class="lite-word-container">
      <header class="lite-word-header">
        <h1>{{ currentMenu.title || '欢迎使用 LiteWord' }}</h1>
        <p>{{ currentMenu.payload?.description || '选择左侧菜单查看不同的文案内容' }}</p>
      </header>

      <div class="lite-word-body">
        <transition name="lite-word-fade" mode="out-in">
          <div v-if="hasActiveMenu" key="content" class="lite-word-content">
            <lay-card class="lite-word-card">
              <template #header>
                <div class="lite-word-card-header">
                  <span class="lite-word-card-title">
                    {{ currentMenu.payload?.name || currentMenu.title }}
                  </span>
                  <span v-if="currentMenu.subtitle" class="lite-word-card-badge">
                    {{ currentMenu.subtitle }}
                  </span>
                </div>
              </template>

              <div class="lite-word-card-body">
                <div class="lite-word-info">
                  <div class="lite-word-preview">
                    <h3>文案内容</h3>
                    <lay-loading :loading="loading">
                      <div class="lite-word-preview-content">
                        <p
                          v-for="(item, index) in contentPreview"
                          :key="index"
                          class="lite-word-preview-item"
                        >
                          {{ item }}
                        </p>
                      </div>
                    </lay-loading>
                  </div>

                  <div class="lite-word-actions">
                    <lay-button type="primary" size="lg" :loading="loading" @click="copyContent">
                      <i class="layui-icon layui-icon-templeate-one" />
                      复制文案
                    </lay-button>
                    <lay-button type="normal" size="lg" :loading="loading" @click="refreshContent">
                      <i class="layui-icon layui-icon-refresh" />
                      再来一条
                    </lay-button>
                  </div>
                </div>
              </div>
            </lay-card>
          </div>

          <div v-else key="empty" class="lite-word-empty">
            <div class="lite-word-empty-icon">📝</div>
            <h3>请选择一个文案分类</h3>
            <p>从左侧菜单中选择一个分类，查看对应的文案内容</p>
          </div>
        </transition>
      </div>

      <footer class="lite-word-footer">
        <p>© {{ new Date().getFullYear() }} LiteWord - 一点文案</p>
      </footer>
    </lay-container>
  </SitePageLayout>
</template>
