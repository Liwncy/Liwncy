<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchImage, fetchImageMenus, type ImageGroup, type ImageResult } from '../../api/images'
import PageFrame from '../../layout/PageFrame.vue'
import '../../styles/images.css'

type HistoryItem = { url: string; time: string }

const groups = ref<ImageGroup[]>([])
const sourceId = ref('')
const image = ref<ImageResult | null>(null)
const index = ref(0)
const history = ref<HistoryItem[]>([])
const status = ref('')
const loading = ref(false)
const zoom = ref(1)
const rotation = ref(0)
const fitMode = ref<'auto' | 'contain' | 'original'>('auto')
const naturalSize = ref({ width: 0, height: 0 })
let requestSeq = 0

const sources = computed(() => groups.value.flatMap((group) => group.items))
const currentUrl = computed(() => image.value?.urls[index.value] ?? '')
const orientation = computed(() => {
  const { width, height } = naturalSize.value
  if (!width || !height) return '未知'
  if (width > height) return '横屏'
  if (width < height) return '竖屏'
  return '正方形'
})
const imageStyle = computed(() => {
  const transform = `scale(${zoom.value}) rotate(${rotation.value}deg)`
  if (fitMode.value === 'contain') return { transform, width: '100%', height: '100%', objectFit: 'contain' as const }
  if (fitMode.value === 'original') return { transform, width: 'auto', height: 'auto', maxWidth: 'none', maxHeight: 'none' }
  return { transform }
})

function sourceTitle(id: string) {
  return sources.value.find((item) => item.id === id)?.title ?? '走马观花'
}

async function loadImage(id = sourceId.value) {
  if (!id) return
  const seq = ++requestSeq
  loading.value = true
  status.value = ''
  try {
    const next = await fetchImage(id)
    if (seq !== requestSeq) return
    image.value = next
    index.value = 0
    resetView()
    const first = next.urls[0]
    if (first) {
      history.value = [{ url: first, time: formatClock(Date.now()) }, ...history.value].slice(0, 3)
    }
    status.value = ''
  } catch (error) {
    if (seq !== requestSeq) return
    image.value = null
    status.value = error instanceof Error ? error.message : '这张没取到，再试下'
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

function selectSource(id: string) {
  sourceId.value = id
  void loadImage(id)
}

function showHistory(item: HistoryItem) {
  image.value = { title: sourceTitle(sourceId.value), urls: [item.url] }
  index.value = 0
  resetView()
  status.value = ''
}

function resetView() {
  zoom.value = 1
  rotation.value = 0
  fitMode.value = 'auto'
  naturalSize.value = { width: 0, height: 0 }
}

function onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement
  naturalSize.value = { width: img.naturalWidth, height: img.naturalHeight }
}

function zoomIn() {
  zoom.value = Math.min(3, Math.round((zoom.value + 0.1) * 10) / 10)
}

function zoomOut() {
  zoom.value = Math.max(0.3, Math.round((zoom.value - 0.1) * 10) / 10)
}

function rotateImage() {
  rotation.value = (rotation.value + 90) % 360
}

function downloadImage() {
  if (currentUrl.value) window.open(currentUrl.value, '_blank', 'noopener')
}

function formatClock(ms: number) {
  const date = new Date(ms)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    groups.value = await fetchImageMenus()
    sourceId.value = sources.value[0]?.id ?? ''
  } catch (error) {
    status.value = error instanceof Error ? error.message : '图源没读出来'
    return
  }
  await loadImage(sourceId.value)
})
</script>

<template>
  <PageFrame>
    <template #menu>
      <div class="image-brand">
        <strong>走马观花</strong>
        <span>选一个图源</span>
      </div>
      <nav class="image-cats" aria-label="图源">
        <section v-for="group in groups" :key="group.id">
          <p>{{ group.title }}</p>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            :aria-current="sourceId === item.id"
            @click="selectSource(item.id)"
          >
            {{ item.title }}
          </button>
        </section>
      </nav>
    </template>

    <section class="image-page">
      <div class="image-view">
        <header class="image-summary">
          <div>
            <h1>{{ image?.title || sourceTitle(sourceId) }}</h1>
            <p>选左边的图源，换一张看下一张</p>
          </div>
        </header>
        <p v-if="status" class="image-status" role="status">{{ status }}</p>
        <figure v-if="currentUrl" class="image-frame">
          <img :src="currentUrl" :alt="image?.title || '图片'" :style="imageStyle" @load="onImageLoad" />
          <div class="image-toolbar">
            <button type="button" @click="zoomIn">+</button>
            <button type="button" @click="zoomOut">-</button>
            <button type="button" @click="zoom = 1">1:1</button>
            <button type="button" @click="rotateImage">↻</button>
            <span>{{ Math.round(zoom * 100) }}%</span>
          </div>
        </figure>
        <div v-if="image && image.urls.length > 1" class="image-thumbs">
          <button
            v-for="(url, imageIndex) in image.urls"
            :key="url"
            type="button"
            :aria-current="imageIndex === index"
            @click="index = imageIndex"
          >
            <img :src="url" alt="" />
          </button>
        </div>
      </div>

      <aside class="image-side">
        <section class="image-card">
          <h2>图片详情 · {{ sourceTitle(sourceId) }}</h2>
          <dl>
            <div>
              <dt>数量</dt>
              <dd>{{ image?.urls.length ?? 0 }} 张</dd>
            </div>
            <div>
              <dt>显示比例</dt>
              <dd>{{ Math.round(zoom * 100) }}%</dd>
            </div>
            <div>
              <dt>旋转</dt>
              <dd>{{ rotation }}°</dd>
            </div>
            <div>
              <dt>方向</dt>
              <dd>{{ orientation }}</dd>
            </div>
          </dl>
          <div class="image-actions">
            <button type="button" class="image-next" :disabled="loading || !sourceId" @click="loadImage()">
              换一张
            </button>
            <button type="button" class="image-quiet" :disabled="!currentUrl" @click="downloadImage">下载</button>
          </div>
          <div class="image-fits">
            <button type="button" :aria-pressed="fitMode === 'auto'" @click="fitMode = 'auto'">智能</button>
            <button type="button" :aria-pressed="fitMode === 'contain'" @click="fitMode = 'contain'">适应</button>
            <button type="button" :aria-pressed="fitMode === 'original'" @click="fitMode = 'original'">原始</button>
          </div>
        </section>
        <section v-if="history.length" class="image-card">
          <h2>历史记录</h2>
          <div class="image-history">
            <button v-for="item in history" :key="`${item.time}-${item.url}`" type="button" @click="showHistory(item)">
              <img :src="item.url" alt="" />
              <span>{{ item.time }}</span>
            </button>
          </div>
        </section>
      </aside>
    </section>
  </PageFrame>
</template>
