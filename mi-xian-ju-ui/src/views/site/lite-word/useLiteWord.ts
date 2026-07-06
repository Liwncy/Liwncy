import { computed, onMounted, ref } from 'vue'
import { layer } from '@layui/layer-vue'
import { fetchLiteWordMenus } from '@/api/lite-word'
import { fetchText, getMenuFunctionCategory } from '@/api/functions'
import { copyText } from '@/utils/clipboard'
import type { MenuNode } from '@/types/menu'

export function useLiteWord() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('')
  const currentMenu = ref<MenuNode>({ id: '', title: '' })
  const isMenuVisible = ref(true)
  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))
  const contentPreview = ref<string[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  let requestSeq = 0

  const hasActiveMenu = computed(() => Boolean(getMenuFunctionCategory(currentMenu.value)))

  async function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    await loadContent()
  }

  async function loadContent() {
    const category = getMenuFunctionCategory(currentMenu.value)
    if (!category) {
      errorMessage.value = '当前文案分类未配置 API 分类。'
      return false
    }

    const seq = ++requestSeq
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await fetchText(category)
      if (seq !== requestSeq) return false
      const lines = res.data?.data.items ?? []
      contentPreview.value = lines.length
        ? lines
        : ['文案内容为空，请换一个分类或稍后重试。']
      if (!lines.length) {
        errorMessage.value = '接口没有返回文案内容。'
        return false
      }
      return true
    } catch {
      if (seq === requestSeq) {
        errorMessage.value = '文案获取失败，请检查网络或接口状态。'
        contentPreview.value = [errorMessage.value]
      }
      return false
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  async function copyContent() {
    if (!contentPreview.value.length) return
    const ok = await copyText(contentPreview.value.join('\n'))
    layer.msg(ok ? '文案复制成功' : '复制失败，请手动复制', { icon: ok ? 1 : 2 })
  }

  async function refreshContent() {
    const ok = await loadContent()
    layer.msg(ok ? '文案已刷新' : errorMessage.value || '文案刷新失败', { icon: ok ? 1 : 2 })
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
    errorMessage,
    hasActiveMenu,
    handleMenuClick,
    copyContent,
    refreshContent,
  }
}
