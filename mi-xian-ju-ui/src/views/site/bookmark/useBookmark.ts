import { computed, onMounted, ref, watch } from 'vue'
import { layer } from '@layui/layer-vue'
import { fetchBookMarks } from '@/api/bookmark'
import type { BookItem } from '@/types/bookmark'
import type { MenuNode } from '@/types/menu'
import { buildBookMarkMenus, DEFAULT_AVATAR } from '@/utils/bookmark'
import { getMenuBooks } from '@/utils/normalize-menu'

export function useBookmark() {
  const menus = ref<MenuNode[]>([])
  const currentPath = ref('all')
  const currentCategoryName = ref('全部')
  const filterBookText = ref('')
  const dataSource = ref('0')
  const bookData = ref<BookItem[]>([])
  const bookShowData = ref<BookItem[]>([])
  const allBooksData = ref<BookItem[]>([])
  const loading = ref(false)
  const isMenuVisible = ref(true)

  const menuVisible = computed(() => (isMenuVisible.value ? '240px' : '0px'))

  watch(filterBookText, (val) => {
    const keyword = val.trim().toLowerCase()
    if (!keyword) {
      bookShowData.value = bookData.value
      return
    }
    bookShowData.value = bookData.value.filter(
      (b) =>
        b.title.toLowerCase().includes(keyword) ||
        (b.description ?? '').toLowerCase().includes(keyword),
    )
  })

  async function loadBookMarks() {
    loading.value = true
    try {
      const res = await fetchBookMarks(dataSource.value)
      if (!res.data?.length) {
        menus.value = []
        allBooksData.value = []
        bookData.value = []
        bookShowData.value = []
        return
      }

      const { menus: nextMenus, allBooks } = buildBookMarkMenus(res.data)
      menus.value = nextMenus
      allBooksData.value = allBooks
      currentPath.value = 'all'
      currentCategoryName.value = '全部'
      bookData.value = allBooks
      bookShowData.value = allBooks
    } catch (err) {
      console.error('获取书签数据失败:', err)
      layer.msg('书签加载失败，请确认 mi-xian-ju-api 已启动', { icon: 2 })
    } finally {
      loading.value = false
    }
  }

  function handleMenuClick(menu: MenuNode) {
    currentPath.value = String(menu.id)
    currentCategoryName.value = menu.title

    const books = getMenuBooks<BookItem>(menu)
    if (menu.id === 'all') {
      bookData.value = allBooksData.value
    } else if (books.length) {
      bookData.value = books
    } else if (menu.children?.length) {
      bookData.value = menu.children.flatMap((child) => getMenuBooks<BookItem>(child))
    } else {
      bookData.value = []
    }

    filterBookText.value = ''
    bookShowData.value = bookData.value
  }

  function openLink(link?: string) {
    if (link && link !== '#') {
      window.open(link, '_blank')
    }
  }

  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement
    target.src = DEFAULT_AVATAR
  }

  onMounted(() => {
    loadBookMarks()
  })

  return {
    menus,
    currentPath,
    currentCategoryName,
    filterBookText,
    dataSource,
    bookShowData,
    allBooksData,
    loading,
    isMenuVisible,
    menuVisible,
    loadBookMarks,
    handleMenuClick,
    openLink,
    handleImageError,
  }
}
