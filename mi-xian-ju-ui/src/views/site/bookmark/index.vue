<script setup lang="ts">
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageHeader from '@/components/SitePageHeader.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { useBookmark } from './useBookmark'

const {
  menus,
  currentPath,
  currentCategoryName,
  filterBookText,
  dataSource,
  bookShowData,
  allBooksData,
  loading,
  isMenuVisible,
  menuVisible,
  loadBookMarks,
  handleMenuClick,
  openLink,
  handleImageError,
} = useBookmark()
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

    <lay-container :fluid="true" class="site-page site-page--wide bookmark-page">
        <SitePageHeader title="常用书签" subtitle="分类浏览与搜索你的书签收藏" />

        <div class="site-page-toolbar">
          <div class="toolbar-left">
            <lay-select
              v-model="dataSource"
              placeholder="切换源"
              class="data-source-select"
              @change="loadBookMarks"
            >
              <lay-select-option value="0" label="我的书签" />
              <lay-select-option value="1" label="喜欢书签" />
              <lay-select-option value="2" label="随机生成" />
            </lay-select>
          </div>
          <div class="toolbar-right">
            <lay-input
              v-model="filterBookText"
              prefix-icon="layui-icon-search"
              placeholder="搜索书签..."
              :allow-clear="true"
              class="search-input"
            />
          </div>
        </div>

        <div v-if="allBooksData.length > 0" class="site-page-stats-bar">
          <div class="stat-item">
            <span class="stat-label">当前分类：</span>
            <span class="stat-value">{{ currentCategoryName }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">书签数量：</span>
            <span class="stat-value">{{ bookShowData.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总书签：</span>
            <span class="stat-value">{{ allBooksData.length }}</span>
          </div>
        </div>

        <div class="bookmarks-container">
          <div v-if="bookShowData.length === 0 && !loading" class="site-page-empty">
            <div class="site-page-empty-icon">📚</div>
            <h3>暂无书签</h3>
            <p>该分类下暂无书签内容</p>
          </div>

          <div v-else-if="loading" class="site-page-loading">
            <div class="site-page-spinner" />
            <p>加载中...</p>
          </div>

          <div v-else class="bookmarks-grid">
            <div
              v-for="book in bookShowData"
              :key="book.id"
              class="bookmark-card"
              @click="openLink(book.links)"
            >
              <div class="bookmark-icon">
                <img :src="book.avatar" :alt="book.title" @error="handleImageError" />
              </div>
              <div class="bookmark-content">
                <h3 class="bookmark-title" :title="book.title">{{ book.title }}</h3>
                <p class="bookmark-description" :title="book.description">{{ book.description }}</p>
              </div>
              <div class="bookmark-link">
                <i class="layui-icon layui-icon-right" />
              </div>
            </div>
          </div>
        </div>
      </lay-container>
  </SitePageLayout>
</template>

<style scoped>
.bookmark-page .stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-source-select {
  width: 180px;
}

.search-input {
  width: 300px;
}

.bookmarks-container {
  min-height: 400px;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.bookmark-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--site-surface);
  border-radius: var(--site-radius);
  box-shadow: var(--site-shadow);
  border: 1px solid var(--site-border);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.bookmark-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--site-accent-gradient);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.bookmark-card:hover {
  box-shadow: var(--site-shadow-hover);
  transform: translateY(-3px);
  border-color: rgba(22, 186, 170, 0.35);
}

.bookmark-card:hover::before {
  opacity: 1;
}

.bookmark-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(44, 51, 48, 0.04);
}

.bookmark-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bookmark-content {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--site-ink);
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-description {
  font-size: 13px;
  color: var(--site-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-link {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(44, 51, 48, 0.05);
  color: var(--site-muted);
}

.bookmark-card:hover .bookmark-link {
  background: var(--site-accent);
  color: #fff;
}

@media screen and (max-width: 768px) {
  .site-page-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .data-source-select,
  .search-input {
    width: 100%;
  }

  .bookmarks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
