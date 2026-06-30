import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import { fetchLiteWordMenus } from '@/api/lite-word'
import { fetchYujnJson, normalizeTextLines } from '@/api/external/yujn'
import { copyText } from '@/utils/clipboard'
import type { MenuNode } from '@/types/menu'
import { getMenuApi } from '@/utils/normalize-menu'

export function useLiteWord() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('')
  const currentMenu = ref<MenuNode>({ id: '', title: '' })
  const isMenuVisible = ref(true)
  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))
  const contentPreview = ref<string[]>([])
  const loading = ref(false)

  async function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    await loadContent()
  }

  async function loadContent() {
    const api = getMenuApi(currentMenu.value)
    if (!api) return

    loading.value = true
    try {
      const res = await fetchYujnJson(api)
      const lines = normalizeTextLines(res)
      contentPreview.value = lines.length
        ? lines
        : ['文案内容为空，请换一个分类或稍后重试。']
    } catch {
      contentPreview.value = ['文案获取失败，请检查网络或接口状态。']
    } finally {
      loading.value = false
    }
  }

  async function copyContent() {
    if (!contentPreview.value.length) return
    await copyText(contentPreview.value.join('\n'))
  }

  async function refreshContent() {
    await loadContent()
    layer.msg('文案已刷新', { icon: 1 })
  }

  async function initPage() {
    const res = await fetchLiteWordMenus()
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
    contentPreview,
    loading,
    handleMenuClick,
    copyContent,
    refreshContent,
  }
}
