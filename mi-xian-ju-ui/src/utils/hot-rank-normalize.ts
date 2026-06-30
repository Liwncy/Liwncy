import type { HotArticleItem } from '@/types/hot-rank'

/** 统一 60s API 返回的热榜字段 */
export function normalizeHotArticles(data: unknown): HotArticleItem[] {
  let listData: Record<string, unknown>[] = []

  if (data && typeof data === 'object' && 'list' in (data as object)) {
    listData = (data as { list: Record<string, unknown>[] }).list
  } else if (Array.isArray(data)) {
    listData = data as Record<string, unknown>[]
  } else {
    return []
  }

  return listData.map((item) => ({
    title_url: (item.url ?? item.title_url ?? item.link) as string | undefined,
    title: (item.title ?? item.name ?? item.movie_name ?? item.programme_name ?? item.series_name) as string,
    description: (item.description ?? item.desc ?? item.summary ?? item.detail ?? item.channel_name) as string | undefined,
    author_info: (item.author ?? item.author_info) as string | undefined,
    article_time: (item.time ?? item.article_time ?? item.active_time ?? item.published ?? item.created ?? item.release_year ?? item.release_info) as string | undefined,
    hot_value: (item.hot_value ?? item.hot_value_desc ?? item.score ?? item.hot ?? item.box_office_desc) as string | number | undefined,
  }))
}

export function getRankClass(rank: number) {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

export function formatHotValue(value: number) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return String(value)
}
