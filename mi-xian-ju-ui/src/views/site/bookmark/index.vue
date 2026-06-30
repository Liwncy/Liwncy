<script setup lang="ts">
import MenuSidebar from '@/components/MenuSidebar.vue'
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

    <lay-container :fluid="true" class="main-container">
        <div class="toolbar">
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

        <div v-if="allBooksData.length > 0" class="stats-bar">
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
          <div v-if="bookShowData.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>暂无书签</h3>
            <p>该分类下暂无书签内容</p>
          </div>

          <div v-else-if="loading" class="loading-state">
            <div class="spinner" />
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
.main-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
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

.stats-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 12px;
  border: 1px solid #e8eaed;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

.stat-value {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.bookmarks-container {
  min-height: 400px;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64px;
  opacity: 0.4;
  margin-bottom: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  cursor: pointer;
  transition: all 0.3s ease;
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
  background: linear-gradient(135deg, #16a085 0%, #2ecc71 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.bookmark-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: #16a085;
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
  background: #f8f9fa;
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
  color: #2c3e50;
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-description {
  font-size: 13px;
  color: #7f8c8d;
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
  background: #f8f9fa;
  color: #95a5a6;
}

.bookmark-card:hover .bookmark-link {
  background: #16a085;
  color: #fff;
}

@media screen and (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .data-source-select,
  .search-input {
    width: 100%;
  }

  .stats-bar {
    flex-direction: column;
    gap: 12px;
  }

  .bookmarks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
