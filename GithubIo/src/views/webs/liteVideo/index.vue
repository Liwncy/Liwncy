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
      <div class="video-app">
        <!-- 顶部信息栏 -->
        <header class="app-header">
          <div class="container">
            <div class="header-content">
              <div class="header-left">
                <h1 class="app-title">
                  <i class="layui-icon layui-icon-video"></i>
                  {{ currentMenu.title || '视频源' }}
                </h1>
                <p class="app-subtitle">{{ currentMenu.description || '视频描述' }}</p>
              </div>
              <div class="header-right">
                <div class="video-stats">
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

        <!-- 主内容区域 -->
        <main class="main-content">
          <div class="container">
            <!-- 播放器卡片 -->
            <div class="player-container">
              <div class="player-wrapper">
                <!-- 播放器头部 -->
                <div class="player-header">
                  <h2 class="player-title">
                    <span>{{ currentMenu.title || '选择视频源' }}</span>
                    <lay-badge v-if="currentMenu.id" type="success" class="source-badge">当前视频源</lay-badge>
                  </h2>
                </div>
                
                <!-- 播放器内容 -->
                <div class="player-content">
                  <lay-loading :type="3" :loading="loading" :full="true" :text="'视频加载中...'">
                    <div class="xg-player-container" ref="xgPlayerRef"></div>
                  </lay-loading>
                </div>
                
                <!-- 播放器底部控制 -->
                <div class="player-controls">
                  <lay-button 
                    type="primary" 
                    size="lg" 
                    @click="toGetMore" 
                    :disabled="!currentMenu.id"
                    class="refresh-button"
                    :loading="loading"
                  >
                    <i class="layui-icon layui-icon-refresh"></i>
                    换一个视频
                  </lay-button>
                  <div class="player-stats" v-if="currentMenu.id">
                    <span class="stat-item">
                      <i class="layui-icon layui-icon-play"></i>
                      {{ videoStats.playCount }}次播放
                    </span>
                    <span class="stat-item">
                      <i class="layui-icon layui-icon-picture"></i>
                      {{ videoStats.resolution }}
                    </span>
                    <span class="stat-item">
                      <i class="layui-icon layui-icon-time"></i>
                      {{ videoStats.duration }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 信息网格 -->
            <div class="info-grid">
              <!-- 视频源信息 -->
              <div class="info-card">
                <div class="card-header">
                  <i class="layui-icon layui-icon-info-circle"></i>
                  <h3>视频源信息</h3>
                </div>
                <div class="card-body">
                  <div class="info-item" v-if="currentMenu.title">
                    <span class="info-label">视频源：</span>
                    <span class="info-value">{{ currentMenu.title }}</span>
                  </div>
                  <div class="info-item" v-if="currentMenu.description">
                    <span class="info-label">描述：</span>
                    <span class="info-value">{{ currentMenu.description }}</span>
                  </div>
                  <div class="info-item" v-if="!currentMenu.id">
                    <span class="info-label">提示：</span>
                    <span class="info-value">请从左侧菜单选择一个视频源</span>
                  </div>
                </div>
              </div>

              <!-- 视频状态 -->
              <div class="info-card">
                <div class="card-header">
                  <i class="layui-icon layui-icon-play-circle"></i>
                  <h3>视频状态</h3>
                </div>
                <div class="card-body">
                  <div class="status-progress" v-if="currentMenu.id">
                    <div class="progress-label">视频加载进度</div>
                    <lay-progress :value="videoStats.loadProgress" :show-text="true" :height="8" theme="#52c41a"></lay-progress>
                  </div>
                  <div class="status-tips" v-else>
                    <i class="layui-icon layui-icon-tips"></i>
                    <span>选择视频源后将显示加载状态</span>
                  </div>
                </div>
              </div>

              <!-- 视频统计 -->
              <div class="info-card full-width">
                <div class="card-header">
                  <i class="layui-icon layui-icon-data-line"></i>
                  <h3>视频统计</h3>
                </div>
                <div class="card-body">
                  <div class="stats-grid">
                    <div class="stat-card">
                      <div class="stat-icon">
                        <i class="layui-icon layui-icon-play"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ videoStats.playCount }}</div>
                        <div class="stat-label">播放次数</div>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon">
                        <i class="layui-icon layui-icon-picture"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ videoStats.resolution }}</div>
                        <div class="stat-label">分辨率</div>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon">
                        <i class="layui-icon layui-icon-time"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-value">{{ videoStats.duration }}</div>
                        <div class="stat-label">视频时长</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 推荐视频源 -->
              <div v-if="recentSources.length > 0" class="info-card full-width">
                <div class="card-header">
                  <i class="layui-icon layui-icon-grid"></i>
                  <h3>猜你喜欢</h3>
                </div>
                <div class="card-body">
                  <div class="recommended-sources-grid">
                    <div 
                      v-for="(source, index) in recentSources" 
                      :key="source.id"
                      class="source-card"
                      :class="{ 'active': currentPath === source.id }"
                      @click="handleClick(source)"
                    >
                      <div class="source-icon">{{ getSourceIcon(index) }}</div>
                      <div class="source-info">
                        <div class="source-name">{{ source.title }}</div>
                        <div class="source-desc">{{ source.description || '无描述' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- 底部区域 -->
        <footer class="app-footer">
          <div class="container">
            <div class="footer-content">
              <div class="footer-left">
                <p>© {{ new Date().getFullYear() }} 视频播放器</p>
              </div>
              <div class="footer-right">
                <p class="footer-tip">提示：视频内容来源于所选视频源，仅供学习参考</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </lay-body>
  </lay-layout>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from "vue";
import XGPlayer from 'xgplayer';
import "xgplayer/dist/index.min.css";
import MenuSidebar from '@/components/MenuSidebar.vue';
import {getSideMenus} from "@/api/webs/liteVideo";
import {requestGetYujnApi} from "@/api/common/external/yujn";

const menus = ref([]);
const currentPath = ref("");
const currentMenu = ref({});
const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "240px" : "0px"));

// 播放器容器ref
const xgPlayerRef = ref(null);
// 播放器实例
let xgPlayer = null;
// 视频URL，设置默认值
const videoUrl = ref("http://s2.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4");

const loading = ref(false);

// 视频状态信息
const videoStats = ref({
  playCount: 0,
  resolution: '1080p',
  duration: '00:00',
  loadProgress: 0
});

// 同分类推荐的视频源（与当前视频源同一个父分类，最多6个）
const recentSources = computed(() => {
  const recommendedSources = [];
  const maxTotal = 6;
  
  // 如果当前没有选中视频源，返回空数组
  if (!currentMenu.value.id) {
    return [];
  }
  
  // 找到当前视频源所属的父分类
  let currentCategory = null;
  menus.value.forEach(menu => {
    if (menu.children && Array.isArray(menu.children)) {
      const found = menu.children.find(child => child.id === currentMenu.value.id);
      if (found) {
        currentCategory = menu;
        return false;
      }
    }
  });
  
  // 如果找到了父分类，推荐该分类下的其他视频源
  if (currentCategory && currentCategory.children) {
    // 过滤掉当前选中的视频源，然后随机打乱
    const otherSources = currentCategory.children
      .filter(child => child.id !== currentMenu.value.id)
      .sort(() => Math.random() - 0.5);
    
    // 取前maxTotal个
    recommendedSources.push(...otherSources.slice(0, maxTotal));
  }
  
  return recommendedSources;
});

/**
 * 获取视频源图标
 */
const getSourceIcon = (index) => {
  const icons = ['🎬', '📺', '🎥', '📹', '🎞️', '📼', '🎙️', '🎧'];
  return icons[index % icons.length];
};

/**
 * 菜单子项点击
 */
const handleClick = function (menu) {
  console.log("menu clicked:", menu);
  currentMenu.value = menu;
  currentPath.value = menu.id;
  getLiteVideo();
};

// 获取侧边栏
const initPage = async function () {
  try {
    const res = await getSideMenus();
    console.log("sidebar menus:", res);
    menus.value = res.data;
    
    // 默认选中第一个菜单
    if (menus.value.length > 0 && menus.value[0].children && menus.value[0].children.length > 0) {
      await handleClick(menus.value[0].children[0]);
    } else {
      // 如果没有菜单，初始化播放器
      initPlayer();
    }
  } catch (error) {
    console.error('获取侧边栏菜单失败:', error);
    // 即使获取菜单失败，也要初始化播放器
    initPlayer();
  }
};

// 初始化播放器函数
const initPlayer = () => {
  if (!xgPlayerRef.value) {
    console.error("未获取到播放器容器DOM");
    return;
  }
  
  // 销毁旧播放器实例
  if (xgPlayer) {
    xgPlayer.destroy();
    xgPlayer = null;
  }
  
  console.log("初始化播放器，视频URL:", videoUrl.value);
  
  try {
    // 初始化西瓜播放器
    xgPlayer = new XGPlayer({
      el: xgPlayerRef.value, // 挂载容器
      url: videoUrl.value, // 视频地址
      poster: '', // 封面图
      controls: true, // 显示控件
      autoplay: true, // 自动播放
      loop: false, // 不循环
      playbackRate: [0.5, 1, 1.5, 2], // 倍速选项
      volume: 0.7, // 默认音量
      lang: 'zh-cn', // 中文语言
      enableProgressDrag: true, // 允许拖动进度条
      enableVolumeDrag: true, // 允许拖动音量条
      fluid: true, // 流式布局
      height: 400 // 视频高度
    });

    // 监听播放事件
    xgPlayer.on('play', () => {
      console.log("视频开始播放");
      loading.value = false;
      // 增加播放次数
      videoStats.value.playCount++;
    });
    
    // 监听错误事件
    xgPlayer.on('error', (err) => {
      console.error('播放器错误:', err);
      loading.value = false;
    });
    
    // 监听加载进度事件
    xgPlayer.on('timeupdate', () => {
      if (xgPlayer.duration > 0) {
        // 更新视频时长
        const duration = Math.floor(xgPlayer.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        videoStats.value.duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新加载进度
        if (xgPlayer.buffered.length > 0) {
          const bufferedEnd = xgPlayer.buffered.end(xgPlayer.buffered.length - 1);
          const loadProgress = Math.floor((bufferedEnd / xgPlayer.duration) * 100);
          videoStats.value.loadProgress = loadProgress;
        }
      }
    });
    
    // 监听视频元数据加载完成事件
    xgPlayer.on('loadedmetadata', () => {
      if (xgPlayer.videoWidth && xgPlayer.videoHeight) {
        // 计算视频分辨率
        if (xgPlayer.videoWidth >= 1920) {
          videoStats.value.resolution = '1080p';
        } else if (xgPlayer.videoWidth >= 1280) {
          videoStats.value.resolution = '720p';
        } else {
          videoStats.value.resolution = '480p';
        }
      }
    });
  } catch (error) {
    console.error('播放器初始化失败:', error);
    loading.value = false;
  }
};

/**
 * 获取视频
 */
function getLiteVideo() {
  if (!currentMenu.value.data?.api) {
    console.error('API地址不存在');
    loading.value = false;
    return;
  }
  
  loading.value = true;
  console.log("获取视频，API:", currentMenu.value.data.api);
  
  requestGetYujnApi(currentMenu.value.data.api, {}).then(res => {
    loading.value = false;
    console.log("API响应:", res);
    if (res.data) {
      console.log("视频URL:", res.data);
      videoUrl.value = res.data;
      initPlayer();
    } else {
      console.error('API返回数据为空');
      loading.value = false;
    }
  }).catch(error => {
    console.error('获取视频失败:', error);
    loading.value = false;
  });
}

/**
 * 换一个视频
 */
const toGetMore = function () {
  getLiteVideo();
};

onMounted(() => {
  initPage();
});

// 组件卸载时销毁播放器
onUnmounted(() => {
  if (xgPlayer) {
    xgPlayer.destroy(); // 销毁西瓜播放器实例
    xgPlayer = null;
  }
});

</script>

<style scoped>
.layui-layout-website > .layui-layout > .layui-body {
  left: v-bind(menuVisible);
  width: calc(100% - v-bind(menuVisible));
  background: #ffffff;
  overflow-x: hidden;
}

/* 视频应用容器 */
.video-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

/* 顶部信息栏 */
.app-header {
  background: #ffffff;
  color: #333;
  padding: 24px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e8e8e8;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.header-left {
  flex: 1;
  min-width: 200px;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1890ff;
}

.app-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.header-right {
  flex-shrink: 0;
}

/* 视频统计信息 */
.video-stats {
  display: flex;
  gap: 24px;
  align-items: center;
  background: #f8f9fa;
  padding: 16px 24px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1890ff;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .video-stats {
    width: 100%;
    justify-content: space-around;
    padding: 12px 16px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 播放器容器 */
.player-container {
  margin-bottom: 24px;
}

.player-wrapper {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.player-wrapper:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.player-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.player-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333333;
}

.source-badge {
  margin-left: auto;
}

/* 播放器内容 */
.player-content {
  position: relative;
  min-height: 480px;
  background: #000;
}

.xg-player-container {
  width: 100%;
  height: 100%;
  min-height: 480px;
}

/* 播放器控制栏 */
.player-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.refresh-button {
  min-width: 180px;
  border-radius: 6px;
  font-size: 14px;
  padding: 10px 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.player-stats {
  display: flex;
  gap: 20px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666666;
  padding: 6px 12px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-card {
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.info-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.info-card.full-width {
  grid-column: 1 / -1;
}



/* 视频统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #52c41a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ffffff;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #666666;
}

/* 卡片头部 */
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.card-header i {
  color: #1890ff;
  font-size: 16px;
}

/* 卡片内容 */
.card-body {
  padding: 20px;
}

/* 信息项 */
.info-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
  gap: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 70px;
  flex-shrink: 0;
  font-size: 14px;
}

.info-value {
  color: #333;
  flex: 1;
  line-height: 1.5;
  font-size: 14px;
}

.api-url {
  font-size: 12px;
  color: #999;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  background: #f9f9f9;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

/* 状态进度 */
.status-progress {
  margin-bottom: 0;
}

.progress-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

.status-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 13px;
  padding: 20px 0;
  justify-content: center;
}

/* 使用说明网格 */
.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.usage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.usage-item:hover {
  background: #f0f9ff;
  border-color: #e6f7ff;
  transform: translateY(-2px);
}

.usage-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.usage-text {
  color: #333;
  font-size: 13px;
  line-height: 1.4;
}

/* 推荐视频源网格布局 */
.recommended-sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.source-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  background: #f8f9fa;
  min-height: 160px;
  justify-content: center;
}

.source-card:hover {
  background: #ffffff;
  border-color: #d9d9d9;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.source-card.active {
  background: #f6ffed;
  border-color: #b7eb8f;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
}

.source-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.source-info {
  width: 100%;
}

.source-name {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.source-desc {
  font-size: 12px;
  color: #666666;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
}

/* 空状态 */
.empty-sources {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999999;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #e0e0e0;
}

.empty-sources i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
  color: #52c41a;
}

.empty-sources span {
  font-size: 14px;
}

/* 底部区域 */
.app-footer {
  background: #ffffff;
  border-top: 1px solid #e8e8e8;
  padding: 20px 0;
  margin-top: auto;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.footer-left p {
  margin: 0;
  color: #8c8c8c;
  font-size: 13px;
}

.footer-right {
  flex-shrink: 0;
}

.footer-tip {
  font-size: 12px !important;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .player-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .refresh-button {
    width: 100%;
    justify-content: center;
  }
  
  .player-stats {
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media screen and (max-width: 768px) {
  .app-header {
    padding: 20px 0;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .main-content {
    padding: 20px 0;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .player-content {
    min-height: 320px;
  }
  
  .xg-player-container {
    min-height: 320px;
  }
  
  .player-header,
  .player-controls {
    padding: 16px;
  }
  
  .card-header {
    padding: 14px 16px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .usage-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
  }
}

@media screen and (max-width: 480px) {
  .player-content {
    min-height: 240px;
  }
  
  .xg-player-container {
    min-height: 240px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .info-label {
    min-width: auto;
    font-size: 13px;
  }
  
  .source-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .source-action {
    align-self: flex-end;
  }
}
</style>