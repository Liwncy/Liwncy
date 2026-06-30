import type { MenuNode, MenuTab } from '@/types/menu'

export type { MenuTab as HotBanTab }

export type HotBanMenuChild = MenuNode
export type HotBanMenuGroup = MenuNode

export interface HotArticleItem {
  title_url?: string
  title: string
  description?: string
  author_info?: string
  article_time?: string
  hot_value?: string | number
}

export type DailyHotMenuChild = MenuNode
export type DailyHotMenuGroup = MenuNode

export interface DailyHotItem {
  rank: number
  title: string
  link: string
  hotValue: number
  time: string
}
