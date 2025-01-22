<template>
  <lay-layout class="example1">
    <lay-side>
      <lay-menu v-model:selected-key="selectedKey" theme="light" v-model:openKeys="openKeys" :tree="true"
                :level="true"
                :indent="true"
                @changeSelectedKey="changeMainSelectedKey">
        <template v-for="item in menuData" :key="item.id">
          <lay-menu-item v-if="!item.children" :id="item.id">
            <lay-icon v-if="item.icon" :type="item.icon"></lay-icon>
            {{ item.name }}
          </lay-menu-item>
          <lay-sub-menu v-else :id="item.id">
            <template #title>
              <lay-icon v-if="item.icon" :type="item.icon"></lay-icon>
              {{ item.name }}
            </template>
            <template v-for="child in item.children" :key="child.id">
              <lay-sub-menu v-if="child.children" :id="child.id">
                <template #title>
                  <lay-icon v-if="child.icon" :type="child.icon"></lay-icon>
                  {{ child.name }}
                </template>
              </lay-sub-menu>
              <lay-menu-item v-else :id="child.id">
                <lay-icon v-if="child.icon" :type="child.icon"></lay-icon>
                {{ child.name }}
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
    <lay-body>
      <lay-container fluid="true" style="padding: 50px">
        <lay-row space="10">
          <template v-for="(book,index) in bookData" :key="book.id">
            <lay-col md="4">
              <lay-panel style="height: 120px">
                <a :href="book.links" target="_blank" rel="noopener noreferrer" class="block">
                  <!--                    <lay-col md="2" style="height:30px;">
                                        <lay-badge position="top-left" :value="index+1" :badgeStyle="{top:'7px'}"></lay-badge>
                                      </lay-col>-->
                  <lay-col md="2" style="height:30px;">
                    <lay-avatar :src="book.avatar" size="xs"
                                style="width: auto;height: auto;max-width: 100%;max-height: 100%;"></lay-avatar>
                  </lay-col>
                  <lay-col md="22" style="height:30px;">
                    <h3 style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{ book.title }}</h3>
                  </lay-col>
                  <lay-col md="24" style="height:90px;flex: 1;font-size: 12px;">
                    <p style="-webkit-line-clamp: 3;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;white-space: normal;">
                      {{ book.description }}
                    </p>
                  </lay-col>
                </a>
              </lay-panel>
            </lay-col>
          </template>
        </lay-row>
      </lay-container>
    </lay-body>
  </lay-layout>
</template>

<script>
import {onMounted, ref} from 'vue';
import {getSideMenus} from "@/api/webs/bookMark/index";
import {getParents, getNode} from "@/library/treeUtil";

export default {
  components: {LayBody},
  setup() {
    const openKeys = ref(["7"])
    const selectedKey = ref("all")
    const menuData = ref([]);
    const bookData = ref([]);
    const checkedBook = ref("");
    const images = ref("https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/uniapp_logo.png");

    // const emits = defineEmits(['changeOpenKeys', 'changeSelectedKey'])
    //
    // const changeOpenKeys = (keys: string[]) => {
    //   emits("changeOpenKeys", keys);
    // }

    // 选中菜单时触发
    function changeMainSelectedKey(key) {
      console.log("changeSelectedKey", key);
      const node = getNode(menuData.value, key);
      console.log("node", node)
      if (node.books) {
        bookData.value = node.books;


      }
    }

    // 右边数据加载
    function booksMain() {
      var sitMainLiEL = document.querySelectorAll(".layui-side .layui-side-scroll .layui-nav-tree .layui-nav-item");
      sitMainLiEL.forEach((item) => {
        item.addEventListener("click", function () {
          var id = item.getAttribute("lay-id");
          var node = getNode(menuData.value, id);
          if (node.books) {
            bookData.value = node.books;
          }
        });
      });

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
      bookData,
      checkedBook,
      images,
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
