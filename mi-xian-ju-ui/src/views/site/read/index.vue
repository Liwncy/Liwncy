<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownView from '@/components/MarkdownView.vue'
import { useArticleStore } from '@/store/article'
import type { Article } from '@/types/article'

const router = useRouter()
const articleStore = useArticleStore()

const dataList = ref<Article[]>([])
const curData = ref<Article>({ id: 0, title: '' })
const selectedKey = computed(() => curData.value.id)

function handleClick(article: Article) {
  curData.value = article
}

onMounted(() => {
  const info = articleStore.articleInfo
  if (!info.dataList?.length || !info.curData) {
    router.replace({ name: 'Notes' })
    return
  }
  dataList.value = info.dataList
  curData.value = info.curData
})
</script>

<template>
  <lay-layout class="example" style="--sidebar-width: 200px">
    <lay-side class="layui-menu-ref-2 no-scrollbar">
      <lay-container :fluid="true" style="padding: 0">
        <lay-scroll style="overflow-y: scroll">
          <ul class="layui-menu layui-menu-lg layui-menu-docs">
            <li
              v-for="item in dataList"
              :key="item.id"
              :class="{ 'layui-menu-item-checked2': selectedKey === item.id }"
              @click="handleClick(item)"
            >
              <div class="layui-menu-body-title">
                <a href="javascript:void(0)">
                  <span>{{ item.title }}</span>
                  <span v-if="item.date" class="layui-font-12 layui-font-gray">{{ item.date }}</span>
                </a>
              </div>
            </li>
          </ul>
          <hr />
        </lay-scroll>
      </lay-container>
    </lay-side>

    <lay-body id="readContent">
      <lay-container :fluid="true" class="layui-text read-container">
        <header class="read-header">
          <h1>{{ curData.title }}</h1>
          <p v-if="curData.author || curData.date" class="read-meta">
            <span v-if="curData.author">作者：{{ curData.author }}</span>
            <span v-if="curData.date"> · {{ curData.date }}</span>
          </p>
        </header>
        <MarkdownView :content="curData.content" />
      </lay-container>
    </lay-body>

    <lay-backtop target="#readContent" :showHeight="100" :bottom="30" position="absolute" />
  </lay-layout>
</template>

<style scoped>
.read-container {
  padding: 10px;
  max-width: 900px;
}

.read-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.read-meta {
  margin: 0 0 24px;
  color: #888;
  font-size: 14px;
}
</style>
