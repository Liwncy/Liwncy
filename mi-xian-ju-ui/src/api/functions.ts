import { get } from '@/api/http'
import type { ApiResult } from '@/types/global'
import type { MenuNode } from '@/types/menu'

export interface FunctionApiResponse<T = unknown> {
  code: string
  name: string
  responseType: string
  data: T
}

export interface UrlFunctionData {
  url: string
  items?: string[]
}

export interface TextLinesFunctionData {
  items: string[]
}

function invokeFunction<T>(code: string, params: Record<string, unknown>) {
  return get<ApiResult<FunctionApiResponse<T>>>(`/v1/${code}`, { params })
}

export function getFunctionCategory(api?: string) {
  if (!api) return ''
  const match = api.match(/\/api\/([^/?#]+)\.php/i)
  const category = match?.[1] ?? ''
  if (category === 'xjj' || category === 'zzxjj') return 'xiaojiejie'
  return category
}

export function getMenuFunctionCategory(menu: MenuNode) {
  const configured = menu.payload?.functionCategory ?? menu.payload?.category
  if (typeof configured === 'string' && configured.trim()) return configured.trim()
  return getFunctionCategory(typeof menu.payload?.api === 'string' ? menu.payload.api : undefined)
}

export function fetchVideo(category: string) {
  return invokeFunction<UrlFunctionData>('litevideo', { category })
}

export function fetchImage(category: string) {
  return invokeFunction<UrlFunctionData>('liteimage', { category })
}

export function fetchText(category: string) {
  return invokeFunction<TextLinesFunctionData>('liteword', { category })
}
