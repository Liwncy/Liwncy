<template>
  <lay-layout class="example1">
    <lay-side class="layui-menu-ref-2 no-scrollbar">
      <lay-container fluid="true" style="padding: 0;">
        <lay-row>
          <lay-scroll style="overflow-y: scroll">
            <ul class="layui-menu layui-menu-lg layui-menu-docs">
              <li v-for="children in dataList" :key="children"
                  :class="[selectedKey === children.id? 'layui-menu-item-checked2': '',]"
                  @click="handleClick(children)">
                <div class="layui-menu-body-title">
                  <a href="javascript:void(0)">
                    <span>{{ children.title }}</span>
                    <span class="layui-font-12 layui-font-gray">
                      {{ children.date }}
                    </span>
                  </a>
                </div>
              </li>
            </ul>
            <hr/>
<!--            <ul class="layui-menu layui-menu-lg layui-menu-docs">-->
<!--              <li v-for="menu in dataList" :key="menu" class="layui-menu-item-group"-->
<!--                  lay-options="{type: 'group', isAllowSpread: true}"-->
<!--              >-->
<!--                <div class="layui-menu-body-title" @click="handleClick(menu)">-->
<!--                  <a href="javascript:void(0)">-->
<!--                    <span v-if="selectedKey === menu.id" style="color: var(&#45;&#45;global-checked-color)">{{-->
<!--                        menu.title-->
<!--                      }}</span>-->
<!--                    <span v-else style="color: rgba(0, 0, 0, 0.8)">{{ menu.title }}</span>-->
<!--                  </a>-->
<!--                </div>-->
<!--                <hr/>-->
<!--                <ul>-->
<!--                  <li v-for="children in dataList" :key="children"-->
<!--                      :class="[selectedKey === children.id? 'layui-menu-item-checked2': '',]"-->
<!--                      @click="handleClick(children)">-->
<!--                    <div class="layui-menu-body-title">-->
<!--                      <a href="javascript:void(0)">-->
<!--                        <span>{{ children.title }}</span>-->
<!--                        <span class="layui-font-12 layui-font-gray">-->
<!--                      {{ children.title }}-->
<!--                    </span>-->
<!--                      </a>-->
<!--                    </div>-->
<!--                  </li>-->
<!--                </ul>-->
<!--              </li>-->
<!--            </ul>-->
          </lay-scroll>
        </lay-row>
      </lay-container>
    </lay-side>
    <lay-body id="bookMarkContent">
      <lay-container class="layui-text" fluid="true" style="padding: 10px;">
        <lay-button @click="changeMd">切 换</lay-button>
        <MarkdownRenderer :content="curData.content"/>
      </lay-container>
    </lay-body>
    <lay-backtop target="#bookMarkContent" :showHeight="100" :bottom="30" position="absolute"></lay-backtop>
  </lay-layout>
</template>

<script>
import {onMounted, nextTick, ref, watch, reactive} from 'vue';
import {useRouter, useRoute} from "vue-router";
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import {useArticleStore} from '@/store/article'

export default {
  components: { MarkdownRenderer},
  setup() {
    const articleStore = useArticleStore();
    const loading = ref(false);
    const dataList = ref([]);
    const curData = ref({});

    const changeMd = function () {
      const num = Math.floor(Math.random() * 10);
      curData.value.content = `
::: anchor
:::

::: title 基本介绍
:::
# Hello, Markdown!\nThis is a **Markdown** example.
- Item `+num+`
- Item 2
- Item 3

::: spoiler click me
*content*
:::

::: button primary
这是一个按钮
:::

\`\`\`javascript
console.log('Hello, World!');
\`\`\``;
    };

    const initPage = async function () {
      // dataSource.value = await getWeTabSidMenus();
      dataList.value = articleStore.articleInfo.dataList;
      curData.value = articleStore.articleInfo.curData;
      curData.value.content = `# Hello, Markdown!

This is a **Markdown** example.

- Item 1
- Item 2
- Item 3

\`\`\`javascript
console.log('Hello, World!');
\`\`\``;
    };
    onMounted(() => {
      initPage()
    })

    return {
      dataList,
      curData,
      changeMd
    }
  }
}
</script>
<style>
</style>
