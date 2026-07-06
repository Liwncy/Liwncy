import { computed, onMounted, onUnmounted, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import XGPlayer from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import { fetchLiteVideoMenus } from '@/api/lite-video'
import { fetchVideo, getMenuFunctionCategory } from '@/api/functions'
import type { MenuNode } from '@/types/menu'

export function useLiteVideo() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('')
  const currentMenu = ref<MenuNode>({ id: '', title: '' })
  const isMenuVisible = ref(true)
  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))

  const xgPlayerRef = ref<HTMLElement | null>(null)
  let xgPlayer: XGPlayer | null = null

  const videoUrl = ref('')
  const loading = ref(false)
  const errorMessage = ref('')
  let requestSeq = 0
  const videoStats = ref({
    playCount: 0,
    resolution: '1080p',
    duration: '00:00',
    loadProgress: 0,
  })

  const menuDescription = computed(() => {
    const desc = currentMenu.value.payload?.description
    return typeof desc === 'string' && desc ? desc : '选择左侧视频源，随机播放'
  })

  const recentSources = computed(() => {
    if (!currentMenu.value.id) return []
    for (const group of menus.value) {
      if (!group.children?.some((child) => child.id === currentMenu.value.id)) continue
      const siblings = group.children
        .filter((child) => child.id !== currentMenu.value.id)
        .sort(() => Math.random() - 0.5)
      return siblings.slice(0, 6)
    }
    return []
  })

  function getSourceIcon(index: number) {
    const icons = ['🎬', '📺', '🎥', '📹', '🎞️', '📼', '🎙️', '🎧']
    return icons[index % icons.length]
  }

  function destroyPlayer() {
    if (xgPlayer) {
      xgPlayer.destroy()
      xgPlayer = null
    }
  }

  function initPlayer() {
    if (!xgPlayerRef.value || !videoUrl.value) return
    destroyPlayer()
    errorMessage.value = ''

    xgPlayer = new XGPlayer({
      el: xgPlayerRef.value,
      url: videoUrl.value,
      controls: true,
      autoplay: true,
      playbackRate: [0.5, 1, 1.5, 2],
      volume: 0.7,
      lang: 'zh-cn',
      fluid: true,
      height: 400,
    })

    xgPlayer.on('play', () => {
      loading.value = false
      videoStats.value.playCount += 1
    })

    xgPlayer.on('loadeddata', () => {
      loading.value = false
    })

    xgPlayer.on('error', () => {
      loading.value = false
      errorMessage.value = '视频播放失败，请换一个视频或稍后重试。'
    })

    xgPlayer.on('timeupdate', () => {
      if (!xgPlayer?.duration) return
      const duration = Math.floor(xgPlayer.duration)
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      videoStats.value.duration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

      if (xgPlayer.buffered.length > 0) {
        const bufferedEnd = xgPlayer.buffered.end(xgPlayer.buffered.length - 1)
        videoStats.value.loadProgress = Math.floor((bufferedEnd / xgPlayer.duration) * 100)
      }
    })

    xgPlayer.on('loadedmetadata', () => {
      const video = xgPlayer?.media as HTMLVideoElement | undefined
      const width = video?.videoWidth ?? 0
      if (width >= 1920) videoStats.value.resolution = '1080p'
      else if (width >= 1280) videoStats.value.resolution = '720p'
      else if (width > 0) videoStats.value.resolution = '480p'
    })
  }

  async function resolveVideoUrl(menu: MenuNode) {
    const category = getMenuFunctionCategory(menu)
    if (!category) return ''
    const res = await fetchVideo(category)
    return res.data?.data.url ?? ''
  }

  async function loadVideo() {
    const category = getMenuFunctionCategory(currentMenu.value)
    if (!category) {
      errorMessage.value = '当前视频源未配置 API 分类。'
      return false
    }

    const seq = ++requestSeq
    loading.value = true
    errorMessage.value = ''
    try {
      const url = await resolveVideoUrl(currentMenu.value)
      if (seq !== requestSeq) return false
      if (!url) {
        destroyPlayer()
        videoUrl.value = ''
        errorMessage.value = '接口没有返回可播放的视频地址，请换一个视频源。'
        return false
      }
      videoUrl.value = url
      initPlayer()
      return true
    } catch {
      if (seq === requestSeq) {
        destroyPlayer()
        videoUrl.value = ''
        errorMessage.value = '视频获取失败，请检查网络或接口状态。'
      }
      return false
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  async function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    videoStats.value = { playCount: 0, resolution: '1080p', duration: '00:00', loadProgress: 0 }
    await loadVideo()
  }

  async function refreshVideo() {
    const ok = await loadVideo()
    if (!ok) layer.msg(errorMessage.value || '视频刷新失败', { icon: 2 })
  }

  async function initPage() {
    const res = await fetchLiteVideoMenus()
    menus.value = res.data ?? []
    const firstChild = menus.value[0]?.children?.[0]
    if (firstChild) await handleMenuClick(firstChild)
  }

  onMounted(initPage)
  onUnmounted(destroyPlayer)

  return {
    menus,
    currentPath,
    currentMenu,
    menuDescription,
    isMenuVisible,
    menuVisible,
    xgPlayerRef,
    loading,
    errorMessage,
    videoStats,
    recentSources,
    getSourceIcon,
    handleMenuClick,
    refreshVideo,
  }
}
