<template>
  <lay-layout>
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleMenuChildClick"
    />
    <lay-body id="content">
      <div class="layui-menu-toggle" style="width: auto !important;height: auto !important;padding: 0 !important;"
           @click="handleMenuOpen(true)">
        <lay-icon type="layui-icon-menu-fill" style="font-size: 32px"></lay-icon>
      </div>
      <div style="padding: 20px" @click="handleMenuOpen(false)">
        <lay-tab type="brief" v-model="currentTab" @change="handleTabChange" tabPosition="top"
                 class="lay-tab-article">
          <lay-tab-item
              v-for="(item, index) in tabTitleList"
              :key="index"
              :id="item.id"
              :title="item.title"
              :sourceId="item.id"
          >
            <lay-container :fluid="true" style="padding: 10px;/*height: 100%*/">
              <lay-loading :type="0" :loading="loadingA">
                <lay-card style="margin-top: 10px; border-radius: 5px">
                  <div v-for="(item, index) in articleList" :key="index">
                    <div class="article-item">
                      <a :href="item.title_url" target="_blank" rel="noopener noreferrer" class="block">
                        <div class="article-item-content">
                          <div style="margin: 15px 0 15px">
                            <lay-space :size="40">
                              <lay-badge position="top-left" :value="index+1" :badgeStyle="{top:'7px'}"></lay-badge>
                            </lay-space>
                            {{ item.title }}
                          </div>
                          <!--                          <div-->
                          <!--                              class="content-tags"-->
                          <!--                              v-for="(tagName, index) in item.tags"-->
                          <!--                              :key="index"-->
                          <!--                          >-->
                          <!--                            <lay-tag variant="light">{{ tagName }}</lay-tag>-->
                          <!--                          </div>-->
                          <div style="font-size: 14px; margin: 15px 30px" class="content-description">
                            {{ item.description }}
                          </div>
                          <!--                          <div class="content-userInfo">-->
                          <!--                            <lay-avatar-->
                          <!--                                src="https://foruda.gitee.com/avatar/1677022544584087390/4835367_jmysy_1578975358.png"-->
                          <!--                                radius-->
                          <!--                            ></lay-avatar>-->
                          <!--                            &nbsp;&nbsp;作者: {{ item.author_info }}-->
                          <!--                          </div>-->
                          <div class="content-start">
                            <div class="content-start-item borderR" v-if="item.article_time">
                              <lay-icon type="layui-icon-date"></lay-icon>
                              {{ item.article_time }}
                            </div>
                            <div class="content-start-item borderR" v-if="item.author_info">
                              <lay-icon type="layui-icon-user"></lay-icon>
                              {{ item.author_info }}
                            </div>
                            <div class="content-start-item" v-if="item.hot_value">
                              <lay-icon type="layui-icon-fire"></lay-icon>
                              {{ item.hot_value }}
                            </div>
                          </div>
                        </div>
                        <!--                      <div class="article-item-img">-->
                        <!--                        <img-->
                        <!--                            :src="imgUrlPrefix+item.image_url"-->
                        <!--                        />-->
                        <!--                      </div>-->
                      </a>
                    </div>
                  </div>
                  <!--                  <div class="getmore">-->
                  <!--                    <lay-button @click="toGetMore">加载更多</lay-button>-->
                  <!--                  </div>-->
                </lay-card>
              </lay-loading>
            </lay-container>

          </lay-tab-item>
        </lay-tab>

      </div>
      <lay-footer style="position: fixed; /* 固定位置 */
        bottom: 0; /* 固定在底部 */
        width: 100%; /* 宽度占满整个页面 */
        z-index: 1000; /* 确保页脚在其他内容之上 */
        height: 60px; /* 固定高度 */
        display: flex; /* 使用Flexbox布局 */
        justify-content: center; /* 水平居中 */
        align-items: center; /* 垂直居中 */">
        <div class="getmore">
          <lay-button @click="toGetMore">加载更多</lay-button>
        </div>
      </lay-footer>
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

const loadingA = ref(false);

const isMenuDisplay = ref(false);
const menuDisplay = computed(() => (isMenuDisplay.value ? "240px" : "0px"));

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
  isMenuDisplay.value = val;
};



function handleTabChange() {
  page.value = {total: 100, limit: 10, current: 1};
  getArticleList();
}

const page = ref({total: 100, limit: 10, current: 1})

const articleList = ref([]);
const allArticleList = ref([]);

function getArticleList(t) {
  loadingA.value = true;
  // console.log("menu", currentMenu.value);
  const api = currentMenu.value.data.find(cm => cm.id === currentTab.value).api
  // console.log("api", api)
  requestGet60sApi(api, {}).then(res => {
    loadingA.value = false;
    console.log(res.data);
    // 清洗数据
    allArticleList.value = cleaningArticleListData(res.data)
    // allArticleList.value = listData
    let pageData = getPaginationData(allArticleList.value, page.value.current, page.value.limit)
    articleList.value = pageData.currentPageList
    page.value.total = pageData.total;
  }).catch(() => {
    loadingA.value = false;
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
  loadingA.value = true;
  page.value.current++;
  // 太快了，加点延时
  await new Promise(resolve => setTimeout(resolve, 250));
  let pageData = getPaginationData(allArticleList.value, page.value.current, page.value.limit)
  articleList.value = articleList.value.concat(pageData.currentPageList);
  page.value.total = pageData.total;
  loadingA.value = false;
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

<style>
@media screen and (max-width: 768px) {
  .layui-menu-toggle {
    display: block !important;
  }

  .layui-menu-ref-2 {
    width: v-bind(menuDisplay) !important;
  }
}

.layui-menu-toggle {
  display: none;
}
</style>

<style scoped>
:deep(.card-list-item .layui-card-body img) {
  width: 100%;
}

:deep(.card-list-item .layui-card-body) {
  padding: 0px !important;
}

/*:deep(.lay-tab-article) {*/
/*  !*margin-top: 60px; !* 确保内容不被固定标签栏遮挡 *!*!*/
/*  !*padding: 20px;*!*/
/*  height: calc(100vh - 120px); !* 固定高度，减去标签栏的高度 *!*/
/*  overflow-y: auto; !* 显示垂直滚动条 *!*/
/*  box-sizing: border-box; !* 确保内边距和边框包含在高度内 *!*/
/*}*/

:deep(.lay-tab-article .layui-tab-head) {
  z-index: 99;
  width: 100%;
  position: fixed;
  margin-top: -30px;
  border-bottom: 1px solid #eeeeee;
  background-image: radial-gradient(transparent 1px, #ffffff 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
}

:deep(.lay-tab-article .getmore) {
  z-index: 99;
  width: 100%;
  position: fixed;
  margin-bottom: -80px;
  border-bottom: 1px solid #eeeeee;
  background-image: radial-gradient(transparent 1px, #ffffff 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
}

:deep(.lay-tab-article .layui-tab-content) {
  /* 设置内容区域的样式 */
  /*  margin-top: 60px; !* 确保内容不被固定标签栏遮挡 *!*/
  /*  padding: 20px;*/
  height: calc(100vh - 120px); /* 固定高度，减去标签栏的高度 */
  overflow: auto; /* 隐藏超出部分的内容 */
  box-sizing: border-box; /* 确保内边距和边框包含在高度内 */
}

:deep(.lay-tab-article .layui-tab-content .layui-card-body) {
  /* 设置内容区域的样式 */
  /*  margin-top: 60px; !* 确保内容不被固定标签栏遮挡 *!*/
  /*  padding: 20px;*/
  height: 80vh; /* 固定高度，减去标签栏的高度 */
  overflow-y: scroll;
  box-sizing: border-box; /* 确保内边距和边框包含在高度内 */
}

/* 隐藏滚动条（适用于Webkit浏览器，如Chrome和Safari） */
:deep(.lay-tab-article .layui-tab-content .layui-card-body::-webkit-scrollbar) {
  display: none; /* 隐藏滚动条 */
}

/* 隐藏滚动条（适用于Firefox） */
:deep(.lay-tab-article .layui-tab-content .layui-card-body) {
  scrollbar-width: none; /* Firefox */
}
</style>
<style lang="less" scoped>
.button-list {
  display: flex;
}

.button-list > div {
  flex: 1;
  text-align: center;
  color: #909399;
}

.search-div {
  width: 100%;
  padding: 10px 0;
  text-align: center;
}

.article-item {
  display: flex;
  width: 100%;
  //height: 200px;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  border-bottom: 1px solid #ebeef5;
}

.article-item-content {
  flex: 1;
  font-size: 18px;
}

/* 设置内容区域样式 */
.article-item-content .content-description {
  width: 100vh; /* 宽度占满容器 */
  //height: 75px; /* 高度占满容器 */
  display: -webkit-box; /* 使用Flexbox布局 */
  -webkit-box-orient: vertical; /* 垂直排列 */
  -webkit-line-clamp: 3; /* 设置显示的行数 */
  overflow: hidden; /* 隐藏超出部分的内容 */
  text-overflow: ellipsis; /* 超出部分用...表示 */
  white-space: normal; /* 允许换行 */
  color: #737171;
}

.article-item-img {
  width: 300px;
  height: 100%;
  padding-right: 20px;
  box-sizing: border-box;

  > img {
    width: 280px;
    height: 190px;
    border-radius: 5px;
  }

  > img:hover {
    cursor: pointer;
    box-shadow: 1px 1px 10px #dfdfdf;
  }
}

.content-tags {
  display: inline-block;

  > .layui-tag {
    margin-right: 10px;
  }
}

.content-userInfo {
  color: #898989;
  font-size: 14px;
}

.content-start {
  width: 100vh;
  margin-top: 5px;
  font-size: 12px;
  color: #878787;
  display: flex;
}

.content-start-item {
  flex: 1;
  height: 20px;
  line-height: 20px;
  display: inline-block;
  text-align: left;
}

.borderR {
  border-right: 1px solid #ebeef5;
}

.getmore {
  width: 100%;
  height: 30px;
  margin: 20px auto;
  text-align: center;
}
</style>
