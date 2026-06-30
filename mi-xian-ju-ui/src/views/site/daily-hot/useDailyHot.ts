import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import { fetchDailyHotMenus } from '@/api/daily-hot'
import { fetchPearkApi, PEARK_API } from '@/api/external/peark'
import type { DailyHotItem } from '@/types/hot-rank'
import type { MenuNode } from '@/types/menu'
import { findPlatformDescription, formatHotValue } from '@/utils/hot-article'
import { getMenuPlatform } from '@/utils/normalize-menu'

interface PearkDailyHotItem {
  title: string
  url?: string
  mobileUrl?: string
  hot: number
  timestamp: number
}

export function useDailyHot() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('')
  const currentMenu = ref<MenuNode | Record<string, never>>({})
  const allHotData = ref<DailyHotItem[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const currentPage = ref(1)
  const pageSize = 10
  const isMenuVisible = ref(true)
  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))

  const hotList = computed(() => {
    const endIndex = currentPage.value * pageSize
    return allHotData.value.slice(0, endIndex)
  })

  const platformDesc = computed(() => {
    if (!('id' in currentMenu.value)) return '实时热点，一手掌握'
    return findPlatformDescription(menus.value, currentMenu.value.id)
  })

  async function initPage() {
    const res = await fetchDailyHotMenus()
    menus.value = res.data ?? []
    const firstChild = menus.value[0]?.children?.[0]
    if (firstChild) {
      await handleMenuClick(firstChild)
    }
  }

  async function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    currentPage.value = 1
    allHotData.value = []
    await loadData()
  }

  async function loadData() {
    if (loading.value || !('payload' in currentMenu.value)) return

    loading.value = true
    try {
      const platform = getMenuPlatform(currentMenu.value as MenuNode)
      const res = await fetchPearkApi<PearkDailyHotItem[]>(PEARK_API.DAILY_HOT, {
        title: platform,
      })

      allHotData.value = (res.data ?? []).map((item, index) => ({
        rank: index + 1,
        title: item.title,
        link: item.mobileUrl || item.url || '#',
        hotValue: item.hot,
        time: new Date(item.timestamp).toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
    } catch (err) {
      console.error(err)
      layer.msg('今日热榜加载失败', { icon: 2 })
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loadingMore.value) return
    if (hotList.value.length >= allHotData.value.length) {
      layer.msg('已经加载了全部数据')
      return
    }
    loadingMore.value = true
    currentPage.value += 1
    loadingMore.value = false
  }

  function openLink(link?: string) {
    if (link && link !== '#') {
      window.open(link, '_blank')
    }
  }

  onMounted(() => {
    initPage()
  })

  return {
    menus,
    currentPath,
    currentMenu,
    hotList,
    loading,
    loadingMore,
    isMenuVisible,
    menuVisible,
    platformDesc,
    handleMenuClick,
    loadMore,
    openLink,
    formatHotValue,
  }
}
