import { defineStore } from 'pinia'
import type { Article, ArticleInfo } from '@/types/article'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articleInfo: {} as Partial<ArticleInfo>,
  }),
  actions: {
    setArticleInfo(dataList: Article[], curData: Article) {
      this.articleInfo = { dataList, curData }
    },
  },
  persist: {
    paths: ['articleInfo'],
  },
})
