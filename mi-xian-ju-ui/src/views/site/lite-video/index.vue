<script setup lang="ts">
import '@/assets/styles/lite-video.css'
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { useLiteVideo } from './useLiteVideo'

const {
  menus,
  currentPath,
  currentMenu,
  menuDescription,
  isMenuVisible,
  menuVisible,
  xgPlayerRef,
  loading,
  videoStats,
  recentSources,
  getSourceIcon,
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

    <div class="lite-video-app">
      <header class="lite-video-app-header">
        <div class="container">
          <div class="lite-video-header-content">
            <div class="lite-video-header-left">
              <h1 class="lite-video-app-title">
                <i class="layui-icon layui-icon-video" />
                {{ currentMenu.title || '视频源' }}
              </h1>
              <p class="lite-video-app-subtitle">{{ menuDescription }}</p>
            </div>
            <div class="lite-video-header-right">
              <div class="lite-video-top-stats">
                <div class="stat-item">
                  <span class="stat-label">播放次数</span>
                  <span class="stat-value">{{ videoStats.playCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">分辨率</span>
                  <span class="stat-value">{{ videoStats.resolution }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">视频时长</span>
                  <span class="stat-value">{{ videoStats.duration }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="lite-video-main">
        <div class="container">
          <div class="lite-video-player-container">
            <div class="lite-video-player-wrapper">
              <div class="lite-video-player-header">
                <h2 class="lite-video-player-title">
                  <span>{{ currentMenu.title || '选择视频源' }}</span>
                  <span v-if="currentMenu.id" class="lite-video-source-badge">当前视频源</span>
                </h2>
              </div>

              <div class="lite-video-player-content">
                <lay-loading :type="3" :loading="loading" :full="true" text="视频加载中...">
                  <div ref="xgPlayerRef" class="xg-player-container" />
                </lay-loading>
              </div>

              <div class="lite-video-player-controls">
                <lay-button
                  type="primary"
                  size="lg"
                  class="lite-video-refresh-button"
                  :disabled="!currentMenu.id"
                  :loading="loading"
                  @click="refreshVideo"
                >
                  <i class="layui-icon layui-icon-refresh" />
                  换一个视频
                </lay-button>
                <div v-if="currentMenu.id" class="lite-video-inline-stats">
                  <span class="stat-item">
                    <i class="layui-icon layui-icon-play" />
                    {{ videoStats.playCount }}次播放
                  </span>
                  <span class="stat-item">
                    <i class="layui-icon layui-icon-picture" />
                    {{ videoStats.resolution }}
                  </span>
                  <span class="stat-item">
                    <i class="layui-icon layui-icon-time" />
                    {{ videoStats.duration }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="lite-video-info-grid">
            <div class="lite-video-info-card">
              <div class="card-header">
                <i class="layui-icon layui-icon-info-circle" />
                <h3>视频源信息</h3>
              </div>
              <div class="card-body">
                <div v-if="currentMenu.title" class="lite-video-info-item">
                  <span class="lite-video-info-label">视频源：</span>
                  <span class="lite-video-info-value">{{ currentMenu.title }}</span>
                </div>
                <div v-if="menuDescription" class="lite-video-info-item">
                  <span class="lite-video-info-label">描述：</span>
                  <span class="lite-video-info-value">{{ menuDescription }}</span>
                </div>
                <div v-if="!currentMenu.id" class="lite-video-info-item">
                  <span class="lite-video-info-label">提示：</span>
                  <span class="lite-video-info-value">请从左侧菜单选择一个视频源</span>
                </div>
              </div>
            </div>

            <div class="lite-video-info-card">
              <div class="card-header">
                <i class="layui-icon layui-icon-play-circle" />
                <h3>视频状态</h3>
              </div>
              <div class="card-body">
                <div v-if="currentMenu.id" class="lite-video-status-progress">
                  <div class="progress-label">视频加载进度</div>
                  <lay-progress
                    :percent="videoStats.loadProgress"
                    show-text
                    :height="8"
                    theme="#52c41a"
                  />
                </div>
                <div v-else class="lite-video-status-tips">
                  <i class="layui-icon layui-icon-tips" />
                  <span>选择视频源后将显示加载状态</span>
                </div>
              </div>
            </div>

            <div class="lite-video-info-card full-width">
              <div class="card-header">
                <i class="layui-icon layui-icon-data-line" />
                <h3>视频统计</h3>
              </div>
              <div class="card-body">
                <div class="lite-video-stats-grid">
                  <div class="lite-video-stat-card">
                    <div class="stat-icon">
                      <i class="layui-icon layui-icon-play" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ videoStats.playCount }}</div>
                      <div class="stat-label">播放次数</div>
                    </div>
                  </div>
                  <div class="lite-video-stat-card">
                    <div class="stat-icon">
                      <i class="layui-icon layui-icon-picture" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ videoStats.resolution }}</div>
                      <div class="stat-label">分辨率</div>
                    </div>
                  </div>
                  <div class="lite-video-stat-card">
                    <div class="stat-icon">
                      <i class="layui-icon layui-icon-time" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ videoStats.duration }}</div>
                      <div class="stat-label">视频时长</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="recentSources.length" class="lite-video-info-card full-width">
              <div class="card-header">
                <i class="layui-icon layui-icon-grid" />
                <h3>猜你喜欢</h3>
              </div>
              <div class="card-body">
                <div class="lite-video-recommended-grid">
                  <div
                    v-for="(source, index) in recentSources"
                    :key="source.id"
                    class="lite-video-source-card"
                    :class="{ active: currentPath === source.id }"
                    @click="handleMenuClick(source)"
                  >
                    <div class="lite-video-source-icon">{{ getSourceIcon(index) }}</div>
                    <div class="lite-video-source-info">
                      <div class="lite-video-source-name">{{ source.title }}</div>
                      <div class="lite-video-source-desc">
                        {{ source.payload?.description || source.subtitle || '无描述' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="lite-video-app-footer">
        <div class="container">
          <div class="lite-video-footer-content">
            <div class="lite-video-footer-left">
              <p>© {{ new Date().getFullYear() }} 视频播放器</p>
            </div>
            <div class="lite-video-footer-right">
              <p class="lite-video-footer-tip">提示：视频内容来源于所选视频源，仅供学习参考</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </SitePageLayout>
</template>
