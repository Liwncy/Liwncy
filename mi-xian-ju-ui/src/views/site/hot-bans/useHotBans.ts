import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import { fetchHotBanMenus } from '@/api/hot-bans'
import { fetch60sApi } from '@/api/external/sixty'
import type { HotArticleItem } from '@/types/hot-rank'
import type { MenuNode, MenuTab } from '@/types/menu'
import { findPlatformDescription, normalizeHotArticles } from '@/utils/hot-article'
import { getMenuTabs } from '@/utils/normalize-menu'
import { getPaginationData } from '@/utils/pagination'

export function useHotBans() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('')
  const currentMenu = ref<MenuNode | Record<string, never>>({})
  const tabTitleList = ref<MenuTab[]>([])
  const currentTab = ref('')
  const loading = ref(false)
  const isMenuVisible = ref(true)
  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))

  const page = ref({ total: 0, limit: 10, current: 1 })
  const articleList = ref<HotArticleItem[]>([])
  const allArticleList = ref<HotArticleItem[]>([])

  const platformDesc = computed(() => {
    if (!currentMenu.value || !('id' in currentMenu.value)) return '实时热点，一手掌握'
    return findPlatformDescription(menus.value, currentMenu.value.id)
  })

  async function initPage() {
    const res = await fetchHotBanMenus()
    menus.value = res.data ?? []
    const firstChild = menus.value[0]?.children?.[0]
    if (firstChild) {
      await handleMenuClick(firstChild)
    }
  }

  async function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    const tabs = getMenuTabs(menu)
    currentTab.value = tabs[0]?.id ?? ''
    tabTitleList.value = tabs.map((item) => ({ ...item }))
    page.value = { total: 0, limit: 10, current: 1 }
    articleList.value = []
    await loadArticles()
  }

  async function handleTabChange() {
    page.value = { total: 0, limit: 10, current: 1 }
    articleList.value = []
    await loadArticles()
  }

  async function loadArticles() {
    if (!('payload' in currentMenu.value)) return

    const tabs = getMenuTabs(currentMenu.value as MenuNode)
    const tab = tabs.find((item) => item.id === currentTab.value)
    if (!tab?.api) return

    loading.value = true
    try {
      const res = await fetch60sApi<unknown>(tab.api)
      allArticleList.value = normalizeHotArticles(res.data)
      const pageData = getPaginationData(allArticleList.value, page.value.current, page.value.limit)
      articleList.value = pageData.currentPageList
      page.value.total = pageData.total
    } catch (err) {
      console.error(err)
      layer.msg('热榜数据加载失败', { icon: 2 })
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (page.value.total <= page.value.current * page.value.limit) {
      layer.msg('没有更多了', { time: 1000 })
      return
    }

    loading.value = true
    page.value.current += 1
    await new Promise((resolve) => setTimeout(resolve, 250))
    const pageData = getPaginationData(allArticleList.value, page.value.current, page.value.limit)
    articleList.value = articleList.value.concat(pageData.currentPageList)
    page.value.total = pageData.total
    loading.value = false
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
    tabTitleList,
    currentTab,
    loading,
    isMenuVisible,
    menuVisible,
    articleList,
    platformDesc,
    handleMenuClick,
    handleTabChange,
    loadMore,
    openLink,
  }
}
