export interface Article {
  id: number | string
  icon?: string
  title: string
  author?: string
  content?: string
  date?: string
  linksUrl?: string
  tags?: string[] | string
  source?: string
}

export interface ArticleInfo {
  dataList: Article[]
  curData: Article
}
