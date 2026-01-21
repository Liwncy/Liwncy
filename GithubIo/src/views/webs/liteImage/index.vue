<template>
  <lay-layout class="example">
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleClick"
        v-model:visible="isMenuVisible"
    />
    <!-- <lay-side>菜单栏</lay-side> -->
    <lay-body id="content">
      <lay-container :fluid="true">
        <!-- 内容区域 -->
        <!-- <lay-row space="1"> -->
        <!--   <lay-col md="10"> -->
        <!--     &lt;!&ndash; 图片展示区域 &ndash;&gt; -->
        <!--     <lay-container> -->
        <!--       <div class="img-box"> -->
        <!--         <lay-loading :type="0" :loading="loadingA"> -->
        <!--           <img -->
        <!--               v-if="imgUrl" -->
        <!--               :src="imgUrl" -->
        <!--               alt="随机图片" -->
        <!--               class="show-img" -->
        <!--               @error="handleImgError" -->
        <!--           /> -->
        <!--           <lay-empty v-else description="暂无图片，请点击切换加载"></lay-empty> -->
        <!--         </lay-loading> -->
        <!--       </div> -->
        <!--     </lay-container> -->
        <!--   </lay-col> -->
        <!--   <lay-col md="6" mdOffset="6" mdPull="6"> -->
        <!--     <lay-container> -->
        <!--       <div class="grid-demo">图片描述区域</div> -->
        <!--     </lay-container> -->
        <!--   </lay-col> -->
        <!-- </lay-row> -->
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

</style>