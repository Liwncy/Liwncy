<script setup lang="ts">
import '@/assets/styles/lite-word.css'
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageHeader from '@/components/SitePageHeader.vue'
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

    <lay-container :fluid="true" class="site-page lite-word-page">
      <SitePageHeader
        :title="currentMenu.title || '一点文案'"
        :subtitle="currentMenu.payload?.description || '选择左侧菜单，获取随机文案'"
      />

      <div class="lite-word-body">
        <transition name="lite-word-fade" mode="out-in">
          <div v-if="hasActiveMenu" key="content" class="lite-word-content">
            <div class="site-page-card lite-word-card">
              <div class="site-page-card-header lite-word-card-header">
                <h3>{{ currentMenu.payload?.name || currentMenu.title }}</h3>
                <span v-if="currentMenu.subtitle" class="lite-word-card-badge">
                  {{ currentMenu.subtitle }}
                </span>
              </div>

              <div class="site-page-card-body lite-word-card-body">
                <div class="lite-word-preview">
                  <h4 class="lite-word-preview-title">文案内容</h4>
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
          </div>

          <div v-else key="empty" class="site-page-empty lite-word-empty">
            <div class="site-page-empty-icon">📝</div>
            <h3>请选择一个文案分类</h3>
            <p>从左侧菜单中选择一个分类，查看对应的文案内容</p>
          </div>
        </transition>
      </div>

      <footer class="site-page-footer">
        <p>© {{ new Date().getFullYear() }} 一点文案 · 芈仙居</p>
      </footer>
    </lay-container>
  </SitePageLayout>
</template>
