<template>
  <lay-layout class="example1">
    <lay-side class="no-scrollbar">
      <lay-container fluid="true" style="padding: 10px;">
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
        </lay-menu>
      </lay-container>
    </lay-side>
    <lay-body id="bookMarkContent">
      <lay-container fluid="true" style="padding: 10px;">
        <lay-row space="10" class="sticky-element" style="top:1px;background:#f0f1f4;">
          <lay-col :md="24">
            <lay-card>
              <lay-form style="margin-top: 20px">
                <lay-row>
                  <lay-col :md="6">
                    <lay-form-item label-width="50">
                      <lay-input
                          v-model="filterBookText"
                          prefix-icon="layui-icon-search"
                          placeholder="Filter"
                          :allow-clear="true"
                          class="DocSearch DocSearch-Button"
                          style="width: 90%"
                      ></lay-input>
                    </lay-form-item>
                  </lay-col>
                  <!--                  <lay-col :md="6">-->
                  <!--                    <lay-form-item label-width="0">-->
                  <!--                      <lay-button type="primary" @click="toSearch">查询</lay-button>-->
                  <!--                      <lay-button @click="toReset">重置</lay-button>-->
                  <!--                    </lay-form-item>-->
                  <!--                  </lay-col>-->
                </lay-row>
              </lay-form>
            </lay-card>
          </lay-col>
        </lay-row>
        <lay-row space="10">
          <template v-for="(book,index) in bookShowData" :key="book.id">
            <lay-col md="4" style="">
              <lay-panel style="height: 120px;background: #dadadc;">
                <a :href="book.links" target="_blank" rel="noopener noreferrer" class="block">
                  <lay-row space="20">
                    <lay-col md="4" style="height:100%;">
                      <lay-avatar :src="book.avatar" size="xs"
                                  style="width: auto;height: auto;max-width: 100%;max-height: 100%;"></lay-avatar>
                    </lay-col>
                    <lay-col md="20" :title="book.title" style="height:30px;">
                      <h5 class="text-omitted">{{ book.title }}</h5>
                    </lay-col>
                    <lay-col md="20" :title="book.description" style="height:90px;flex: 1;font-size: 12px;">
                      <p class="multi-line-text-omitted">
                        {{ book.description }}
                      </p>
                    </lay-col>
                  </lay-row>
                </a>
              </lay-panel>
            </lay-col>
            <template v-if="(index+1) % 10 === 0">
              <lay-line theme="green"></lay-line>
            </template>
          </template>
        </lay-row>
      </lay-container>
    </lay-body>
    <lay-backtop target="#bookMarkContent" :showHeight="100" :bottom="30" position="absolute"></lay-backtop>
  </lay-layout>
</template>

<script>
import {onMounted, nextTick, ref, watch} from 'vue';
import {getSideMenus} from "@/api/webs/bookMark/index";
import {getParents, getNode, getAllNodeFieldArr} from "@/library/treeUtil";
import axios from "axios";
import linksJson from "../../../../../data/webs/bookMark/links.json"

export default {
  components: {LayBody},
  setup() {
    const openKeys = ref(["7"])
    const selectedKey = ref("all")
    const filterBookText = ref("");
    const menuData = ref([]);
    const bookData = ref([]);
    const bookShowData = ref([]);
    const checkedBook = ref("");
    const images = ref("https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/uniapp_logo.png");
    const target = ref()
    nextTick(() => {
      target.value = document.querySelector(".layui-body");
    })

    watch(filterBookText, (val) => {
      bookShowData.value = bookData.value.filter(b => b.title.includes(val));
    });


    // 选中菜单时触发
    function changeMainSelectedKey(key) {
      // console.log("changeSelectedKey", key);
      const node = getNode(menuData.value, key);
      // console.log("node", node)
      if (node.books) {
        bookData.value = node.books;
        bookShowData.value = bookData.value;
      }
      if (key === "all") {
        bookData.value = getAllNodeFieldArr(menuData.value, [], "books").flat();
        bookShowData.value = bookData.value;
      }
    }

    const initPage = async function () {
      const res = await getSideMenus();
      menuData.value = res.data;
      changeMainSelectedKey("all");
    };
    onMounted(() => {
      initPage()
    })

    return {
      openKeys,
      selectedKey,
      menuData,
      target,
      bookData,
      bookShowData,
      filterBookText,
      checkedBook,
      images,
      changeMainSelectedKey
    }
  }
}
</script>
<style>
</style>
