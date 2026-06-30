<script setup lang="ts">
import '@/assets/styles/hot-rank.css'
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { getRankClass } from '@/utils/hot-article'
import { useHotBans } from './useHotBans'

const {
  menus,
  currentPath,
  currentMenu,
  tabTitleList,
  currentTab,
  loading,
  isMenuVisible,
  menuVisible,
  articleList,
  platformDesc,
  handleMenuClick,
  handleTabChange,
  loadMore,
  openLink,
} = useHotBans()
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
        <div class="hot-page-header">
          <h1>{{ ('title' in currentMenu && currentMenu.title) || '热榜' }}</h1>
          <p class="subtitle">{{ platformDesc }}</p>
        </div>

        <div class="hot-tab-panel">
          <lay-tab v-model="currentTab" type="brief" tab-position="top" @change="handleTabChange">
            <lay-tab-item
              v-for="item in tabTitleList"
              :key="item.id"
              :id="item.id"
              :title="item.title"
            >
              <div class="hot-container-inner">
                <div v-if="articleList.length > 0 && !loading" class="hot-list">
                  <div
                    v-for="(item, index) in articleList"
                    :key="`${item.title}-${index}`"
                    class="hot-item"
                    @click="openLink(item.title_url)"
                  >
                    <div class="hot-rank" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
                    <div class="hot-content">
                      <h3 class="hot-title">{{ item.title }}</h3>
                      <p v-if="item.description" class="hot-description">{{ item.description }}</p>
                      <div class="hot-meta">
                        <span v-if="item.article_time">{{ item.article_time }}</span>
                        <span v-if="item.author_info">{{ item.author_info }}</span>
                        <span v-if="item.hot_value" class="hotness">{{ item.hot_value }} 热度</span>
                      </div>
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

                <div v-if="articleList.length > 0" class="hot-load-more">
                  <lay-button size="sm" :loading="loading" @click="loadMore">
                    {{ loading ? '加载中...' : '加载更多' }}
                  </lay-button>
                </div>
              </div>
            </lay-tab-item>
          </lay-tab>
        </div>
      </lay-container>
  </SitePageLayout>
</template>
