import { get } from '@/api/http'
import type { ApiResult } from '@/types/global'

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

export function fetchHotVideo(category: string) {
  return invokeFunction<UrlFunctionData>('hot-video', { category })
}

export function fetchRandomImage(category: string) {
  return invokeFunction<UrlFunctionData>('random-image', { category })
}

export function fetchLiteWord(category: string) {
  return invokeFunction<TextLinesFunctionData>('lite-word', { category })
}
