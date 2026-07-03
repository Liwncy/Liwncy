import { computed, nextTick, onMounted, ref } from 'vue'
import { fetchLiteImageMenus } from '@/api/lite-image'
import { fetchRandomImage, getFunctionCategory } from '@/api/functions'
import type { MenuNode } from '@/types/menu'
import { getMenuApi } from '@/utils/normalize-menu'

interface HistoryItem {
  url: string
  time: string
}

export function useLiteImage() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('')
  const currentMenu = ref<MenuNode>({ id: '', title: '' })
  const isMenuVisible = ref(true)
  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))

  const imgUrl = ref<string | string[]>('')
  const currentImageIndex = ref(0)
  const loading = ref(false)
  const zoomLevel = ref(1)
  const rotation = ref(0)
  const fitMode = ref<'auto' | 'contain' | 'fill'>('auto')
  const imageNaturalSize = ref({ width: 0, height: 0 })
  const historyImages = ref<HistoryItem[]>([])
  const imgWrapperRef = ref<HTMLElement | null>(null)

  const currentImageUrl = computed(() => {
    if (Array.isArray(imgUrl.value)) {
      return imgUrl.value[currentImageIndex.value] || ''
    }
    return imgUrl.value
  })

  const imageOrientation = computed(() => {
    const { width, height } = imageNaturalSize.value
    if (!width || !height) return '未知'
    if (width > height) return '横屏'
    if (width < height) return '竖屏'
    return '正方形'
  })

  const autoFitStyle = computed(() => {
    const { width: naturalWidth, height: naturalHeight } = imageNaturalSize.value
    const containerWidth = imgWrapperRef.value?.clientWidth || 800
    const containerHeight = imgWrapperRef.value?.clientHeight || 600
    if (!naturalWidth || !naturalHeight) return { width: 'auto', height: '75vh' }
    const containerRatio = containerWidth / containerHeight
    const imageRatio = naturalWidth / naturalHeight
    return imageRatio > containerRatio
      ? { width: '100%', height: 'auto' }
      : { width: 'auto', height: '75vh' }
  })

  const imgStyle = computed(() => {
    const baseStyle = {
      transform: `scale(${zoomLevel.value}) rotate(${rotation.value}deg)`,
      transition: 'transform 0.3s ease',
    }
    if (fitMode.value === 'contain') {
      return { ...baseStyle, width: '100%', height: '100%', objectFit: 'contain' as const }
    }
    if (fitMode.value === 'fill') {
      return { ...baseStyle, width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }
    }
    return { ...baseStyle, ...autoFitStyle.value }
  })

  function resetImageControls() {
    zoomLevel.value = 1
    rotation.value = 0
    fitMode.value = 'auto'
    imageNaturalSize.value = { width: 0, height: 0 }
  }

  async function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    await loadImage()
  }

  async function loadImage() {
    const api = getMenuApi(currentMenu.value)
    if (!api) return

    loading.value = true
    try {
      const category = getFunctionCategory(api)
      if (!category) return
      const res = await fetchRandomImage(category)
      const normalized = res.data?.data.items?.length
        ? res.data.data.items
        : res.data?.data.url ?? ''
      imgUrl.value = normalized
      if (typeof normalized === 'string' && normalized) {
        historyImages.value.unshift({ url: normalized, time: new Date().toISOString() })
        historyImages.value = historyImages.value.slice(0, 10)
      }
      currentImageIndex.value = 0
      resetImageControls()
    } finally {
      loading.value = false
    }
  }

  function handleImgLoad(event: Event) {
    const img = event.target as HTMLImageElement
    imageNaturalSize.value = { width: img.naturalWidth, height: img.naturalHeight }
    nextTick(() => {
      if (fitMode.value === 'auto') zoomLevel.value = 1
    })
  }

  function handleImgError(event: Event) {
    ;(event.target as HTMLImageElement).src = 'https://www.layui-vue.com/assets/404-CWJ6jsKv.svg'
  }

  function prevImage() {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value -= 1
      resetImageControls()
    }
  }

  function nextImage() {
    if (Array.isArray(imgUrl.value) && currentImageIndex.value < imgUrl.value.length - 1) {
      currentImageIndex.value += 1
      resetImageControls()
    }
  }

  function switchImage(index: number) {
    currentImageIndex.value = index
    resetImageControls()
  }

  function zoomIn() {
    if (zoomLevel.value < 3) zoomLevel.value += 0.1
  }

  function zoomOut() {
    if (zoomLevel.value > 0.3) zoomLevel.value -= 0.1
  }

  function resetZoom() {
    zoomLevel.value = 1
  }

  function rotateImg() {
    rotation.value = (rotation.value + 90) % 360
  }

  function fitAuto() {
    fitMode.value = 'auto'
    resetZoom()
  }

  function fitContain() {
    fitMode.value = 'contain'
    resetZoom()
  }

  function fitOriginal() {
    fitMode.value = 'fill'
    resetZoom()
  }

  function downloadImage() {
    if (currentImageUrl.value) window.open(currentImageUrl.value, '_blank')
  }

  function viewHistoryImage(item: HistoryItem) {
    imgUrl.value = item.url
    resetImageControls()
  }

  function formatTime(timeString: string) {
    return new Date(timeString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function initPage() {
    const res = await fetchLiteImageMenus()
    menus.value = res.data ?? []
    const firstChild = menus.value[0]?.children?.[0]
    if (firstChild) await handleMenuClick(firstChild)
  }

  onMounted(initPage)

  return {
    menus,
    currentPath,
    currentMenu,
    isMenuVisible,
    menuVisible,
    imgUrl,
    currentImageIndex,
    loading,
    zoomLevel,
    rotation,
    imageOrientation,
    imgStyle,
    historyImages,
    imgWrapperRef,
    currentImageUrl,
    handleMenuClick,
    loadImage,
    handleImgLoad,
    handleImgError,
    prevImage,
    nextImage,
    switchImage,
    zoomIn,
    zoomOut,
    resetZoom,
    rotateImg,
    fitAuto,
    fitContain,
    fitOriginal,
    downloadImage,
    viewHistoryImage,
    formatTime,
    fitMode,
  }
}
