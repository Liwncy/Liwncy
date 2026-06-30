export interface ApiResult<T = unknown> {
  code: number
  success: boolean
  msg?: string
  message?: string
  data?: T
}

export type { MenuNode, MenuPayload, MenuScope, MenuTab, NavItem, SideMenuChild, SideMenuGroup } from '@/types/menu'
