<template>
  <lay-layout>
    <!-- 左侧菜单栏 -->
    <MenuSidebar
        :menus="menus"
        :currentPath="currentPath"
        @childClick="handleClick"
        v-model:visible="isMenuVisible"
    />
    <!-- 右侧内容区域 -->
    <lay-body id="content">
      <lay-container :fluid="true" class="main-container">

      </lay-container>
    </lay-body>
  </lay-layout>
</template>

<script setup>
import {computed, nextTick, onMounted, ref} from "vue";
import {getSideMenus} from "@/api/webs/test";

const menus = ref([]);
const currentPath = ref("base");
const currentMenu = ref({});

const isMenuVisible = ref(true);
const menuVisible = computed(() => (isMenuVisible.value ? "240px" : "0px"));

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

onMounted(() => {
  initPage();
});
</script>

<style scoped>

.layui-layout-website > .layui-layout > .layui-body {
  left: v-bind(menuVisible);
  width: calc(100% - v-bind(menuVisible));
}

</style>