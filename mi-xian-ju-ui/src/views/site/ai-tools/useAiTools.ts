import { computed, onMounted, ref } from 'vue'
import { fetchAiToolMenus } from '@/api/ai-tools'
import { postCfWorker } from '@/api/cf-worker'
import { copyText } from '@/utils/clipboard'
import type { MenuNode } from '@/types/menu'
import { getMenuApi } from '@/utils/normalize-menu'

interface FormattedResultItem {
  content: string
  description: string
}

export function useAiTools() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('text-summarize')
  const currentMenu = ref<MenuNode>({ id: '', title: '' })
  const isMenuVisible = ref(true)
  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))

  const loading = ref(false)
  const userInput = ref('')
  const executionResult = ref('')
  const copyLoading = ref(false)
  const currentCopyIndex = ref(-1)

  const isFormattedResult = computed(() => {
    if (!executionResult.value) return false
    try {
      const json = JSON.parse(executionResult.value) as { list?: FormattedResultItem[] }
      return Array.isArray(json.list)
    } catch {
      return false
    }
  })

  const resultList = computed(() => {
    if (!isFormattedResult.value) return []
    try {
      const json = JSON.parse(executionResult.value) as { list?: FormattedResultItem[] }
      return (json.list ?? []).filter((item) => item.content && item.description)
    } catch {
      return []
    }
  })

  function handleMenuClick(menu: MenuNode) {
    currentMenu.value = menu
    currentPath.value = String(menu.id)
    userInput.value = ''
    executionResult.value = ''
  }

  function needsInput() {
    const api = getMenuApi(currentMenu.value) ?? ''
    return !api.startsWith('/api/')
  }

  async function executeTool() {
    const api = getMenuApi(currentMenu.value)
    if (!api) return
    if (needsInput() && !userInput.value.trim()) return

    loading.value = true
    try {
      const res = await postCfWorker<string>(api, { content: userInput.value })
      executionResult.value = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
    } catch {
      executionResult.value = ''
    } finally {
      loading.value = false
    }
  }

  function clearInput() {
    userInput.value = ''
    executionResult.value = ''
  }

  async function copyResult() {
    if (!executionResult.value) return
    copyLoading.value = true
    await copyText(executionResult.value)
    copyLoading.value = false
  }

  async function copyResultItem(content: string, index: number) {
    copyLoading.value = true
    currentCopyIndex.value = index
    await copyText(content)
    copyLoading.value = false
    currentCopyIndex.value = -1
  }

  async function initPage() {
    const res = await fetchAiToolMenus()
    menus.value = res.data ?? []
    const firstChild = menus.value[0]?.children?.[0]
    if (firstChild) handleMenuClick(firstChild)
  }

  onMounted(initPage)

  return {
    menus,
    currentPath,
    currentMenu,
    isMenuVisible,
    menuVisible,
    loading,
    userInput,
    executionResult,
    copyLoading,
    currentCopyIndex,
    isFormattedResult,
    resultList,
    needsInput,
    handleMenuClick,
    executeTool,
    clearInput,
    copyResult,
    copyResultItem,
  }
}
