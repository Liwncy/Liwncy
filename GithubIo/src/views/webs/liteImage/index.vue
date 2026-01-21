<template>
  <lay-layout class="example">
    <!-- 左侧菜单栏 -->
    <MenuSidebarF
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleClick"
        v-model:visible="isMenuVisible"
    />
    <!-- <lay-side>菜单栏</lay-side> -->
    <lay-body id="content" class="img-content" :class="{ 'menu-hidden': !isMenuVisible }">
      <lay-container :fluid="true" class="img-view-wrap">
        <lay-row space="1">
          <lay-col md="10">
            <!-- 图片展示区域 -->
            <lay-container>
              <div class="img-box">
                <lay-loading :type="0" :loading="loadingA">
                  <img
                      v-if="imgUrl"
                      :src="imgUrl"
                      alt="随机图片"
                      class="show-img"
                      @error="handleImgError"
                  />
                  <lay-empty v-else description="暂无图片，请点击切换加载"></lay-empty>
                </lay-loading>
              </div>
            </lay-container>
          </lay-col>
          <lay-col md="6" mdOffset="6" mdPull="6">
            <lay-container>
              <div class="grid-demo">图片描述区域</div>
            </lay-container>
          </lay-col>
        </lay-row>
      </lay-container>
      <div class="body-footer">
        <lay-button @click="toGetMore">换一个</lay-button>
      </div>
    </lay-body>
  </lay-layout>
</template>
<script setup>
import {computed, onMounted, ref} from "vue";
import {getSideMenus} from "@/api/webs/liteImage";
import {requestGetYujnApi} from "@/api/common/external/yujn";


const menus = ref([]);
const currentPath = ref("zhihu");
const currentMenu = ref({});

const imgUrl = ref('');

const loadingA = ref(false);

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "200px" : "0px"));

const handleMenuOpen = function (val) {
  isMenuVisible.value = val;
};

/**
 * 菜单子项点击
 * @param menu
 */
const handleClick = async function (menu) {
  console.log("menu0", menu);
  currentMenu.value = menu;
  // selected.value = menu.id;
  currentPath.value = menu.id;
  getLiteImage();
};


// 获取侧边栏
const initPage = async function () {
  const res = await getSideMenus();
  console.log(res);
  menus.value = res.data;
  await handleClick(menus.value[0].children[0]);
};

/**
 * 获取数据
 * @param t
 */
function getLiteImage(t) {
  loadingA.value = true;
  console.log("menu", currentMenu.value);
  const api = currentMenu.value.data.api;
  // console.log("api", api)
  requestGetYujnApi(api, {}).then(res => {
    loadingA.value = false;
    console.log(res.data);
    imgUrl.value = res.data || res.img;
  }).catch(() => {
    loadingA.value = false;
  })
}


/**
 * 换一个
 */
const toGetMore = function () {
  getLiteImage();
}

onMounted(() => {
  initPage()
})

</script>

<style scoped>

.menu-hidden {
  grid-template-columns: 0 1fr;
}

.layui-layout-website > .layui-layout > .layui-body {
  left: v-bind(menuVisible);
  width: calc(100% - v-bind(menuVisible));
}

.layui-layout-website > .layui-layout > .layui-body > .body-footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 页面根容器 */
.img-view-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 左侧菜单容器样式 */
.menu-aside {
  height: 100vh;
  background-color: #091E42;
  padding-top: 10px;
}

/* 右侧内容区 */
.img-content {
  height: 100vh;
  background-color: #F2F3F5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 图片展示外层容器 */
.img-view-wrap {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* 核心图片盒子 - 固定高度核心样式 */
.img-box {
  width: 100%;
  height: 100%; /* 重点：图片区域高度固定 */
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 20px;
}

/* 图片样式 - 宽度自适应+高度固定+不变形 核心样式 */
.show-img {
  height: 100%; /* 继承父盒子的固定高度 */
  width: auto; /* 重点：宽度自适应，根据图片比例自动计算 */
  max-width: 100%; /* 防止图片宽度超出容器 */
  object-fit: contain; /* 关键属性：保持图片比例，完整展示，不变形 */
  transition: all 0.3s ease;
}

/* 切换按钮容器 */
.btn-wrap {
  width: 100%;
  text-align: center;
}
</style>