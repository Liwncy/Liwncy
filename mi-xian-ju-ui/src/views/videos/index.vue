<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchVideo, fetchVideoMenus, type VideoGroup, type VideoResult } from '../../api/videos'
import PageFrame from '../../layout/PageFrame.vue'
import '../../styles/videos.css'

const groups = ref<VideoGroup[]>([])
const sourceId = ref('')
const video = ref<VideoResult | null>(null)
const status = ref('')
const loading = ref(false)
const playCount = ref(0)
const resolution = ref('—')
const duration = ref('00:00')
const progress = ref(0)
let requestSeq = 0

const sources = computed(() => groups.value.flatMap((group) => group.items))
const others = computed(() => sources.value.filter((item) => item.id !== sourceId.value).slice(0, 6))

function sourceTitle(id: string) {
  return sources.value.find((item) => item.id === id)?.title ?? '勾栏听曲'
}

async function loadVideo(id = sourceId.value) {
  if (!id) return
  const seq = ++requestSeq
  loading.value = true
  status.value = ''
  progress.value = 0
  duration.value = '00:00'
  resolution.value = '—'
  try {
    const next = await fetchVideo(id)
    if (seq !== requestSeq) return
    video.value = next
  } catch (error) {
    if (seq !== requestSeq) return
    video.value = null
    status.value = error instanceof Error ? error.message : '这支没取到，再试下'
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

function selectSource(id: string) {
  sourceId.value = id
  playCount.value = 0
  void loadVideo(id)
}

function onPlay() {
  playCount.value += 1
}

function onMeta(event: Event) {
  const media = event.target as HTMLVideoElement
  const width = media.videoWidth
  if (width >= 1920) resolution.value = '1080p'
  else if (width >= 1280) resolution.value = '720p'
  else if (width > 0) resolution.value = '480p'
  duration.value = formatDuration(media.duration)
}

function onProgress(event: Event) {
  const media = event.target as HTMLVideoElement
  if (!media.duration || media.buffered.length === 0) return
  const end = media.buffered.end(media.buffered.length - 1)
  progress.value = Math.min(100, Math.floor((end / media.duration) * 100))
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return '00:00'
  const total = Math.floor(seconds)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    groups.value = await fetchVideoMenus()
    sourceId.value = sources.value[0]?.id ?? ''
  } catch (error) {
    status.value = error instanceof Error ? error.message : '视频源没读出来'
    return
  }
  await loadVideo(sourceId.value)
})
</script>

<template>
  <PageFrame>
    <template #menu>
      <div class="video-brand">
        <strong>勾栏听曲</strong>
        <span>选一个视频源</span>
      </div>
      <nav class="video-cats" aria-label="视频源">
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

    <section class="video-page">
      <div class="video-view">
        <header class="video-summary">
          <h1>{{ video?.title || sourceTitle(sourceId) }}</h1>
        </header>
        <p v-if="status" class="video-status" role="status">{{ status }}</p>
        <div v-if="video" class="video-frame">
          <video
            :key="video.url"
            :src="video.url"
            controls
            autoplay
            playsinline
            @play="onPlay"
            @loadedmetadata="onMeta"
            @progress="onProgress"
            @timeupdate="onProgress"
          />
        </div>
      </div>

      <aside class="video-side">
        <section class="video-card">
          <h2>视频源信息</h2>
          <dl>
            <div>
              <dt>视频源</dt>
              <dd>{{ sourceTitle(sourceId) }}</dd>
            </div>
            <div>
              <dt>播放次数</dt>
              <dd>{{ playCount }}</dd>
            </div>
            <div>
              <dt>分辨率</dt>
              <dd>{{ resolution }}</dd>
            </div>
            <div>
              <dt>视频时长</dt>
              <dd>{{ duration }}</dd>
            </div>
          </dl>
          <div class="video-progress">
            <span>加载 {{ progress }}%</span>
            <i><b :style="{ width: `${progress}%` }" /></i>
          </div>
          <button type="button" class="video-next" :disabled="loading || !sourceId" @click="loadVideo()">
            换一个视频
          </button>
        </section>
        <section v-if="others.length" class="video-card">
          <h2>猜你喜欢</h2>
          <div class="video-more">
            <button v-for="item in others" :key="item.id" type="button" @click="selectSource(item.id)">
              {{ item.title }}
            </button>
          </div>
        </section>
      </aside>
    </section>
  </PageFrame>
</template>
