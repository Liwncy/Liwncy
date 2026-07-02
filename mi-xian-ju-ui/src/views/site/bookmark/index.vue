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
        <SitePageHeader title="常用书签" subtitle="把常去之处收进一册，按分类或关键词快速抵达">
          <template #extra>
            <div class="bookmark-overview">
              <div>
                <span class="overview-label">当前分类</span>
                <strong>{{ currentCategoryName }}</strong>
              </div>
              <div>
                <span class="overview-label">可见书签</span>
                <strong>{{ bookShowData.length }}</strong>
              </div>
              <div>
                <span class="overview-label">总收藏</span>
                <strong>{{ allBooksData.length }}</strong>
              </div>
            </div>
          </template>
        </SitePageHeader>

        <div class="bookmark-control-panel">
          <div class="control-copy">
            <span class="control-kicker">LINK ATLAS</span>
            <h2>今日从哪一页开始？</h2>
            <p>切换收藏源、定位分类，或者直接搜索站点名称与描述。</p>
          </div>
          <div class="control-fields">
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
            <lay-input
              v-model="filterBookText"
              prefix-icon="layui-icon-search"
              placeholder="搜索书签、描述..."
              :allow-clear="true"
              class="search-input"
            />
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
.bookmark-overview {
  display: flex;
  gap: 12px;
  padding: 10px;
  border: 1px solid rgba(44, 51, 48, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.bookmark-overview > div {
  min-width: 86px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(22, 186, 170, 0.06);
  text-align: center;
}

.overview-label {
  display: block;
  margin-bottom: 4px;
  color: var(--site-muted);
  font-size: 12px;
}

.bookmark-overview strong {
  display: block;
  color: var(--site-accent);
  font-size: 18px;
  line-height: 1.1;
}

.bookmark-control-panel {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-bottom: 22px;
  padding: 22px 24px;
  overflow: hidden;
  border: 1px solid var(--site-border);
  border-radius: 20px;
  background:
    radial-gradient(circle at 8% 20%, rgba(22, 186, 170, 0.12), transparent 32%),
    linear-gradient(135deg, rgba(255, 252, 245, 0.92), rgba(244, 249, 246, 0.88));
  box-shadow: var(--site-shadow);
}

.bookmark-control-panel::after {
  content: '';
  position: absolute;
  right: -80px;
  bottom: -100px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 38px solid rgba(22, 186, 170, 0.06);
  pointer-events: none;
}

.control-copy {
  position: relative;
  z-index: 1;
}

.control-kicker {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--site-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.control-copy h2 {
  margin: 0;
  color: var(--site-ink);
  font-family: var(--site-font-title);
  font-size: 22px;
  letter-spacing: 0.05em;
}

.control-copy p {
  margin: 8px 0 0;
  color: var(--site-muted);
  font-size: 14px;
}

.control-fields {
  position: relative;
  z-index: 1;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.bookmark-card {
  display: flex;
  align-items: flex-start;
  min-height: 112px;
  padding: 18px 18px 16px;
  background:
    linear-gradient(135deg, rgba(255, 252, 245, 0.96), rgba(255, 255, 255, 0.82));
  border-radius: 18px;
  box-shadow: 0 10px 32px rgba(44, 51, 48, 0.07);
  border: 1px solid var(--site-border);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.bookmark-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--site-accent-gradient);
  opacity: 0;
  transition: opacity 0.25s ease;
  mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.18), transparent 45%);
}

.bookmark-card::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: rgba(22, 186, 170, 0.07);
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.bookmark-card:hover {
  box-shadow: 0 18px 44px rgba(44, 51, 48, 0.12);
  transform: translateY(-5px);
  border-color: rgba(22, 186, 170, 0.35);
}

.bookmark-card:hover::before {
  opacity: 0.55;
}

.bookmark-card:hover::after {
  opacity: 0.9;
  transform: scale(1.18);
}

.bookmark-icon {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  margin-right: 16px;
  padding: 8px;
  border: 1px solid rgba(44, 51, 48, 0.08);
  border-radius: 16px;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 20%, rgba(22, 186, 170, 0.12), transparent 52%),
    rgba(255, 255, 255, 0.76);
  box-shadow: 0 8px 18px rgba(44, 51, 48, 0.08);
}

.bookmark-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.bookmark-content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  padding-top: 3px;
}

.bookmark-title {
  font-family: var(--site-font-title);
  font-size: 16px;
  font-weight: 700;
  color: var(--site-ink);
  margin: 0 0 8px;
  letter-spacing: 0.03em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-description {
  font-size: 13px;
  color: var(--site-muted);
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  line-height: 1.6;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.bookmark-link {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(44, 51, 48, 0.04);
  color: var(--site-muted);
  transition: all 0.25s ease;
}

.bookmark-card:hover .bookmark-link {
  background: var(--site-accent);
  color: #fff;
  transform: translateX(2px);
}

:global(.site-theme-dark) .bookmark-overview,
:global(.site-theme-dark) .bookmark-control-panel,
:global(.site-theme-dark) .bookmark-card {
  background:
    linear-gradient(135deg, rgba(30, 39, 35, 0.94), rgba(22, 29, 26, 0.88));
}

:global(.site-theme-dark) .bookmark-icon {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

@media screen and (max-width: 768px) {
  .bookmark-overview,
  .bookmark-control-panel,
  .control-fields {
    flex-direction: column;
    align-items: stretch;
  }

  .bookmark-overview {
    width: 100%;
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
