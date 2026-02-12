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
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>{{ currentMenu.title || '今日热榜' }}</h1>
          <p class="subtitle" v-if="currentMenu.id">{{ getPlatformDesc(currentMenu.id) }}</p>
          <p class="subtitle" v-else>实时热点，一手掌握</p>
        </div>

        <!-- 热榜内容 -->
        <div class="hot-container">
          <!-- 热榜列表 -->
          <div class="hot-list" v-if="hotList.length > 0">
            <div
                v-for="item in hotList"
                :key="item.rank"
                class="hot-item"
                @click="openLink(item.link)"
            >
              <!-- 排名 -->
              <div class="rank" :class="getRankClass(item.rank)">
                {{ item.rank }}
              </div>

              <!-- 内容 -->
              <div class="content">
                <h3 class="title">{{ item.title }}</h3>
                <div class="meta">
                  <span class="hotness">{{ formatHotValue(item.hotValue) }} 热度</span>
                  <span class="time">{{ item.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-else-if="loading" class="loading">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty">
            <div class="empty-icon">📅</div>
            <h3>暂无数据</h3>
            <p>该平台暂无热点数据</p>
          </div>

          <!-- 加载更多 -->
          <div v-if="hotList.length > 0" class="load-more">
            <lay-button
                size="sm"
                type="default"
                @click="toGetMore"
                :loading="loadingMore"
            >
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </lay-button>
          </div>
        </div>
      </lay-container>
    </lay-body>
    <lay-backtop target="#content" :showHeight="100" :bottom="30" position="absolute"></lay-backtop>
  </lay-layout>
</template>

<script setup>
import {computed, nextTick, onMounted, ref} from "vue";
import {getSideMenus} from "@/api/webs/dailyhot";
import {PEARK_API, requestGetPearkApi} from "@/api/common/external/peark";
import {layer} from "@layui/layui-vue";

const menus = ref([]);
const currentPath = ref("哔哩哔哩");
const currentMenu = ref({});
const allHotData = ref([]); // 保存完整数据
const loading = ref(false);
const loadingMore = ref(false);
const currentPage = ref(1);
const pageSize = ref(10); // 每页显示10条

// 计算当前显示的热榜数据
const hotList = computed(() => {
  const endIndex = currentPage.value * pageSize.value;
  return allHotData.value.slice(0, endIndex);
});

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "240px" : "0px"));

/**
 * 菜单子项点击
 */
const handleClick = async function (menu) {
  currentMenu.value = menu;
  currentPath.value = menu.id;
  currentPage.value = 1;
  hotList.value = [];
  await getData();
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
async function getData() {
  if (loading.value) return;

  loading.value = true;

  try {
    const res = await requestGetPearkApi(PEARK_API.DAILY_HOT, {title: currentMenu.value.data.title});
    // 转换数据结构并保存完整数据
    allHotData.value = res.data.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      link: item.mobileUrl || item.url,
      hotValue: item.hot,
      time: new Date(item.timestamp).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  } catch (error) {
    console.error('获取热榜数据失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 加载更多
 */
const toGetMore = async function () {
  if (loadingMore.value) return;

  // 检查是否已经加载了所有数据
  if (hotList.value.length >= allHotData.value.length) {
    layer.msg('已经加载了全部数据');
    return;
  }

  loadingMore.value = true;
  currentPage.value++;

  try {
    // 不需要重新请求数据，计算属性会自动更新
    await nextTick();
  } finally {
    loadingMore.value = false;
  }
}

/**
 * 打开链接
 */
const openLink = function (link) {
  if (link && link !== '#') {
    window.open(link, '_blank');
  }
};

/**
 * 获取排名样式
 */
const getRankClass = function (rank) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return '';
};

/**
 * 格式化热度值
 */
const formatHotValue = function (value) {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万';
  }
  return value;
};

/**
 * 获取热度百分比
 */
const getHotPercentage = function (value) {
  // 假设最高热度为100000
  const maxHot = 100000;
  const percentage = (value / maxHot) * 100;
  return Math.min(percentage, 100);
};

/**
 * 获取平台描述
 */
const getPlatformDesc = function (platform) {
  // 从菜单数据中查找平台描述
  const findPlatformDesc = (menus) => {
    for (const menu of menus) {
      if (menu.children) {
        const found = menu.children.find(child => child.id === platform);
        if (found && found.data && found.data.description) {
          return found.data.description;
        }
      }
    }
    return null;
  };

  const desc = findPlatformDesc(menus.value);
  return desc || `${platform}是一个知名的在线平台，提供丰富的内容和服务。`;
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

/* 主容器 */
.main-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  margin-bottom: 30px;
  padding: 25px 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #16a085 0%, #2ecc71 100%);
}

.page-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.page-header .subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

/* 热榜容器 */
.hot-container {
  margin-bottom: 40px;
}

/* 热榜列表 */
.hot-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f0f2f5;
}

/* 热榜项 */
.hot-item {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.hot-item:hover {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  transform: translateX(4px);
}

.hot-item:last-child {
  border-bottom: none;
}

/* 排名 */
.rank {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #b8bcc8;
  margin-right: 20px;
  flex-shrink: 0;
  border-radius: 8px;
  background: #f5f7fa;
  transition: all 0.3s ease;
}

.rank.rank-1 {
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3);
}

.rank.rank-2 {
  color: #ffffff;
  background: linear-gradient(135deg, #ffa502 0%, #ff7f50 100%);
  box-shadow: 0 4px 12px rgba(255, 165, 2, 0.3);
}

.rank.rank-3 {
  color: #ffffff;
  background: linear-gradient(135deg, #3742fa 0%, #5352ed 100%);
  box-shadow: 0 4px 12px rgba(55, 66, 250, 0.3);
}

/* 内容 */
.content {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.hot-item:hover .title {
  color: #667eea;
}

.meta {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hotness {
  font-size: 13px;
  color: #ff7a45;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hotness::before {
  content: "🔥";
  font-size: 12px;
}

.time {
  font-size: 13px;
  color: #95a5a6;
  display: flex;
  align-items: center;
  gap: 4px;
}

.time::before {
  content: "🕐";
  font-size: 12px;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading p {
  margin: 20px 0 0 0;
  font-size: 15px;
  color: #606266;
  font-weight: 500;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.empty-icon {
  font-size: 72px;
  opacity: 0.4;
  margin-bottom: 20px;
}

.empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.empty p {
  font-size: 14px;
  color: #95a5a6;
  margin: 0;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .main-container {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .hot-item {
    padding: 12px 16px;
  }

  .title {
    font-size: 14px;
  }

  .meta {
    gap: 12px;
  }
}

/* 确保悬浮按钮在小窗口时可见 */
@media screen and (max-width: 768px) {
  :deep(.floating-toggle-btn) {
    display: flex !important;
  }
}
</style>