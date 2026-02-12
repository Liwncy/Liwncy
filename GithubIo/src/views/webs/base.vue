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

      </lay-container>
    </lay-body>
  </lay-layout>
</template>

<script setup>
import {computed, nextTick, onMounted, ref} from "vue";
import {getSideMenus} from "@/api/webs/dailyhot";
import {requestGetPearkApi} from "@/api/common/external/peark";

const menus = ref([]);
const currentPath = ref("哔哩哔哩");
const currentMenu = ref({});

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "200px" : "0px"));

/**
 * 菜单子项点击
 */
const handleClick = async function (menu) {
  currentMenu.value = menu;
  currentPath.value = menu.id;
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

}

/**
 * 加载更多
 */
const toGetMore = function () {

}

onMounted(() => {
  initPage();
});
</script>

<style scoped>

</style>