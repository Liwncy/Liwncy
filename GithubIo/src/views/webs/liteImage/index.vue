<template>
  <lay-layout class="example">
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleClick"
        v-model:visible="isMenuVisible"
    />

    <lay-body id="content">
      <lay-container :fluid="true" class="main-container">
        <!-- 内容区域 -->
        <lay-row :space="10" class="content-row">
          <!-- 图片展示区域 (左侧) -->
          <lay-col :md="16" :xs="24">
            <div class="img-section">
              <lay-loading :type="0" :loading="loadingA">
                <!-- 单张图片展示 -->
                <div v-if="imgUrl && !Array.isArray(imgUrl)" class="single-img-container">
                  <div class="img-display-area">
                    <div class="img-wrapper" ref="imgWrapperRef">
                      <img
                          :src="imgUrl"
                          alt="图片"
                          class="show-img"
                          ref="imgRef"
                          decoding="async"
                          @error="handleImgError"
                          @load="handleImgLoad"
                          :style="imgStyle"
                      />
                      <!-- 图片操作工具栏 -->
                      <div class="img-toolbar" v-if="imgUrl">
                        <lay-button size="xs" @click="zoomIn">
                          <lay-icon type="layui-icon-addition"/>
                        </lay-button>
                        <lay-button size="xs" @click="zoomOut">
                          <lay-icon type="layui-icon-subtraction"/>
                        </lay-button>
                        <lay-button size="xs" @click="resetZoom">
                          <lay-icon type="layui-icon-screen-full"/>
                        </lay-button>
                        <lay-button size="xs" @click="rotateImg">
                          <lay-icon type="layui-icon-refresh"/>
                        </lay-button>
                        <span class="zoom-info">{{ Math.round(zoomLevel * 100) }}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 多张图片展示 -->
                <div v-else-if="imgUrl && Array.isArray(imgUrl) && imgUrl.length > 0" class="multi-img-container">
                  <div class="carousel-container">
                    <div class="img-display-area">
                      <div class="img-wrapper" ref="imgWrapperRef">
                        <img
                            :src="currentImageUrl"
                            :alt="`图片 ${currentImageIndex + 1}`"
                            class="show-img"
                            ref="imgRef"
                            @error="handleImgError"
                            @load="handleImgLoad"
                            :style="imgStyle"
                        />
                        <!-- 多张图片时的操作工具栏 -->
                        <div class="img-toolbar" v-if="imgUrl.length > 0">
                          <lay-button size="xs" @click="zoomIn">
                            <lay-icon type="layui-icon-addition"/>
                          </lay-button>
                          <lay-button size="xs" @click="zoomOut">
                            <lay-icon type="layui-icon-subtraction"/>
                          </lay-button>
                          <lay-button size="xs" @click="resetZoom">
                            <lay-icon type="layui-icon-screen-full"/>
                          </lay-button>
                          <lay-button size="xs" @click="rotateImg">
                            <lay-icon type="layui-icon-refresh"/>
                          </lay-button>
                          <span class="zoom-info">{{ Math.round(zoomLevel * 100) }}%</span>
                          <span class="image-counter">
                            {{ currentImageIndex + 1 }} / {{ imgUrl.length }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- 导航按钮 -->
                    <div class="carousel-nav" v-if="imgUrl.length > 1">
                      <lay-button
                          size="sm"
                          @click="prevImage"
                          :disabled="currentImageIndex === 0"
                      >
                        <lay-icon type="layui-icon-left"/>
                        上一张
                      </lay-button>
                      <lay-button
                          size="sm"
                          @click="nextImage"
                          :disabled="currentImageIndex === imgUrl.length - 1"
                      >
                        下一张
                        <lay-icon type="layui-icon-right"/>
                      </lay-button>
                    </div>
                  </div>

                  <!-- 图片缩略图导航 -->
                  <div v-if="imgUrl.length > 1" class="img-thumbnails">
                    <div
                        v-for="(url, index) in imgUrl"
                        :key="index"
                        :class="['thumbnail', { 'active': currentImageIndex === index }]"
                        @click="switchImage(index)"
                    >
                      <img :src="url" :alt="`缩略图 ${index + 1}`"/>
                    </div>
                  </div>
                </div>

                <lay-empty v-else description="暂无图片，请点击切换加载"></lay-empty>
              </lay-loading>
            </div>
          </lay-col>

          <!-- 图片描述区域 (右侧) -->
          <lay-col :md="8" :xs="24">
            <div class="description-section">
              <lay-card class="description-card">
                <template #title>
                  <div class="description-header">
                    <lay-icon type="layui-icon-picture"/>
                    <span>图片详情</span>
                  </div>
                </template>

                <!-- 图片信息 -->
                <div class="image-info">
                  <div class="info-item">
                    <span class="label">图片数量：</span>
                    <span class="value">
                      {{ Array.isArray(imgUrl) ? imgUrl.length : (imgUrl ? 1 : 0) }} 张
                    </span>
                  </div>

                  <div class="info-item">
                    <span class="label">当前图片：</span>
                    <span class="value">{{ currentImageIndex + 1 }} / {{
                        Array.isArray(imgUrl) ? imgUrl.length : 1
                      }}</span>
                  </div>

                  <div class="info-item">
                    <span class="label">显示比例：</span>
                    <span class="value">{{ Math.round(zoomLevel * 100) }}%</span>
                  </div>

                  <div class="info-item">
                    <span class="label">旋转角度：</span>
                    <span class="value">{{ rotation }}°</span>
                  </div>

                  <div class="info-item">
                    <span class="label">图片方向：</span>
                    <span class="value">{{ imageOrientation }}</span>
                  </div>

                  <div v-if="currentImageData.title" class="info-item">
                    <span class="label">标题：</span>
                    <span class="value">{{ currentImageData.title }}</span>
                  </div>

                  <div v-if="currentImageData.description" class="info-item">
                    <span class="label">描述：</span>
                    <span class="value">{{ currentImageData.description }}</span>
                  </div>

                  <div v-if="currentImageData.tags && currentImageData.tags.length" class="info-item">
                    <span class="label">标签：</span>
                    <div class="tags-container">
                      <lay-tag
                          v-for="tag in currentImageData.tags"
                          :key="tag"
                          type="normal"
                          size="sm"
                      >
                        {{ tag }}
                      </lay-tag>
                    </div>
                  </div>

                  <div v-if="currentImageData.source" class="info-item">
                    <span class="label">来源：</span>
                    <span class="value">{{ currentImageData.source }}</span>
                  </div>

                  <div class="info-item">
                    <span class="label">更新时间：</span>
                    <span class="value">{{ currentTime }}</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <lay-button type="primary" @click="toGetMore">
                    <lay-icon type="layui-icon-refresh"/>
                    换一张
                  </lay-button>
                  <lay-button v-if="imgUrl" @click="downloadImage" style="margin-left: 0px">
                    <lay-icon type="layui-icon-download-circle"/>
                    下载当前图片
                  </lay-button>
                  <lay-button-group class="fit-buttons">
                    <lay-button size="sm" @click="fitAuto" :type="fitMode === 'auto' ? 'primary' : 'normal'">智能适应
                    </lay-button>
                    <lay-button size="sm" @click="fitContain" :type="fitMode === 'contain' ? 'primary' : 'normal'">
                      适应容器
                    </lay-button>
                    <lay-button size="sm" @click="fitOriginal" :type="fitMode === 'fill' ? 'primary' : 'normal'">
                      原始尺寸
                    </lay-button>
                  </lay-button-group>
                </div>
              </lay-card>

              <!-- 历史记录 -->
              <lay-card v-if="historyImages.length" class="history-card">
                <template #title>
                  <div class="description-header">
                    <lay-icon type="layui-icon-time"/>
                    <span>历史记录</span>
                  </div>
                </template>

                <div class="history-list">
                  <div
                      v-for="(item, index) in historyImages.slice(0, 3)"
                      :key="index"
                      class="history-item"
                      @click="viewHistoryImage(item)"
                  >
                    <img :src="item.url" alt="历史图片"/>
                    <span class="history-time">{{ formatTime(item.time) }}</span>
                  </div>
                </div>
              </lay-card>
            </div>
          </lay-col>
        </lay-row>
      </lay-container>
    </lay-body>
  </lay-layout>
</template>

<script setup>
import {computed, onMounted, ref, nextTick} from "vue";
import {getSideMenus} from "@/api/webs/liteImage";
import {requestGetYujnApi} from "@/api/common/external/yujn";
import axios from "axios";

const menus = ref([]);
const currentPath = ref("zhihu");
const currentMenu = ref({});

// 图片数据
const imgUrl = ref('');
const currentImageIndex = ref(0);
const loadingA = ref(false);

// DOM 引用
const imgRef = ref(null);
const imgWrapperRef = ref(null);

// 图片控制状态
const zoomLevel = ref(1);
const rotation = ref(0);
const fitMode = ref('auto'); // 'auto' | 'contain' | 'fill'
const imageNaturalSize = ref({width: 0, height: 0});

// 历史记录
const historyImages = ref([]);

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "200px" : "0px"));

const currentTime = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// 当前显示的图片URL
const currentImageUrl = computed(() => {
  if (Array.isArray(imgUrl.value)) {
    return imgUrl.value[currentImageIndex.value] || '';
  }
  return imgUrl.value;
});

// 图片方向判断
const imageOrientation = computed(() => {
  const {width, height} = imageNaturalSize.value;
  if (width === 0 || height === 0) return '未知';
  return width > height ? '横屏' : width < height ? '竖屏' : '正方形';
});

// 智能适应计算
const autoFitStyle = computed(() => {
  const {width: naturalWidth, height: naturalHeight} = imageNaturalSize.value;
  const containerWidth = imgWrapperRef.value?.clientWidth || 800;
  const containerHeight = imgWrapperRef.value?.clientHeight || 600;

  if (naturalWidth === 0 || naturalHeight === 0) {
    return {width: 'auto', height: '75vh'};
  }

  const containerRatio = containerWidth / containerHeight;
  const imageRatio = naturalWidth / naturalHeight;

  // 智能适应逻辑
  if (imageRatio > containerRatio) {
    // 横屏图片：宽度适应容器，高度按比例缩放
    return {width: '100%', height: 'auto'};
  } else {
    // 竖屏图片：高度适应容器，宽度按比例缩放
    return {width: 'auto', height: '75vh'};
  }
});

const imgStyle = computed(() => {
  const baseStyle = {
    transform: `scale(${zoomLevel.value}) rotate(${rotation.value}deg)`,
    cursor: zoomLevel.value > 1 ? 'grab' : 'default',
    transition: 'transform 0.3s ease'
  };

  // 根据适应模式应用不同的样式
  switch (fitMode.value) {
    case 'auto':
      return {...baseStyle, ...autoFitStyle.value};
    case 'contain':
      return {...baseStyle, width: '100%', height: '100%', objectFit: 'contain'};
    case 'fill':
      return {...baseStyle, width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%'};
    default:
      return {...baseStyle, ...autoFitStyle.value};
  }
});

const currentImageData = computed(() => {
  const imageCount = Array.isArray(imgUrl.value) ? imgUrl.value.length : (imgUrl.value ? 1 : 0);

  if (Array.isArray(imgUrl.value)) {
    return {
      title: `图片 ${currentImageIndex.value + 1}`,
      description: `这是第 ${currentImageIndex.value + 1} 张图片的描述信息，总共有 ${imageCount} 张图片`,
      tags: ['多张', '图片', '展示'],
      source: currentMenu.value?.title || '未知来源'
    };
  } else {
    return {
      title: currentMenu.value?.title || '图片详情',
      description: '这是一张精美的图片，点击"换一张"按钮可以查看更多精彩内容',
      tags: ['单张', '精选', '推荐'],
      source: currentMenu.value?.title || '未知来源'
    };
  }
});

/**
 * 菜单子项点击
 */
const handleClick = async function (menu) {
  currentMenu.value = menu;
  currentPath.value = menu.id;
  getLiteImage();
};

// 获取侧边栏
const initPage = async function () {
  const res = await getSideMenus();
  menus.value = res.data;
  await handleClick(menus.value[0].children[0]);
};

/**
 * 获取数据
 */
async function getLiteImage() {

  loadingA.value = true;
  const api = currentMenu.value.data.api;

  requestGetYujnApi(api, {}).then(res => {
    // 处理返回数据
    console.log('返回数据:', res);
    let imgData = res.data || res.image_url || res.img || res.url || res;
    if (Array.isArray(imgData)) {
      imgUrl.value = imgData.filter(url => url && typeof url === 'string');
    } else if (typeof imgData === 'string') {
      imgUrl.value = imgData;
    } else {
      imgUrl.value = imgData;
    }

    // 保存到历史记录
    if (imgUrl.value && !Array.isArray(imgUrl.value)) {
      historyImages.value.unshift({
        url: imgUrl.value,
        time: new Date().toISOString()
      });
    }

    currentImageIndex.value = 0;
    resetImageControls();
    loadingA.value = false;
  }).catch((e) => {
    console.log('图片加载失败:', e);
    loadingA.value = false;
  });
}

/**
 * 图片加载完成
 */
function handleImgLoad(event) {
  const img = event.target;
  imageNaturalSize.value = {
    width: img.naturalWidth,
    height: img.naturalHeight
  };

  console.log('图片加载完成', `尺寸: ${img.naturalWidth} x ${img.naturalHeight}`, `方向: ${imageOrientation.value}`);

  // 加载完成后重新计算适应模式
  nextTick(() => {
    if (fitMode.value === 'auto') {
      // 智能适应模式下，自动计算最佳显示方式
      resetZoom();
    }
  });
}

/**
 * 重置图片控制参数
 */
function resetImageControls() {
  zoomLevel.value = 1;
  rotation.value = 0;
  fitMode.value = 'auto';
  imageNaturalSize.value = {width: 0, height: 0};
}

/**
 * 换一个
 */
const toGetMore = function () {
  getLiteImage();
}

/**
 * 图片加载错误处理
 */
const handleImgError = function (event) {
  event.target.src = 'https://www.layui-vue.com/assets/404-CWJ6jsKv.svg';
}

/**
 * 下载图片
 */
const downloadImage = function () {
  if (!currentImageUrl.value) return;
  // 在新标签页打开图片
  const newWindow = window.open(currentImageUrl.value, '_blank');
  // const link = document.createElement('a');
  // link.href = currentImageUrl.value;
  // link.download = `image_${Date.now()}.jpg`;
  // link.click();
}

/**
 * 查看历史图片
 */
const viewHistoryImage = function (item) {
  imgUrl.value = item.url;
  resetImageControls();
}

/**
 * 格式化时间显示
 */
const formatTime = function (timeString) {
  return new Date(timeString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 多张图片导航方法
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
    resetImageControls();
  }
};

const nextImage = () => {
  if (currentImageIndex.value < imgUrl.value.length - 1) {
    currentImageIndex.value++;
    resetImageControls();
  }
};

const switchImage = (index) => {
  currentImageIndex.value = index;
  resetImageControls();
};

// 图片控制方法
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.1;
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.3) {
    zoomLevel.value -= 0.1;
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
};

const rotateImg = () => {
  rotation.value += 90;
  if (rotation.value >= 360) {
    rotation.value = 0;
  }
};

// 适应模式方法
const fitAuto = () => {
  fitMode.value = 'auto';
  resetZoom();
};

const fitContain = () => {
  fitMode.value = 'contain';
  resetZoom();
};

const fitOriginal = () => {
  fitMode.value = 'fill';
  resetZoom();
};

onMounted(() => {
  initPage();
});
</script>

<style scoped>
.layui-layout-website > .layui-layout > .layui-body {
  left: v-bind(menuVisible);
  width: calc(100% - v-bind(menuVisible));
}

/* 主容器固定高度 */
.main-container {
  height: calc(100vh - 60px);
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}

.content-row {
  height: 100%;
  margin: 0 !important;
}

/* 图片区域固定高度 */
.img-section {
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 16px;
  box-sizing: border-box;
}

.single-img-container,
.multi-img-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* 重要：允许flex子项收缩 */
}

/* 图片显示区域 - 固定高度，不随图片变化 */
.img-display-area {
  flex: 1;
  min-height: 70vh; /* 最小高度 */
  max-height: 80vh; /* 最大高度为视口的60% */
  height: 75vh; /* 默认高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  overflow: hidden;
  position: relative;
  border: 2px dashed #e0e0e0;
}

/* 图片包装器 - 固定大小，居中显示 */
.img-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  position: relative;
  background: #fff;
}

/* 图片样式 - 智能适应 */
.show-img {
  transition: all 0.3s ease;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

/* 图片操作工具栏 */
.img-toolbar {
  position: absolute;
  top: 25px;
  right: 10px;
  display: flex;
  gap: 5px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  border-radius: 6px;
  backdrop-filter: blur(5px);
  align-items: center;
  flex-wrap: wrap;
  max-width: 250px;
  z-index: 10;
}

.img-toolbar .layui-btn {
  background: transparent;
  border: none;
  color: white;
  padding: 4px 6px;
  min-width: auto;
}

.img-toolbar .layui-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.zoom-info {
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin: 0 5px;
}

.image-counter {
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin-left: 5px;
}

/* 轮播导航按钮 */
.carousel-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 10px;
  flex-shrink: 0;
}

.carousel-nav .layui-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 图片缩略图导航 */
.img-thumbnails {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  padding: 12px;
  flex-shrink: 0;
  background: #fafafa;
  border-radius: 4px;
  min-height: 84px; /* 缩略图区域最小高度 */
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: #009688;
  transform: scale(1.05);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 描述区域样式 */
.description-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 16px;
}

.description-card,
.history-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0; /* 重要：允许flex子项收缩 */
}

.description-card :deep(.layui-card-body),
.history-card :deep(.layui-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.description-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 16px;
}

.image-info {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
}

.info-item .label {
  font-weight: 600;
  min-width: 70px;
  color: #666;
  flex-shrink: 0;
}

.info-item .value {
  flex: 1;
  color: #333;
  word-break: break-word;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.fit-buttons {
  display: flex;
  gap: 2px;
}

.fit-buttons .layui-btn {
  flex: 1;
  font-size: 12px;
  padding: 4px 8px;
}

/* 历史记录样式 */
.history-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.history-item:hover {
  background-color: #f5f5f5;
}

.history-item img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.history-time {
  font-size: 12px;
  color: #999;
}

/* 空状态样式 */
:deep(.layui-empty) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 滚动条样式 */
.image-info::-webkit-scrollbar,
.history-list::-webkit-scrollbar,
.img-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.image-info::-webkit-scrollbar-track,
.history-list::-webkit-scrollbar-track,
.img-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.image-info::-webkit-scrollbar-thumb,
.history-list::-webkit-scrollbar-thumb,
.img-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.image-info::-webkit-scrollbar-thumb:hover,
.history-list::-webkit-scrollbar-thumb:hover,
.img-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    height: auto;
    min-height: calc(100vh - 60px);
    padding: 8px;
  }

  .content-row {
    height: auto;
  }

  .img-section {
    height: auto;
    min-height: 400px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .single-img-container,
  .multi-img-container {
    height: auto;
  }

  .img-display-area {
    height: 300px;
    min-height: 250px;
    max-height: 40vh;
    margin-bottom: 12px;
  }

  .img-toolbar {
    top: 5px;
    right: 5px;
    max-width: 150px;
    padding: 6px;
  }

  .carousel-nav {
    flex-direction: column;
    gap: 10px;
  }

  .description-section {
    padding-left: 0;
    gap: 12px;
  }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .img-display-area {
    height: 600px;
    max-height: 65vh;
  }
}
</style>