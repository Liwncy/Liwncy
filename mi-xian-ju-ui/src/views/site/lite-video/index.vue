<script setup lang="ts">
import '@/assets/styles/lite-video.css'
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { useLiteVideo } from './useLiteVideo'

const {
  menus,
  currentPath,
  currentMenu,
  isMenuVisible,
  menuVisible,
  xgPlayerRef,
  loading,
  videoStats,
  recentSources,
  handleMenuClick,
  refreshVideo,
} = useLiteVideo()
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

    <lay-container :fluid="true" class="lite-video-container">
        <header class="lite-video-header">
          <div>
            <h1>{{ currentMenu.title || '视频源' }}</h1>
            <p>{{ currentMenu.payload?.description || '选择左侧视频源，随机播放' }}</p>
          </div>
          <div class="lite-video-stats">
            <div><span>播放</span><strong>{{ videoStats.playCount }}</strong></div>
            <div><span>分辨率</span><strong>{{ videoStats.resolution }}</strong></div>
            <div><span>时长</span><strong>{{ videoStats.duration }}</strong></div>
          </div>
        </header>

        <lay-card class="player-card">
          <lay-loading :loading="loading" text="视频加载中...">
            <div ref="xgPlayerRef" class="xg-player-container" />
          </lay-loading>
          <div class="player-actions">
            <lay-button type="primary" :loading="loading" @click="refreshVideo">换一个视频</lay-button>
            <lay-progress
              v-if="currentMenu.id"
              :percent="videoStats.loadProgress"
              show-text
              theme="#009688"
            />
          </div>
        </lay-card>

        <lay-card v-if="recentSources.length" title="同分类推荐">
          <div class="source-grid">
            <div
              v-for="source in recentSources"
              :key="source.id"
              class="source-card"
              :class="{ active: currentPath === source.id }"
              @click="handleMenuClick(source)"
            >
              <div class="source-name">{{ source.title }}</div>
              <div class="source-desc">{{ source.subtitle || '视频源' }}</div>
            </div>
          </div>
        </lay-card>
      </lay-container>
  </SitePageLayout>
</template>
