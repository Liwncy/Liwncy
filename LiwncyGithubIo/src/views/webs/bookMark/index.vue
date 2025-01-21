<template>
  <lay-layout class="example1">
    <lay-side>
      <lay-menu v-model:selected-key="selectedKey" theme="light" v-model:openKeys="openKeys" :tree="true"
                @changeSelectedKey="changeMainSelectedKey">
        <template v-for="item in menuData" :key="item.id">
          <lay-menu-item v-if="!item.children" :id="item.id">
            <lay-icon v-if="item.icon" :type="item.icon"></lay-icon>
            {{ t(item.useI18n || item.name) }}
          </lay-menu-item>
          <lay-sub-menu v-else :id="item.id">
            <template #title>
              <lay-icon v-if="item.icon" :type="item.icon"></lay-icon>
              {{ t(item.useI18n || item.name) }}
            </template>
            <template v-for="child in item.children" :key="child.id">
              <lay-sub-menu v-if="child.children" :id="child.id">
                <template #title>
                  <lay-icon v-if="child.icon" :type="child.icon"></lay-icon>
                  {{ t(child.useI18n || child.name) }}
                </template>
              </lay-sub-menu>
              <lay-menu-item v-else :id="child.id">
                <lay-icon v-if="child.icon" :type="child.icon"></lay-icon>
                {{ t(child.useI18n || child.name) }}
              </lay-menu-item>
            </template>
          </lay-sub-menu>
        </template>
        <!--        <lay-menu-item id="1">
                  <template #title>
                    菜单
                  </template>
                </lay-menu-item>
                <lay-sub-menu id="7">
                  <template v-slot:title>
                    <router-link to="">
                      <lay-icon type="layui-icon-home"></lay-icon>
                      目录
                    </router-link>
                  </template>
                  <template v-slot:expandIcon={isExpand}>
                    {{isExpand}}
                  </template>
                  <lay-menu-item id="8">
                    <router-link to="">
                      <lay-icon type="layui-icon-home"></lay-icon>
                      菜单
                    </router-link>
                  </lay-menu-item>
                  <lay-menu-item id="9">
                    <router-link to="">
                      <lay-icon type="layui-icon-home"></lay-icon>
                      菜单
                    </router-link>
                  </lay-menu-item>
                </lay-sub-menu>-->
      </lay-menu>
    </lay-side>
    <lay-body>content</lay-body>
  </lay-layout>
</template>

<script>
import {onMounted, ref} from 'vue';
import {getSideMenus} from "@/api/webs/bookMark/index";

export default {
  components: {LayBody},
  setup() {
    const openKeys = ref(["7"])
    const selectedKey = ref("all")
    const menuData = ref([]);

    // const emits = defineEmits(['changeOpenKeys', 'changeSelectedKey'])
    //
    // const changeOpenKeys = (keys: string[]) => {
    //   emits("changeOpenKeys", keys);
    // }

    // 选中菜单时触发
    function changeMainSelectedKey(key) {
      console.log("changeSelectedKey", key);
    }

    const initPage = async function () {
      const res = await getSideMenus();
      menuData.value = res.data;
    };
    onMounted(() => {
      initPage()
    })

    return {
      openKeys,
      selectedKey,
      menuData,
      changeMainSelectedKey
    }
  }
}
</script>
<style>
.example .layui-footer,
.example .layui-header {
  line-height: 60px;
  text-align: center;
  background: #87ca9a;
  color: white;
}

.example .layui-side {
  display: flex;
  background: #77c38c;
  align-items: center;
  justify-content: center;
  color: white;
}

.example .layui-body {
  display: flex;
  background: #5FB878;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
