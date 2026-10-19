<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchTrends, type TrendBoard, type TrendItem } from '../../api/trends'
import PageFrame from '../../layout/PageFrame.vue'
import { HaloSearch } from '@/components/shadcn/halo-search'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select'
import TrendRow from './TrendRow.vue'
import '../../styles/trends.css'

const boards = ref<TrendBoard[]>([])
const platform = ref('all')
const query = ref('')
const status = ref('加载中')

const keyword = computed(() => query.value.trim().toLowerCase())

const selectedBoards = computed(() => {
  if (platform.value === 'all') return boards.value
  return boards.value.filter((board) => board.platform === platform.value)
})

const boardName = computed(() => {
  if (platform.value === 'all') return '全部'
  return boards.value.find((board) => board.platform === platform.value)?.name ?? '全部'
})

const updatedLabel = computed(() => {
  const times = selectedBoards.value.map((board) => board.updatedAt)
  if (times.length === 0) return '—'
  return formatClock(Math.max(...times))
})

const rows = computed(() =>
  selectedBoards.value.flatMap((board) =>
    board.items.filter(matches).map((item) => ({ ...item, boardName: board.name })),
  ),
)

const emptyText = computed(() => {
  if (keyword.value) return `没有和「${query.value.trim()}」相符的热榜。`
  return '这榜现在是空的。'
})

function matches(item: TrendItem) {
  if (!keyword.value) return true
  return `${item.title} ${item.detail ?? ''}`.toLowerCase().includes(keyword.value)
}

function formatClock(ms: number) {
  const date = new Date(ms)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function selectPlatform(id: string) {
  platform.value = id
  query.value = ''
}

function onPlatform(value: unknown) {
  if (typeof value === 'string') selectPlatform(value)
}

onMounted(async () => {
  try {
    const result = await fetchTrends()
    boards.value = result.boards
    status.value = ''
  } catch (error) {
    status.value = error instanceof Error ? error.message : '热榜没读出来'
  }
})
</script>

<template>
  <PageFrame>
    <template #menu>
      <div class="trend-brand">
        <strong>人间热榜</strong>
        <span>看一眼外面</span>
      </div>
      <nav class="trend-cats" aria-label="热榜平台">
        <p>热榜总览</p>
        <button type="button" :aria-current="platform === 'all'" @click="selectPlatform('all')">
          全部
        </button>
        <p>平台</p>
        <button
          v-for="board in boards"
          :key="board.platform"
          type="button"
          :aria-current="platform === board.platform"
          @click="selectPlatform(board.platform)"
        >
          {{ board.name }}
        </button>
      </nav>
    </template>

    <section class="trend">
      <header class="trend-summary">
        <div>
          <h1>今日热榜</h1>
          <p>知乎、百度、哔哩哔哩、头条、抖音的最新一榜</p>
        </div>
        <dl>
          <div>
            <dt>当前榜</dt>
            <dd>{{ boardName }}</dd>
          </div>
          <div>
            <dt>可见条数</dt>
            <dd>{{ rows.length }}</dd>
          </div>
          <div>
            <dt>更新于</dt>
            <dd>{{ updatedLabel }}</dd>
          </div>
        </dl>
      </header>

      <div class="trend-tools">
        <Select :model-value="platform" @update:model-value="onPlatform">
          <SelectTrigger aria-label="平台">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem v-for="board in boards" :key="board.platform" :value="board.platform">
              {{ board.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <HaloSearch v-model="query" placeholder="搜索标题" label="搜索热榜" />
      </div>

      <p v-if="status" class="trend-status" role="status">{{ status }}</p>
      <p v-else-if="rows.length === 0" class="trend-status">{{ emptyText }}</p>
      <ol v-else class="trend-list">
        <li v-for="item in rows" :key="`${item.boardName}-${item.id}`">
          <a
            v-if="item.url"
            class="trend-row"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TrendRow :item="item" :show-board="platform === 'all'" />
          </a>
          <div v-else class="trend-row">
            <TrendRow :item="item" :show-board="platform === 'all'" />
          </div>
        </li>
      </ol>
    </section>
  </PageFrame>
</template>
