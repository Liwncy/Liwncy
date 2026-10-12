<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchBookmarks, linkHost, type BookmarkCategory } from '../../api/bookmark'
import '../../styles/bookmark.css'

const categories = ref<BookmarkCategory[]>([])
const categoryId = ref('all')
const query = ref('')
const status = ref('加载中')

const categoryName = computed(() => {
  if (categoryId.value === 'all') return '全部'
  return categories.value.find((category) => category.id === categoryId.value)?.name ?? '全部'
})

const visibleLinks = computed(() => {
  const source =
    categoryId.value === 'all'
      ? categories.value.flatMap((category) => category.links)
      : (categories.value.find((category) => category.id === categoryId.value)?.links ?? [])
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return source
  return source.filter((link) =>
    `${link.title} ${link.description} ${link.url}`.toLowerCase().includes(keyword),
  )
})

const emptyText = computed(() => {
  if (query.value.trim()) return `没有和「${query.value.trim()}」相符的书签。`
  return '这个分类还没有书签。'
})

onMounted(async () => {
  try {
    categories.value = await fetchBookmarks()
    status.value = ''
  } catch (error) {
    status.value = error instanceof Error ? error.message : '书签加载失败'
  }
})

function selectCategory(id: string) {
  categoryId.value = id
  query.value = ''
}
</script>

<template>
  <div class="bookmark">
    <nav class="bookmark-rail" aria-label="书签分类">
      <button type="button" :aria-current="categoryId === 'all'" @click="selectCategory('all')">全部</button>
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :aria-current="categoryId === category.id"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </nav>

    <section class="bookmark-main">
      <h1>{{ categoryName }}</h1>
      <input v-model="query" class="bookmark-search" type="search" placeholder="搜索标题或描述" />
      <p v-if="status" class="bookmark-status" role="status">{{ status }}</p>
      <p v-else-if="visibleLinks.length === 0" class="bookmark-status">{{ emptyText }}</p>
      <ul v-else class="bookmark-list">
        <li v-for="link in visibleLinks" :key="link.id">
          <a class="bookmark-card" :href="link.url" target="_blank" rel="noopener noreferrer">
            <strong>{{ link.title }}</strong>
            <span class="bookmark-host">{{ linkHost(link.url) }}</span>
            <p v-if="link.description">{{ link.description }}</p>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>
