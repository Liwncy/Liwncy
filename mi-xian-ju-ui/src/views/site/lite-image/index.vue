<script setup lang="ts">
import '@/assets/styles/lite-image.css'
import MenuSidebar from '@/components/MenuSidebar.vue'
import SitePageHeader from '@/components/SitePageHeader.vue'
import SitePageLayout from '@/components/SitePageLayout.vue'
import { useLiteImage } from './useLiteImage'

const {
  menus,
  currentPath,
  currentMenu,
  isMenuVisible,
  menuVisible,
  imgUrl,
  currentImageIndex,
  loading,
  zoomLevel,
  rotation,
  imageOrientation,
  imgStyle,
  historyImages,
  imgWrapperRef,
  currentImageUrl,
  handleMenuClick,
  loadImage,
  handleImgLoad,
  handleImgError,
  prevImage,
  nextImage,
  switchImage,
  zoomIn,
  zoomOut,
  resetZoom,
  rotateImg,
  fitAuto,
  fitContain,
  fitOriginal,
  downloadImage,
  viewHistoryImage,
  formatTime,
  fitMode,
} = useLiteImage()
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

    <lay-container :fluid="true" class="site-page site-page--wide lite-image-container">
        <SitePageHeader
          :title="currentMenu.title || '走马观花'"
          :subtitle="currentMenu.payload?.description || '选择左侧图源，欣赏随机美图'"
        />

        <lay-row :space="10">
          <lay-col :md="16" :xs="24">
            <div class="img-section">
              <lay-loading :loading="loading">
                <div v-if="imgUrl && !Array.isArray(imgUrl)" class="img-display-area">
                  <div ref="imgWrapperRef" class="img-wrapper">
                    <img
                      :src="imgUrl"
                      alt="图片"
                      class="show-img"
                      :style="imgStyle"
                      @error="handleImgError"
                      @load="handleImgLoad"
                    />
                    <div class="img-toolbar">
                      <lay-button size="xs" @click="zoomIn">+</lay-button>
                      <lay-button size="xs" @click="zoomOut">-</lay-button>
                      <lay-button size="xs" @click="resetZoom">1:1</lay-button>
                      <lay-button size="xs" @click="rotateImg">↻</lay-button>
                      <span class="zoom-info">{{ Math.round(zoomLevel * 100) }}%</span>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="Array.isArray(imgUrl) && imgUrl.length"
                  class="multi-img-container"
                >
                  <div class="img-display-area">
                    <div ref="imgWrapperRef" class="img-wrapper">
                      <img
                        :src="currentImageUrl"
                        :alt="`图片 ${currentImageIndex + 1}`"
                        class="show-img"
                        :style="imgStyle"
                        @error="handleImgError"
                        @load="handleImgLoad"
                      />
                      <div class="img-toolbar">
                        <lay-button size="xs" @click="zoomIn">+</lay-button>
                        <lay-button size="xs" @click="zoomOut">-</lay-button>
                        <lay-button size="xs" @click="resetZoom">1:1</lay-button>
                        <lay-button size="xs" @click="rotateImg">↻</lay-button>
                        <span class="zoom-info">{{ Math.round(zoomLevel * 100) }}%</span>
                        <span class="image-counter">
                          {{ currentImageIndex + 1 }} / {{ imgUrl.length }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="imgUrl.length > 1" class="carousel-nav">
                    <lay-button size="sm" :disabled="currentImageIndex === 0" @click="prevImage">
                      上一张
                    </lay-button>
                    <lay-button
                      size="sm"
                      :disabled="currentImageIndex === imgUrl.length - 1"
                      @click="nextImage"
                    >
                      下一张
                    </lay-button>
                  </div>
                  <div v-if="imgUrl.length > 1" class="img-thumbnails">
                    <div
                      v-for="(url, index) in imgUrl"
                      :key="index"
                      class="thumbnail"
                      :class="{ active: currentImageIndex === index }"
                      @click="switchImage(index)"
                    >
                      <img :src="url" :alt="`缩略图 ${index + 1}`" />
                    </div>
                  </div>
                </div>

                <lay-empty v-else description="暂无图片，点击换一张加载" />
              </lay-loading>
            </div>
          </lay-col>

          <lay-col :md="8" :xs="24">
            <div class="site-page-card description-card">
              <div class="site-page-card-header">
                <i class="layui-icon layui-icon-picture" />
                <h3>图片详情 · {{ currentMenu.title }}</h3>
              </div>
              <div class="site-page-card-body">
                <div class="info-item">
                <span class="label">数量</span>
                <span class="value">
                  {{ Array.isArray(imgUrl) ? imgUrl.length : imgUrl ? 1 : 0 }} 张
                </span>
              </div>
              <div class="info-item">
                <span class="label">显示比例</span>
                <span class="value">{{ Math.round(zoomLevel * 100) }}%</span>
              </div>
              <div class="info-item">
                <span class="label">旋转</span>
                <span class="value">{{ rotation }}°</span>
              </div>
              <div class="info-item">
                <span class="label">方向</span>
                <span class="value">{{ imageOrientation }}</span>
              </div>
              <div class="action-buttons">
                <lay-button type="primary" @click="loadImage">换一张</lay-button>
                <lay-button v-if="currentImageUrl" @click="downloadImage">下载</lay-button>
              </div>
              <lay-button-group class="fit-buttons">
                <lay-button size="sm" :type="fitMode === 'auto' ? 'primary' : 'normal'" @click="fitAuto">
                  智能
                </lay-button>
                <lay-button
                  size="sm"
                  :type="fitMode === 'contain' ? 'primary' : 'normal'"
                  @click="fitContain"
                >
                  适应
                </lay-button>
                <lay-button size="sm" :type="fitMode === 'fill' ? 'primary' : 'normal'" @click="fitOriginal">
                  原始
                </lay-button>
              </lay-button-group>
              </div>
            </div>

            <div v-if="historyImages.length" class="site-page-card history-card">
              <div class="site-page-card-header">
                <i class="layui-icon layui-icon-time" />
                <h3>历史记录</h3>
              </div>
              <div class="site-page-card-body">
                <div class="history-list">
                  <div
                    v-for="(item, index) in historyImages.slice(0, 3)"
                    :key="index"
                    class="history-item"
                    @click="viewHistoryImage(item)"
                  >
                    <img :src="item.url" alt="历史图片" />
                    <span>{{ formatTime(item.time) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </lay-col>
        </lay-row>
      </lay-container>
  </SitePageLayout>
</template>
