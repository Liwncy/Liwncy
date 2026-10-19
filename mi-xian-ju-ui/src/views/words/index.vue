<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchWord, fetchWordMenus, type WordGroup, type WordResult } from '../../api/words'
import PageFrame from '../../layout/PageFrame.vue'
import '../../styles/words.css'

const groups = ref<WordGroup[]>([])
const sourceId = ref('')
const word = ref<WordResult | null>(null)
const status = ref('')
const loading = ref(false)
const copied = ref(false)
let requestSeq = 0
let copyTimer = 0

const sources = computed(() => groups.value.flatMap((group) => group.items))

function sourceTitle(id: string) {
  return sources.value.find((item) => item.id === id)?.title ?? '吟诗作对'
}

async function loadWord(id = sourceId.value) {
  if (!id) return
  const seq = ++requestSeq
  loading.value = true
  status.value = ''
  copied.value = false
  try {
    const next = await fetchWord(id)
    if (seq !== requestSeq) return
    word.value = next
  } catch (error) {
    if (seq !== requestSeq) return
    word.value = null
    status.value = error instanceof Error ? error.message : '这句没取到，再试下'
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

function selectSource(id: string) {
  sourceId.value = id
  void loadWord(id)
}

async function copyWord() {
  const text = word.value?.lines.join('\n') ?? ''
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch {
    status.value = '没复制上，自己选一下'
  }
}

onMounted(async () => {
  try {
    groups.value = await fetchWordMenus()
    sourceId.value = sources.value[0]?.id ?? ''
  } catch (error) {
    status.value = error instanceof Error ? error.message : '文案没读出来'
    return
  }
  await loadWord(sourceId.value)
})
</script>

<template>
  <PageFrame>
    <template #menu>
      <div class="word-brand">
        <strong>吟诗作对</strong>
        <span>选一类文案</span>
      </div>
      <nav class="word-cats" aria-label="文案">
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

    <section class="word-page">
      <header class="word-summary">
        <h1>{{ word?.title || sourceTitle(sourceId) }}</h1>
      </header>
      <div class="word-body">
        <p v-for="(line, index) in word?.lines ?? []" :key="index">{{ line }}</p>
      </div>
      <p v-if="status" class="word-status" role="status">{{ status }}</p>
      <div class="word-actions">
        <button type="button" class="word-copy" :disabled="!word" :data-copied="copied" @click="copyWord">
          {{ copied ? '已复制' : '复制文案' }}
        </button>
        <button type="button" class="word-again" :disabled="loading || !sourceId" @click="loadWord()">再来一条</button>
      </div>
    </section>
  </PageFrame>
</template>
