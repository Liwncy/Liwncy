<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const cubism4Core = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
const cubism2Core = 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.1/dist/live2d.min.js'
const modelRepo = 'Liwncy/live2d-model'
const modelCdn = `https://cdn.jsdelivr.net/gh/${modelRepo}`
const apiBase = 'https://xbot.lwcfworker.dpdns.org'
const userKey = 'mi-xian-ju-live2d-user'
const modelKey = 'mi-xian-ju-live2d-model'
const hiddenKey = 'mi-xian-ju-live2d-hidden'

const host = ref<HTMLCanvasElement | null>(null)
const talkInput = ref<HTMLTextAreaElement | null>(null)
const visible = ref(true)
const parked = ref(localStorage.getItem(hiddenKey) === '1')
const active = ref(false)
const talking = ref(false)
const draft = ref('')
const pending = ref(false)
const status = ref('')
const lines = ref<string[]>([])
const media = ref<WebReply[]>([])

let alive = true
let destroyApp: (() => void) | null = null
let stopTracking: (() => void) | null = null
let stopMouth: (() => void) | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let talkGeneration = 0
let loadGeneration = 0
let modelApi: Live2DHandle | null = null
let stage: Stage | null = null
let catalog: CatalogModel[] = []
let modelIndex = 0
let cubism2Factory: ModelFactory | null = null
let cubism4Factory: ModelFactory | null = null
let pixiTicker: unknown = null
let parkTimer: ReturnType<typeof setTimeout> | null = null

const iconComment = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l.3-.3c.3-.3.7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/></svg>'
const iconPerson = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 64A64 64 0 1 0 192 64a64 64 0 1 0 128 0zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32v-48c0-35.3-28.7-64-64-64h-64zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z"/></svg>'
const iconClose = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z"/></svg>'
const iconChild = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M96 64a64 64 0 1 1 128 0A64 64 0 1 1 96 64zm48 320v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V287.8L59.1 321c-9.4 15-29.2 19.4-44.1 10S-4.5 301.9 4.9 287l39.9-63.3C69.7 184 113.2 160 160 160s90.3 24 115.2 63.6L315.1 287c9.4 15 4.9 34.7-10 44.1s-34.7 4.9-44.1-10L240 287.8V480c0 17.7-14.3 32-32 32s-32-14.3-32-32v-96h-32z"/></svg>'

const bubbleOpen = computed(() => talking.value || pending.value || Boolean(status.value) || lines.value.length > 0 || media.value.length > 0)

type WebReply = {
  type?: string
  content?: string
  url?: string
  title?: string
  desc?: string
  thumbUrl?: string
}

type CatalogModel = {
  id: string
  name: string
  cubismVersion: number
  url: string
  entry: string
}

type Live2DHandle = {
  motion: (group: string) => unknown
  hitTest: (x: number, y: number) => string[]
  focus: (x: number, y: number) => void
  destroy: () => void
  scale: { set: (value: number) => void }
  anchor: { set: (x: number, y: number) => void }
  x: number
  y: number
  internalModel?: {
    width: number
    height: number
    coreModel?: {
      setParameterValueById?: (id: string, value: number) => void
      setParamFloat?: (id: string, value: number) => void
    }
  }
}

type ModelFactory = {
  registerTicker: (ticker: unknown) => void
  from: (url: string, options: { autoInteract: boolean }) => Promise<Live2DHandle>
}

type Stage = {
  stage: { addChild: (child: Live2DHandle) => void; removeChild: (child: Live2DHandle) => void }
  destroy: (removeView?: boolean, options?: object) => void
}

type Tool = {
  id: string
  label: string
  icon: string
  run: () => void
}

const tools: Tool[] = [
  { id: 'chat', label: '对话', icon: iconComment, run: openChat },
  { id: 'switch-model', label: '换模型', icon: iconPerson, run: () => void nextModel() },
  { id: 'quit', label: '关闭', icon: iconClose, run: hideHer },
]

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing?.dataset.loaded === 'true') {
      resolve()
      return
    }
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('核心没载入')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error('核心没载入'))
    document.head.appendChild(script)
  })
}

function userId() {
  const saved = localStorage.getItem(userKey)
  if (saved && /^[\w-]{1,64}$/.test(saved)) return saved
  const next = `mj-${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
  localStorage.setItem(userKey, next)
  return next
}

function setMouth(value: number) {
  const core = modelApi?.internalModel?.coreModel
  core?.setParameterValueById?.('ParamMouthOpenY', value)
  core?.setParamFloat?.('PARAM_MOUTH_OPEN_Y', value)
}

function talkMotion() {
  void modelApi?.motion('TapBody')
}

function speakFor(ms: number) {
  stopMouth?.()
  const started = performance.now()
  let frame = 0
  const tick = () => {
    const t = performance.now() - started
    if (t >= ms) {
      setMouth(0)
      stopMouth = null
      return
    }
    setMouth(0.15 + Math.abs(Math.sin(t / 90)) * 0.75)
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  stopMouth = () => {
    cancelAnimationFrame(frame)
    setMouth(0)
  }
}

function stopHideTimer() {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = null
}

function hideLater(ms: number) {
  stopHideTimer()
  hideTimer = setTimeout(() => {
    if (pending.value) return
    lines.value = []
    media.value = []
    status.value = ''
    talking.value = false
  }, ms)
}

function say(text: string, ms = 4000) {
  lines.value = [text]
  media.value = []
  status.value = ''
  hideLater(ms)
}

function focusDraft() {
  void nextTick(() => {
    fitDraft()
    talkInput.value?.focus()
  })
}

function openChat() {
  stopHideTimer()
  talking.value = true
  focusDraft()
}

function showReplies(replies: WebReply[]) {
  const visibleReplies = replies.filter((reply) => replyText(reply) || reply.url)
  if (!visibleReplies.length) return
  lines.value = visibleReplies
    .filter((reply) => reply.type === 'text')
    .map((reply) => reply.content?.trim() || '')
    .filter(Boolean)
  media.value = visibleReplies.filter((reply) => reply.type !== 'text')
  status.value = ''
  talking.value = true
  const length = lines.value.reduce((sum, line) => sum + line.length, 0) || visibleReplies.length * 12
  hideLater(Math.min(12000, Math.max(4500, length * 160)))
  talkMotion()
  const voice = visibleReplies.find((reply) => reply.type === 'voice' && reply.url)
  if (voice?.url) {
    void playVoice(voice.url)
    return
  }
  speakFor(2400)
}

function replyText(reply: WebReply) {
  if (reply.type === 'text') return reply.content?.trim() || ''
  if (reply.type === 'link' || reply.type === 'music') return reply.title?.trim() || reply.url || ''
  return ''
}

async function playVoice(url: string) {
  stopMouth?.()
  const audio = new Audio(url)
  audio.crossOrigin = 'anonymous'
  try {
    const context = new AudioContext()
    const source = context.createMediaElementSource(audio)
    const analyser = context.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyser.connect(context.destination)
    const data = new Uint8Array(analyser.fftSize)
    let frame = 0
    const pump = () => {
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (const sample of data) {
        const centered = (sample - 128) / 128
        sum += centered * centered
      }
      setMouth(Math.min(1, Math.sqrt(sum / data.length) * 6))
      if (!audio.paused && !audio.ended) frame = requestAnimationFrame(pump)
      else setMouth(0)
    }
    stopMouth = () => {
      cancelAnimationFrame(frame)
      audio.pause()
      void context.close()
      setMouth(0)
    }
    await audio.play()
    pump()
  } catch {
    speakFor(2400)
    try {
      await audio.play()
    } catch {
      status.value = '语音没播出来'
    }
  }
}

async function latestSeq() {
  const response = await fetch(`${apiBase}/adapter/web/replies?userId=${encodeURIComponent(userId())}&after=0`)
  if (!response.ok) return 0
  const data = await response.json() as { latest?: number }
  return typeof data.latest === 'number' ? data.latest : 0
}

function stopWaiting() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
}

function waitForReplies(after: number, generation: number) {
  stopWaiting()
  let tries = 0
  pollTimer = setInterval(() => {
    tries += 1
    void (async () => {
      if (generation !== talkGeneration) return
      if (tries > 90) {
        stopWaiting()
        if (!lines.value.length && !media.value.length) {
          status.value = '她还没说完'
          hideLater(4000)
        }
        pending.value = false
        return
      }
      try {
        const response = await fetch(`${apiBase}/adapter/web/replies?userId=${encodeURIComponent(userId())}&after=${after}`)
        if (generation !== talkGeneration) return
        if (!response.ok) return
        const data = await response.json() as { replies?: { reply: WebReply }[] }
        const replies = (data.replies ?? []).map((item) => item.reply)
        if (!replies.length) return
        stopWaiting()
        pending.value = false
        showReplies(replies)
      } catch {
        // 下一轮再取
      }
    })()
  }, 1000)
}

function fitDraft() {
  const field = talkInput.value
  if (!field) return
  field.style.height = 'auto'
  field.style.height = `${Math.min(field.scrollHeight, 96)}px`
}

function onDraftKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  void send()
}

async function send() {
  const content = draft.value.trim()
  if (!content || pending.value) return
  const generation = ++talkGeneration
  pending.value = true
  stopHideTimer()
  status.value = '她在想…'
  lines.value = []
  media.value = []
  draft.value = ''
  void nextTick(fitDraft)
  const after = await latestSeq().catch(() => 0)
  if (generation !== talkGeneration) return
  waitForReplies(after, generation)
  try {
    const response = await fetch(`${apiBase}/adapter/web/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId(), userName: '芈仙居', content }),
    })
    if (generation !== talkGeneration || lines.value.length || media.value.length) return
    const data = await response.json() as { error?: string; handled?: boolean; replies?: WebReply[] }
    if (!response.ok) {
      stopWaiting()
      draft.value = content
      status.value = data.error || '没送出去'
      pending.value = false
      hideLater(4000)
      return
    }
    if (data.replies?.length) {
      stopWaiting()
      pending.value = false
      showReplies(data.replies)
      return
    }
    if (!data.handled) {
      stopWaiting()
      status.value = '她没接上'
      pending.value = false
      hideLater(4000)
    }
  } catch {
    if (generation !== talkGeneration || lines.value.length || media.value.length) return
    draft.value = content
    status.value = '没送出去'
    pending.value = false
    hideLater(4000)
    stopWaiting()
  }
}

async function factoryFor(version: number) {
  if (!pixiTicker) throw new Error('画面还没准备好')
  if (version <= 2) {
    await loadScript(cubism2Core)
    if (!cubism2Factory) {
      const mod = await import('pixi-live2d-display/cubism2')
      mod.Live2DModel.registerTicker(pixiTicker as never)
      cubism2Factory = mod.Live2DModel
    }
    return cubism2Factory
  }
  await loadScript(cubism4Core)
  if (!cubism4Factory) {
    const mod = await import('pixi-live2d-display/cubism4')
    mod.Live2DModel.registerTicker(pixiTicker as never)
    cubism4Factory = mod.Live2DModel
  }
  return cubism4Factory
}

function fitModel(model: Live2DHandle) {
  const canvas = host.value
  const width = canvas?.clientWidth || 300
  const height = canvas?.clientHeight || 300
  const baseWidth = model.internalModel?.width
  const baseHeight = model.internalModel?.height
  if (!baseWidth || !baseHeight) throw new Error('模型尺寸无效')
  model.scale.set(Math.min(width / baseWidth, height / baseHeight))
  model.anchor.set(0.5, 1)
  model.x = width / 2
  model.y = height
}

async function placeModel(entry: CatalogModel) {
  const app = stage
  if (!app) return false
  const generation = ++loadGeneration
  const url = entry.url
  let model: Live2DHandle | null = null
  try {
    const factory = await factoryFor(entry.cubismVersion)
    model = await factory.from(url, { autoInteract: false })
    if (!alive || generation !== loadGeneration) {
      model.destroy()
      return false
    }
    fitModel(model)
    app.stage.addChild(model)
    const previous = modelApi
    modelApi = model
    if (previous) {
      app.stage.removeChild(previous)
      previous.destroy()
    }
    return true
  } catch (error) {
    if (model && model !== modelApi) model.destroy()
    console.error(error)
    return false
  }
}

async function latestModelRef() {
  try {
    const response = await fetch(`https://api.github.com/repos/${modelRepo}/commits/main`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!response.ok) return 'main'
    const data = await response.json() as { sha?: string }
    return data.sha || 'main'
  } catch {
    return 'main'
  }
}

async function loadCatalog() {
  const ref = await latestModelRef()
  const response = await fetch(`${modelCdn}@${ref}/index.json`)
  if (!response.ok) throw new Error('模型名单没取到')
  const data = await response.json() as { models?: CatalogModel[] }
  return (data.models ?? []).filter((model) => model.id && model.url && typeof model.cubismVersion === 'number').map((model) => ({
    ...model,
    url: model.url.replace('@main/', `@${ref}/`),
  }))
}

async function nextModel() {
  if (!catalog.length) {
    try {
      catalog = await loadCatalog()
    } catch (error) {
      console.error(error)
      say('模型名单没取到')
      return
    }
  }
  if (catalog.length < 2) {
    say('没有别人了')
    return
  }
  const previous = modelIndex
  modelIndex = (modelIndex + 1) % catalog.length
  const entry = catalog[modelIndex]
  const ok = await placeModel(entry)
  if (!ok) {
    modelIndex = previous
    say('没换成')
    return
  }
  localStorage.setItem(modelKey, entry.id)
  say(entry.name)
}

function hideHer() {
  active.value = false
  talking.value = false
  stopHideTimer()
  localStorage.setItem(hiddenKey, '1')
  if (parkTimer) clearTimeout(parkTimer)
  parkTimer = setTimeout(() => {
    parked.value = true
  }, 3000)
}

function showHer() {
  if (parkTimer) clearTimeout(parkTimer)
  parked.value = false
  localStorage.removeItem(hiddenKey)
  requestAnimationFrame(() => {
    active.value = true
  })
}

onMounted(async () => {
  const canvas = host.value
  if (!canvas) return
  try {
    const PIXI = await import('pixi.js')
    ;(window as Window & { PIXI: typeof PIXI }).PIXI = PIXI
    pixiTicker = PIXI.Ticker
    const width = canvas.clientWidth || 300
    const height = canvas.clientHeight || 300
    const app = new PIXI.Application({
      view: canvas,
      backgroundAlpha: 0,
      width,
      height,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })
    stage = app
    const pointOnHer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('.live2d-bubble, .live2d-tools, .live2d-toggle')) return false
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return false
      return (modelApi?.hitTest(x, y).length ?? 0) > 0
    }
    const track = (event: PointerEvent) => {
      if (!modelApi || parked.value) return
      const rect = canvas.getBoundingClientRect()
      modelApi.focus(event.clientX - rect.left, event.clientY - rect.top)
    }
    const poke = (event: PointerEvent) => {
      if (!pointOnHer(event)) return
      event.preventDefault()
      talkMotion()
    }
    window.addEventListener('pointermove', track)
    window.addEventListener('pointerdown', poke, true)
    stopTracking = () => {
      window.removeEventListener('pointermove', track)
      window.removeEventListener('pointerdown', poke, true)
    }
    destroyApp = () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true })
    }
    if (!parked.value) {
      requestAnimationFrame(() => {
        active.value = true
      })
    }
    catalog = await loadCatalog()
    if (!catalog.length) throw new Error('模型名单是空的')
    const saved = localStorage.getItem(modelKey)
    const found = catalog.findIndex((model) => model.id === saved)
    modelIndex = found >= 0 ? found : 0
    const ok = await placeModel(catalog[modelIndex])
    if (!ok) say('模型没载入')
  } catch (error) {
    console.error(error)
    if (!stage) {
      visible.value = false
      return
    }
    const missingList = error instanceof Error && error.message === '模型名单没取到'
    say(missingList ? error.message : '模型没载入', missingList ? 8000 : 4000)
  }
})

onUnmounted(() => {
  alive = false
  if (parkTimer) clearTimeout(parkTimer)
  if (pollTimer) clearInterval(pollTimer)
  stopHideTimer()
  stopMouth?.()
  stopTracking?.()
  destroyApp?.()
})
</script>

<template>
  <Teleport to="body">
    <button v-if="visible && parked" type="button" class="live2d-toggle" aria-label="叫她出来" @click="showHer">
      <span class="live2d-icon" v-html="iconChild" />
    </button>
    <div v-show="visible" class="live2d-dock" :class="{ 'is-active': active }">
      <div class="live2d-bubble" :class="{ 'is-open': bubbleOpen }">
        <div class="live2d-bubble-body">
          <p v-if="status" class="live2d-status">{{ status }}</p>
          <p v-for="(line, index) in lines" :key="index">{{ line }}</p>
          <template v-for="(reply, index) in media" :key="`media-${index}`">
            <a v-if="(reply.type === 'link' || reply.type === 'music') && reply.url" :href="reply.url" target="_blank" rel="noopener noreferrer">{{ reply.title || reply.url }}</a>
            <img v-else-if="reply.type === 'image' && reply.url" :src="reply.url" alt="" referrerpolicy="no-referrer" />
            <video v-else-if="reply.type === 'video' && reply.url" :src="reply.url" controls />
          </template>
        </div>
        <textarea
          v-if="talking"
          ref="talkInput"
          v-model="draft"
          rows="1"
          placeholder="跟她说一句"
          :disabled="pending"
          @keydown="onDraftKeydown"
          @input="fitDraft"
        />
      </div>
      <canvas ref="host" class="live2d" aria-hidden="true" />
      <div class="live2d-tools">
        <button v-for="tool in tools" :key="tool.id" type="button" :aria-label="tool.label" @click="tool.run">
          <span class="live2d-icon" v-html="tool.icon" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.live2d-dock {
  position: fixed;
  z-index: 60;
  left: 0;
  bottom: -500px;
  width: 300px;
  height: 300px;
  transform: translateY(25px);
  transition: transform 0.3s ease-in-out, bottom 3s ease-in-out;
  pointer-events: none;
}

.live2d-dock.is-active {
  bottom: 0;
}

.live2d-dock:hover {
  transform: translateY(20px);
}

.live2d {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
  pointer-events: auto;
}

.live2d:active {
  cursor: grabbing;
}

.live2d-bubble {
  position: absolute;
  left: 0;
  bottom: 100%;
  width: 250px;
  margin: 0 20px -30px;
  display: flex;
  flex-direction: column;
  max-height: min(320px, 46vh);
  min-height: 70px;
  overflow: hidden;
  padding: 5px 10px;
  border: 1px solid rgba(224, 186, 140, 0.62);
  border-radius: 12px;
  background: rgba(236, 217, 188, 0.5);
  box-shadow: 0 3px 15px 2px rgba(191, 158, 118, 0.2);
  color: #444;
  font-size: 14px;
  line-height: 24px;
  overflow-wrap: break-word;
  opacity: 0;
  pointer-events: none;
  transition: opacity 1s;
}

.live2d-bubble.is-open {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.2s;
}

.live2d-bubble-body {
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(176, 140, 98, 0.45) transparent;
}

.live2d-bubble-body::-webkit-scrollbar {
  width: 4px;
}

.live2d-bubble-body::-webkit-scrollbar-track {
  background: transparent;
}

.live2d-bubble-body::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(176, 140, 98, 0.45);
}

.live2d-bubble p {
  margin: 0;
  white-space: pre-wrap;
}

.live2d-bubble p + p,
.live2d-bubble p + img,
.live2d-bubble p + video,
.live2d-bubble p + a,
.live2d-bubble p + textarea {
  margin-top: 6px;
}

.live2d-status {
  color: #8a6a45;
}

.live2d-bubble img,
.live2d-bubble video {
  display: block;
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.live2d-bubble a {
  color: #0099cc;
  overflow-wrap: anywhere;
}

.live2d-bubble textarea {
  display: block;
  width: 100%;
  min-height: 24px;
  max-height: 96px;
  margin: 6px 0 0;
  padding: 0;
  border: 0;
  resize: none;
  overflow: auto;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 14px;
  line-height: 24px;
}

.live2d-bubble textarea:focus {
  outline: none;
}

.live2d-bubble textarea:disabled {
  opacity: 0.65;
}

.live2d-tools {
  position: absolute;
  right: -10px;
  top: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  opacity: 0;
  pointer-events: auto;
  transition: opacity 1s;
}

.live2d-dock:hover .live2d-tools,
.live2d-tools:focus-within {
  opacity: 1;
}

.live2d-tools button {
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 0;
  cursor: pointer;
}

.live2d-tools :deep(svg) {
  display: block;
  width: 25px;
  height: 25px;
  fill: #7b8c9d;
  transition: fill 0.3s;
}

.live2d-tools button:hover :deep(svg) {
  fill: #0684bd;
}

.live2d-toggle {
  position: fixed;
  z-index: 60;
  left: 0;
  bottom: 66px;
  display: flex;
  justify-content: flex-end;
  width: 60px;
  margin-left: -50px;
  padding: 5px;
  border: 0;
  border-radius: 5px;
  background: #fa0;
  cursor: pointer;
  transition: margin-left 1s;
}

.live2d-toggle:hover {
  margin-left: -30px;
}

.live2d-toggle :deep(svg) {
  display: block;
  width: 25px;
  height: 25px;
  fill: #fff;
}

@media (prefers-reduced-motion: reduce) {
  .live2d-dock,
  .live2d-bubble,
  .live2d-tools,
  .live2d-toggle {
    transition: none;
  }
}
</style>
