<template>
  <lay-layout>
    <lay-side class="layui-menu-ref-2">
      <lay-scroll style="overflow-y: scroll">
        <ul class="layui-menu layui-menu-lg layui-menu-docs">
          <li
              v-for="menu in menus"
              :key="menu"
              class="layui-menu-item-group"
              lay-options="{type: 'group', isAllowSpread: true}"
          >
            <div class="layui-menu-body-title">{{ menu.title }}</div>
            <hr/>
            <ul>
              <li
                  v-for="children in menu.children"
                  :key="children"
                  :class="[
                  currentPath === children.sourceId
                    ? 'layui-menu-item-checked2'
                    : '',
                ]"
                  @click="handleClick(children)"
              >
                <div class="layui-menu-body-title">
                  <a href="javascript:void(0)">
                    <span>{{ children.title }}</span>
                    <span class="layui-font-12 layui-font-gray">
                      {{ children.subTitle }}
                    </span>
                  </a>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </lay-scroll>
    </lay-side>
    <lay-body>
      <div
          class="layui-menu-toggle"
          style="
          width: auto !important;
          height: auto !important;
          padding: 0 !important;
          padding-left: 8px;
        "
          @click="handleMenuOpen(true)"
      >
        <lay-icon
            type="layui-icon-menu-fill"
            style="font-size: 32px"
        ></lay-icon>
      </div>
      <div style="padding: 20px" @click="handleMenuOpen(false)">
        <lay-tab type="brief" v-model="currentTab" @change="handleTabChange" tabPosition="top"
                 class="lay-tab-article">
          <lay-tab-item
              v-for="(item, index) in tabTitleList"
              :key="index"
              :id="item.id"
              :title="item.title"
              :sourceId="item.sourceId"
          >
            <lay-container :fluid="true" style="padding: 10px;/*height: 100%*/">
              <!--              <lay-card>-->
              <!--                <div class="search-div">-->
              <!--                  <lay-input style="width: 200px" v-model="searchTitle"></lay-input>-->
              <!--                  <lay-button type="primary" style="margin-left: 10px" @click="toSearch"-->
              <!--                  >查询-->
              <!--                  </lay-button-->
              <!--                  >-->
              <!--                  <lay-button @click="toReset">重置</lay-button>-->
              <!--                </div>-->
              <!--              </lay-card>-->
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
  </lay-layout>
</template>
<script>
import {ref, watch, computed, onMounted} from "vue";
import {layer} from "@layui/layui-vue";
import {generateRandomString, encryptSha256} from '@/utils/crypto';
import axios from "axios";

export default {
  setup() {
    const currentPath = ref("zhihu");
    const tabTitleList = ref([]);
    const currentTab = ref(1);

    const loadingA = ref(false);

    const isMenuDisplay = ref(false);
    const menuDisplay = computed(() => (isMenuDisplay.value ? "200px" : "0px"));

    // watch(
    //     () => route.path,
    //     (val) => {
    //       currentPath.value = val;
    //     },
    //     {
    //       immediate: true,
    //       deep: true,
    //     }
    // );

    const menus = [
      {
        id: 1,
        title: "综合",
        children: [
          {
            id: 1,
            title: "知乎",
            subTitle: "zhihu",
            sourceId: "zhihu",
            tabNames: ["热榜"],
          },
          {
            id: 2,
            title: "B站",
            subTitle: "bilibili",
            sourceId: "bilibili",
            tabNames: ["综合热门", "排行榜", "入站必刷"],
          },
          {
            id: 3,
            title: "新浪新闻",
            subTitle: "sina",
            sourceId: "sina",
            tabNames: ["新浪热榜", "潮流热榜", "娱乐热榜", "体育热榜", "汽车热榜", "时尚热榜", "旅游热榜", "育儿热榜", "AI热榜", "ESG热榜"],
          },
        ],
      },
    ];

    const selected = ref(1);

    const handleMenuOpen = function (val) {
      isMenuDisplay.value = val;
    };

    const handleClick = function (menu) {
      selected.value = menu.id;
      currentPath.value = menu.sourceId;
      currentTab.value = 1;
      tabTitleList.value = menu.tabNames.map((item, index) => {
        return {
          id: index + 1,
          title: item,
          sourceId: menu.sourceId,
          tabId: index + 1,
        };
      });
      page.value = {total: 100, limit: 10, current: 1};
      getArticleList();
      handleMenuOpen(false);
    };

    function handleTabChange() {
      page.value = {total: 100, limit: 10, current: 1};
      getArticleList();
    }

    const api = "https://newsapi.redian.me/api/articles";
    const imgUrlPrefix = "https://img-1307712705.cos.ap-beijing.myqcloud.com/";
    const page = ref({total: 100, limit: 10, current: 1})

    const articleList = ref([]);

    function getArticleList(t) {
      loadingA.value = true;
      let e = Date.now().toString()
          , r = generateRandomString(20)
          , i = encryptSha256("".concat(e).concat(r).concat("0eC7PICw8CdUNodJ"));
      axios.get(api, {
        headers: {
          "x-timestamp": e,
          "x-api-key": r,
          "x-signature": i,
          "Content-Type": "application/json"
        },
        params: {
          source_id: currentPath.value,
          tab_name: tabTitleList.value.find(item => item.tabId === currentTab.value)["title"],
          page: page.value.current,
          pagesize: page.value.limit
        }
      }).then(res => {
        loadingA.value = false;
        if (t === 1) {
          articleList.value = articleList.value.concat(res.data.data.list);
        } else {
          articleList.value = res.data.data.list
        }
        page.value.total = res.data.data.pagination.total
      }).catch(() => {
        loadingA.value = false;
      })
    }

    function toGetMore() {
      // const page = ref({total: 100, limit: 10, current: 1})
      if (page.value.total <= page.value.current * page.value.limit) {
        layer.msg("没有更多了", {time: 1000})
        return;
      }
      page.value.current++;
      getArticleList(1);
    }

    const searchTitle = ref('')

    function toSearch() {
      layer.load(2, {time: 3000})
    }

    function toReset() {
      searchTitle.value = ''
    }

    handleClick(menus[0].children[0]);
    onMounted(() => {
      getArticleList();
    })

    return {
      menus,
      selected,
      currentPath,
      loadingA,
      imgUrlPrefix,
      handleClick,
      handleMenuOpen,
      handleTabChange,
      menuDisplay,
      currentTab,
      tabTitleList,
      articleList,
      page,
      searchTitle,
      toGetMore,
      toSearch,
      toReset
    };
  },
};
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
