<script setup lang="ts">
import '@/assets/styles/hot-rank.css'
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageHeader from '@/components/SitePageHeader.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { getRankClass } from '@/utils/hot-article'
import { useDailyHot } from './useDailyHot'

const {
  menus,
  currentPath,
  currentMenu,
  hotList,
  loading,
  loadingMore,
  isMenuVisible,
  menuVisible,
  platformDesc,
  handleMenuClick,
  loadMore,
  openLink,
  formatHotValue,
} = useDailyHot()
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

    <lay-container :fluid="true" class="hot-main-container">
        <SitePageHeader
          :title="('title' in currentMenu && currentMenu.title) || '今日热榜'"
          :subtitle="platformDesc"
        >
          <template #extra>
            <div class="hot-summary-card">
              <span>今日收录</span>
              <strong>{{ hotList.length }}</strong>
              <em>条热点</em>
            </div>
          </template>
        </SitePageHeader>

        <div class="hot-container-panel">
          <div class="hot-container-inner">
            <div v-if="hotList.length > 0 && !loading" class="hot-list">
              <div
                v-for="item in hotList"
                :key="item.rank"
                class="hot-item"
                @click="openLink(item.link)"
              >
                <div class="hot-rank" :class="getRankClass(item.rank)">{{ item.rank }}</div>
                <div class="hot-content">
                  <h3 class="hot-title">{{ item.title }}</h3>
                  <div class="hot-meta">
                    <span class="hotness">{{ formatHotValue(item.hotValue) }} 热度</span>
                    <span>{{ item.time }}</span>
                  </div>
                </div>
                <div class="hot-open-indicator">
                  <i class="layui-icon layui-icon-right" />
                </div>
              </div>
            </div>

            <div v-else-if="loading" class="hot-loading">
              <div class="hot-spinner" />
              <p>加载中...</p>
            </div>

            <div v-else class="hot-empty">
              <div class="hot-empty-icon">📅</div>
              <h3>暂无数据</h3>
              <p>该平台暂无热点数据</p>
            </div>

            <div v-if="hotList.length > 0" class="hot-load-more">
              <lay-button size="sm" :loading="loadingMore" @click="loadMore">
                {{ loadingMore ? '加载中...' : '加载更多' }}
              </lay-button>
            </div>
          </div>
        </div>
      </lay-container>
  </SitePageLayout>
</template>
