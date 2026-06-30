import type { MenuNode } from '@/types/menu'

export interface BookItem {
  id: string
  title: string
  avatar?: string
  description?: string
  links: string
}

export type BookMarkMenuChild = MenuNode
export type BookMarkMenuGroup = MenuNode

/** @deprecated API 已返回 MenuNode，保留类型别名兼容旧引用 */
export type BookMarkCategory = MenuNode
