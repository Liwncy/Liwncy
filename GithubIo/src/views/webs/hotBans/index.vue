<template>
  <lay-layout>
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleMenuChildClick"
        v-model:visible="isMenuVisible"
    />
    <lay-body id="content">
      <lay-container :fluid="true" class="main-container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>{{ currentMenu.title || '热榜' }}</h1>
          <p class="subtitle" v-if="currentMenu.id">{{ getPlatformDesc(currentMenu.id) }}</p>
          <p class="subtitle" v-else>实时热点，一手掌握</p>
        </div>

        <!-- 标签页 -->
        <lay-tab type="brief" v-model="currentTab" @change="handleTabChange" tabPosition="top"
                 class="hot-tab-article">
          <lay-tab-item
              v-for="(item, index) in tabTitleList"
              :key="index"
              :id="item.id"
              :title="item.title"
              :sourceId="item.id"
          >
            <div class="hot-container">
              <!-- 热榜列表 -->
              <div class="hot-list" v-if="articleList.length > 0 && !loading">
                <div
                    v-for="(item, index) in articleList"
                    :key="index"
                    class="hot-item"
                    @click="openLink(item.title_url)"
                >
                  <!-- 排名 -->
                  <div class="rank" :class="getRankClass(index+1)">
                    {{ index+1 }}
                  </div>

                  <!-- 内容 -->
                  <div class="content">
                    <h3 class="title">{{ item.title }}</h3>
                    <p class="description" v-if="item.description">{{ item.description }}</p>
                    <div class="meta">
                      <span class="time" v-if="item.article_time">{{ item.article_time }}</span>
                      <span class="author" v-if="item.author_info">{{ item.author_info }}</span>
                      <span class="hotness" v-if="item.hot_value">{{ item.hot_value }} 热度</span>
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
              <div v-if="articleList.length > 0" class="load-more">
                <lay-button
                    size="sm"
                    type="default"
                    @click="toGetMore"
                    :loading="loading"
                  >
                  {{ loading ? '加载中...' : '加载更多' }}
                </lay-button>
              </div>
            </div>
          </lay-tab-item>
        </lay-tab>
      </lay-container>
    </lay-body>
    <lay-backtop target="#content" :showHeight="100" :bottom="30" position="absolute"></lay-backtop>
  </lay-layout>
</template>
<script setup>
import {ref, watch, computed, onMounted, nextTick} from "vue";
import {layer} from "@layui/layui-vue";
import MenuSidebar from '@/components/MenuSidebar.vue';
import {getSideMenus} from "@/api/webs/hotBans";
import {requestGet60sApi} from "@/api/common/external/60sApi";
import {getPaginationData} from "@/utils/paginationUtil";


const menus = ref([]);
const currentPath = ref("zhihu");
const tabTitleList = ref([]);
const currentTab = ref(1);

const loading = ref(false);

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "240px" : "0px"));


/**
 * 菜单子项点击
 * @param menu
 */
const handleMenuChildClick = function (menu) {
  console.log("menu0", menu);
  currentMenu.value = menu;
  selected.value = menu.id;
  currentPath.value = menu.id;
  currentTab.value = menu.data[0].id;
  tabTitleList.value = menu.data.map((item, index) => {
    return {
      id: item.id,
      title: item.name
    };
  });
  page.value = {total: 100, limit: 10, current: 1};
  // 清空现有数据，显示加载动画
  articleList.value = [];
  getArticleList();
  handleMenuOpen(false);
};

const currentMenu = ref({});
// 获取侧边栏
const initPage = async function () {
  const res = await getSideMenus();
  console.log(res);
  menus.value = res.data;
  handleMenuChildClick(menus.value[0].children[0]);
};

const selected = ref(1);

const handleMenuOpen = function (val) {
  menuVisible.value = val;
};

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



function handleTabChange() {
  page.value = {total: 100, limit: 10, current: 1};
  // 清空现有数据，显示加载动画
  articleList.value = [];
  getArticleList();
}

const page = ref({total: 100, limit: 10, current: 1})

const articleList = ref([]);
const allArticleList = ref([]);

function getArticleList(t) {
  loading.value = true;
  // console.log("menu", currentMenu.value);
  const api = currentMenu.value.data.find(cm => cm.id === currentTab.value).api
  // console.log("api", api)
  requestGet60sApi(api, {}).then(res => {
    loading.value = false;
    console.log(res.data);
    // 清洗数据
    allArticleList.value = cleaningArticleListData(res.data)
    // allArticleList.value = listData
    let pageData = getPaginationData(allArticleList.value, page.value.current, page.value.limit)
    articleList.value = pageData.currentPageList
    page.value.total = pageData.total;
  }).catch(() => {
    loading.value = false;
  })
}

/**
 * 清理数据
 * @param data
 */
function cleaningArticleListData(data) {
  let listData = [];

  // 判断data是否为对象且包含list属性
  if (data && typeof data === 'object' && data.list !== undefined) {
    // 如果data是对象且包含list，取list的数据
    listData = data.list;
  } else if (Array.isArray(data)) {
    // 如果data直接是数组，直接取data的数据
    listData = data;
  } else {
    // 其他情况返回空数组
    console.warn('数据格式不符合预期:', data);
    return [];
  }

  // 遍历数组，统一修改字段
  return listData.map(item => {
    return {
      // 将返回数据中的字段映射到页面字段
      title_url: item.url || item.title_url || item.link,  // 如果原数据有url则使用url，否则使用title_url
      title: item.title || item.name || item.movie_name || item.programme_name || item.series_name,        // 标题字段
      description: item.description || item.desc || item.summary || item.detail || item.channel_name, // 描述字段
      author_info: item.author || item.author_info, // 作者信息
      article_time: item.time || item.article_time || item.active_time || item.published || item.created || item.release_year || item.release_info, // 发布时间
      hot_value: item.hot_value || item.hot_value_desc || item.score || item.hot || item.box_office_desc, // 热度值
      ...item // 保留其他原始字段
    };
  });
}

async function toGetMore() {
  // const page = ref({total: 100, limit: 10, current: 1})
  if (page.value.total <= page.value.current * page.value.limit) {
    layer.msg("没有更多了", {time: 1000})
    return;
  }
  loading.value = true;
  page.value.current++;
  // 太快了，加点延时
  await new Promise(resolve => setTimeout(resolve, 250));
  let pageData = getPaginationData(allArticleList.value, page.value.current, page.value.limit)
  articleList.value = articleList.value.concat(pageData.currentPageList);
  page.value.total = pageData.total;
  loading.value = false;
}

const searchTitle = ref('')

function toSearch() {
  layer.load(2, {time: 3000})
}

function toReset() {
  searchTitle.value = ''
}

onMounted(() => {
  initPage()
})

</script>

<style scoped>
.layui-layout-website > .layui-layout > .layui-body {
  left: v-bind(menuVisible);
  width: calc(100% - v-bind(menuVisible));
  background: #f8f9fa;
  overflow-y: auto;
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

/* 标签页 */
.hot-tab-article {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f0f2f5;
  margin-bottom: 30px;
}

/* 热榜容器 */
.hot-container {
  padding: 20px;
}

/* 热榜列表 */
.hot-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f0f2f5;
}

/* 热榜项 */
.hot-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
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
  transition: color 0.3s ease;
}

.hot-item:hover .title {
  color: #667eea;
}

.description {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
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

.author {
  font-size: 13px;
  color: #95a5a6;
  display: flex;
  align-items: center;
  gap: 4px;
}

.author::before {
  content: "👤";
  font-size: 12px;
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
    padding: 16px;
  }

  .title {
    font-size: 14px;
  }

  .description {
    font-size: 13px;
  }

  .meta {
    gap: 12px;
  }

  .hot-container {
    padding: 16px;
  }
}

/* 确保悬浮按钮在小窗口时可见 */
@media screen and (max-width: 768px) {
  :deep(.floating-toggle-btn) {
    display: flex !important;
  }
}
</style>
