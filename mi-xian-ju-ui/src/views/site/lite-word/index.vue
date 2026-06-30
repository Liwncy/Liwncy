<script setup lang="ts">
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
          <h1>{{ currentMenu.title || '一点文案' }}</h1>
          <p>{{ currentMenu.payload?.description || '选择左侧分类，获取随机文案' }}</p>
        </header>

        <lay-card v-if="currentMenu.payload" class="word-card">
          <template #title>
            <div class="word-card-title">
              <span>{{ currentMenu.payload.platform || currentMenu.title }}</span>
              <span v-if="currentMenu.subtitle" class="word-badge">{{ currentMenu.subtitle }}</span>
            </div>
          </template>

          <lay-loading :loading="loading">
            <div class="preview-content">
              <p v-for="(item, index) in contentPreview" :key="index" class="preview-item">
                {{ item }}
              </p>
            </div>
          </lay-loading>

          <div class="word-actions">
            <lay-button type="primary" :loading="loading" @click="copyContent">复制文案</lay-button>
            <lay-button :loading="loading" @click="refreshContent">再来一条</lay-button>
          </div>
        </lay-card>

        <div v-else class="empty-state">
          <p>请从左侧选择一个文案分类</p>
        </div>
      </lay-container>
  </SitePageLayout>
</template>

<style scoped>
.lite-word-container {
  padding: 24px;
  max-width: 960px;
}

.lite-word-header h1 {
  margin: 0 0 8px;
  font-size: 24px;
}

.lite-word-header p {
  margin: 0 0 20px;
  color: #666;
}

.word-card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e3f2fd;
  color: #1976d2;
}

.preview-content {
  min-height: 180px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-item {
  margin: 0 0 12px;
  line-height: 1.7;
  color: #444;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.word-actions {
  display: flex;
  gap: 12px;
}

.empty-state {
  padding: 48px;
  text-align: center;
  color: #999;
}
</style>
