import { computed, onMounted, onUnmounted, ref } from 'vue'
import XGPlayer from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import { fetchLiteVideoMenus } from '@/api/lite-video'
import { fetchHotVideo, getFunctionCategory } from '@/api/functions'
import type { MenuNode } from '@/types/menu'
import { getMenuApi } from '@/utils/normalize-menu'

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

    xgPlayer.on('error', () => {
      loading.value = false
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

  async function resolveVideoUrl(api: string) {
    const category = getFunctionCategory(api)
    if (!category) return ''
    const res = await fetchHotVideo(category)
    return res.data?.data.url ?? ''
  }

  async function loadVideo() {
    const api = getMenuApi(currentMenu.value)
    if (!api) return

    loading.value = true
    try {
      videoUrl.value = await resolveVideoUrl(api)
      initPlayer()
    } catch {
      loading.value = false
    }
  }

  async function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    videoStats.value = { playCount: 0, resolution: '1080p', duration: '00:00', loadProgress: 0 }
    await loadVideo()
  }

  async function refreshVideo() {
    await loadVideo()
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
    videoStats,
    recentSources,
    getSourceIcon,
    handleMenuClick,
    refreshVideo,
  }
}
