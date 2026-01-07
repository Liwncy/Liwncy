<template>
  <lay-layout>
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleClick"
    />
    <lay-body id="content">
      <!-- <div class="layui-menu-toggle" style="width: auto !important;height: auto !important;padding: 0 !important;" -->
      <!--      @click="handleMenuOpen(true)"> -->
      <!--   <lay-icon type="layui-icon-menu-fill" style="font-size: 32px"></lay-icon> -->
      <!-- </div> -->
      <!-- <div style="padding: 20px" @click="handleMenuOpen(false)"> -->
      <lay-container :fluid="true" style="padding: 10px;/*height: 100%*/">
        <lay-card style="/*margin-top: 10px; border-radius: 5px*/">
          <lay-loading :type="0" :loading="loadingA">
            <!-- 西瓜视频播放器 -->
            <div class="xg-player-container" ref="xgPlayerRef"></div>
          </lay-loading>
        </lay-card>
      </lay-container>
      <!-- </div> -->
      <lay-footer style="position: fixed;bottom: 0;width: 100%;z-index: 1000;height: 60px;display: flex;justify-content: center;align-items: center;">
        <div class="getmore">
          <lay-button @click="toGetMore">换一个</lay-button>
        </div>
      </lay-footer>
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
import {getPaginationData} from "@/utils/paginationUtil";


const menus = ref([]);
const currentPath = ref("zhihu");
const currentMenu = ref({});
// 播放器容器ref
const xgPlayerRef = ref(null);
// 播放器实例
let xgPlayer = null;
const videoUrl = ref("http://s2.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4")

const loadingA = ref(false);

const isMenuDisplay = ref(false);
const menuDisplay = computed(() => (isMenuDisplay.value ? "200px" : "0px"));

/**
 * 菜单子项点击
 * @param menu
 */
const handleClick = function (menu) {
  console.log("menu0", menu);
  currentMenu.value = menu;
  // selected.value = menu.id;
  currentPath.value = menu.id;
  getLiteVideo();
  // page.value = {total: 100, limit: 10, current: 1};
  // getArticleList();
  // handleMenuOpen(false);
};


// 获取侧边栏
const initPage = async function () {
  const res = await getSideMenus();
  console.log(res);
  menus.value = res.data;
  await handleClick(menus.value[0].children[0]);
  initPlayer()
};

// 初始化播放器函数（可复用）
const initPlayer = () => {
  if (!xgPlayerRef.value) {
    console.error("未获取到播放器容器DOM");
    return;
  }
  // 初始化西瓜播放器
  xgPlayer = new XGPlayer({
    el: xgPlayerRef.value, // 挂载容器
    url: videoUrl.value, // 视频地址
    poster: './images/cover.jpg', // 封面图
    controls: true, // 显示控件
    autoplay: true, // 不自动播放
    loop: false, // 不循环
    playbackRate: [0.5, 1, 1.5, 2], // 倍速选项
    volume: 0.7, // 默认音量
    lang: 'zh-cn', // 中文语言
    enableProgressDrag: true, // 允许拖动进度条
    enableVolumeDrag: true, // 允许拖动音量条
    // 流式布局
    fluid: true,
    // 自适应视频内容宽高
    // fitVideoSize: 'auto',
    // fitVideoSize: 'fixHeight',
    // 视频初始尺寸
    // width: '100%',
    height: 300

  });

  // 监听播放事件
  xgPlayer.on('play', () => {
    console.log("西瓜播放器 开始播放");
  });
};

const handleMenuOpen = function (val) {
  isMenuDisplay.value = val;
};

/**
 * 获取视频
 * @param t
 */
function getLiteVideo(t) {
  loadingA.value = true;
  console.log("menu", currentMenu.value);
  const api = currentMenu.value.data.api;
  // console.log("api", api)
  requestGetYujnApi(api, {}).then(res => {
    loadingA.value = false;
    console.log(res.data);
    videoUrl.value = res.data;
    initPlayer();
  }).catch(() => {
    loadingA.value = false;
  })
}

/**
 * 换一个
 */
const toGetMore = function () {
  getLiteVideo();
}


onMounted(() => {

  initPage()


})

// 组件卸载时销毁播放器
onUnmounted(() => {
  if (xgPlayer) {
    xgPlayer.destroy(); // 销毁西瓜播放器实例
    xgPlayer = null;
  }
});

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


<style scoped>
.xg-player-container {
  margin: 20px auto;
  border-radius: 8px;
  overflow: hidden;
}

.player-container {
  border-radius: 8px;
  overflow: hidden;
  background-color: #000; /* 视频加载前显示黑色背景，更美观 */
}
</style>