<template>
  <lay-layout class="example1">
    <lay-side class="layui-menu-ref-2 no-scrollbar">
      <lay-container fluid="true" style="padding: 0;">
        <lay-row space="10" class="sticky-element" style="top:1px;background:#f0f1f4;">
          <lay-col :md="24">
            <lay-select v-model="dataSource" @change="dataSourceChange" placeholder="切换源" style="width: 200px">
              <lay-select-option value="0" label="我的书签"></lay-select-option>
              <lay-select-option value="1" label="喜欢书签"></lay-select-option>
              <lay-select-option value="2" label="随机生成"></lay-select-option>
              <!-- <lay-select-option value="3" label="测试(dev)"></lay-select-option> -->
              <!-- <lay-select-option value="4" label="link"></lay-select-option> -->
              <!-- <lay-select-option value="5" label="linkin"></lay-select-option> -->
            </lay-select>
          </lay-col>
        </lay-row>
        <lay-row>
          <lay-scroll style="overflow-y: scroll">
            <ul class="layui-menu layui-menu-lg layui-menu-docs">
              <li class="layui-menu-item-group"
                  lay-options="{type: 'group', isAllowSpread: true}">
                <div class="layui-menu-body-title" @click="handleClick()">
                  <a href="javascript:void(0)">
                    <span v-if="selectedKey === 'all'" style="color: var(--global-checked-color)">全 部</span>
                    <span v-else style="color: rgba(0, 0, 0, 0.8)">全 部</span>
                  </a>
                </div>
                <hr/>
              </li>
              <li v-for="menu in menuData" :key="menu" class="layui-menu-item-group"
                  lay-options="{type: 'group', isAllowSpread: true}"
              >
                <div class="layui-menu-body-title" @click="handleClick(menu)">
                  <a href="javascript:void(0)">
                    <span v-if="selectedKey === menu.id" style="color: var(--global-checked-color)">{{
                        menu.name
                      }}</span>
                    <span v-else style="color: rgba(0, 0, 0, 0.8)">{{ menu.name }}</span>
                  </a>
                </div>
                <hr/>
                <ul>
                  <li v-for="children in menu.children" :key="children"
                      :class="[selectedKey === children.id? 'layui-menu-item-checked2': '',]"
                      @click="handleClick(children)">
                    <div class="layui-menu-body-title">
                      <a href="javascript:void(0)">
                        <span>{{ children.name }}</span>
                        <span class="layui-font-12 layui-font-gray">
                      {{ children.name }}
                    </span>
                      </a>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </lay-scroll>
        </lay-row>
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
              <lay-panel style="height: 120px;background: var(--global-neutral-color-2);">
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

<script setup>
import {onMounted, nextTick, ref, watch} from 'vue';
import {getBookMarks, getWeTabSidMenus} from "@/api/webs/bookMark";
import {getParents, getNode, getAllNodeFieldArr} from "@/utils/treeUtil";


const selectedKey = ref("all")
const filterBookText = ref("");
const dataSource = ref("0");
const menuData = ref([]);
const bookData = ref([]);
const bookShowData = ref([]);

watch(filterBookText, (val) => {
  bookShowData.value = bookData.value.filter(b => b.title.includes(val));
});

/**
 * 获取书签
 * @param val
 * @returns {Promise<void>}
 */
const dataSourceChange = async function (val) {
  console.log("dataSourceChange", val)
  const res = await getBookMarks({"dataSource": dataSource.value});
  menuData.value = res.data;
  handleClick();
}

// 选中菜单时触发
const handleClick = (node) => {
  // console.log("handleClick", node);
  if (node === undefined) {
    node = {id: "all", name: "全部", children: menuData.value}
  }
  // console.log("handleClick", node);
  selectedKey.value = node.id;
  bookData.value = node.books || getAllNodeFieldArr(node.children, [], "books").flat();
  bookShowData.value = bookData.value;
};

/**
 * 初始化页面
 * @returns {Promise<void>}
 */
const initPage = async function () {
  // const res = await getWeTabSidMenus();
  // console.log("initPage", res);
  await dataSourceChange();
};

onMounted(() => {
  initPage()
})
</script>
<style>
</style>
