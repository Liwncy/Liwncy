<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  fetchBookmarks,
  linkHost,
  type BookmarkCategory,
  type BookmarkLink,
} from '../../api/bookmark'
import PageFrame from '../../layout/PageFrame.vue'
import { HaloSearch } from '@/components/shadcn/halo-search'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select'
import BookmarkCard from './BookmarkCard.vue'
import '../../styles/bookmark.css'

const categories = ref<BookmarkCategory[]>([])
const categoryId = ref('all')
const query = ref('')
const status = ref('加载中')

const keyword = computed(() => query.value.trim().toLowerCase())

const selectedCategories = computed(() => {
  if (categoryId.value === 'all') return categories.value
  return categories.value.filter((category) => category.id === categoryId.value)
})

const categoryName = computed(() => {
  if (categoryId.value === 'all') return '全部'
  return categories.value.find((category) => category.id === categoryId.value)?.name ?? '全部'
})

const totalCount = computed(() =>
  categories.value.reduce((count, category) => count + category.links.length, 0),
)

function matches(link: BookmarkLink) {
  if (!keyword.value) return true
  return `${link.title} ${link.description} ${link.url}`.toLowerCase().includes(keyword.value)
}

const links = computed(() =>
  selectedCategories.value.flatMap((category) =>
    category.links.filter(matches).map((link) => ({ ...link, categoryName: category.name })),
  ),
)

const emptyText = computed(() => {
  if (keyword.value) return `没有和「${query.value.trim()}」相符的书签。`
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

function onCategory(value: unknown) {
  if (typeof value === 'string') selectCategory(value)
}
</script>

<template>
  <PageFrame>
    <template #menu>
      <div class="bookmark-brand">
        <strong>仙居卷轴</strong>
        <span>择一处清闲</span>
      </div>
      <nav class="bookmark-cats" aria-label="书签分类">
        <p>书签总览</p>
        <button type="button" :aria-current="categoryId === 'all'" @click="selectCategory('all')">
          全部
        </button>
        <p>书签分类</p>
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
    </template>

    <section class="bookmark">
      <header class="bookmark-summary">
        <div>
          <h1>常用书签</h1>
          <p>按分类或关键词找到要去的页面</p>
        </div>
        <dl>
          <div>
            <dt>当前分类</dt>
            <dd>{{ categoryName }}</dd>
          </div>
          <div>
            <dt>可见书签</dt>
            <dd>{{ links.length }}</dd>
          </div>
          <div>
            <dt>总收藏</dt>
            <dd>{{ totalCount }}</dd>
          </div>
        </dl>
      </header>

      <div class="bookmark-tools">
        <Select :model-value="categoryId" @update:model-value="onCategory">
          <SelectTrigger aria-label="分类">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <HaloSearch v-model="query" />
      </div>

      <p v-if="status" class="bookmark-status" role="status">{{ status }}</p>
      <p v-else-if="links.length === 0" class="bookmark-status">{{ emptyText }}</p>
      <ul v-else class="bookmark-list">
        <li v-for="link in links" :key="link.id">
          <BookmarkCard
            :href="link.url"
            :title="link.title"
            :host="linkHost(link.url)"
            :description="link.description"
            :avatar="link.avatar"
          />
        </li>
      </ul>
    </section>
  </PageFrame>
</template>
