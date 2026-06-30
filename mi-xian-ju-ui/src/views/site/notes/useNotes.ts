import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchArticles } from '@/api/article'
import { useArticleStore } from '@/store/article'
import type { Article } from '@/types/article'

function formatTags(tags: Article['tags']) {
  if (Array.isArray(tags)) return tags.join(', ')
  return tags ?? ''
}

export function useNotes() {
  const router = useRouter()
  const articleStore = useArticleStore()
  const loading = ref(false)
  const dataSource = ref<Article[]>([])
  const page = reactive({ current: 1, limit: 10, total: 0 })

  const columns = [
    { title: '序号', width: '55px', type: 'number', fixed: 'left' as const },
    { title: '📑', width: '200px', key: 'title', customSlot: 'title' },
    { title: '作者', width: '100px', key: 'author' },
    { title: '🌟', width: '120px', key: 'tags' },
    { title: '🐛', width: '100px', key: 'source' },
    { title: '📅', width: '120px', key: 'date' },
  ]

  const dataShow = ref<Article[]>([])

  function slicePage(current: number, limit: number) {
    const start = (current - 1) * limit
    return dataSource.value.slice(start, start + limit)
  }

  function change(nextPage: { current: number; limit: number }) {
    page.current = nextPage.current
    page.limit = nextPage.limit
    dataShow.value = slicePage(page.current, page.limit)
  }

  function openArticle(row: Article) {
    articleStore.setArticleInfo(dataSource.value, row)
    router.push({ name: 'Read' })
  }

  async function loadArticles() {
    loading.value = true
    try {
      const list = await fetchArticles()
      dataSource.value = list.map((item) => ({
        ...item,
        tags: formatTags(item.tags),
      }))
      page.total = dataSource.value.length
      dataShow.value = slicePage(page.current, page.limit)
    } finally {
      loading.value = false
    }
  }

  onMounted(loadArticles)

  return {
    loading,
    columns,
    dataShow,
    page,
    change,
    openArticle,
  }
}
