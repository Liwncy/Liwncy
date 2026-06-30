import axios from 'axios'

const YUJN_ORIGIN = 'https://api.yujn.cn'

const jsonClient = axios.create({
  baseURL: '/yujn-api',
  timeout: 20000,
})

function appendJsonType(path: string) {
  if (path.includes('type=')) return path
  return path.includes('?') ? `${path}&type=json` : `${path}?type=json`
}

/** 遇见 API JSON 请求（开发环境走 Vite 代理） */
export async function fetchYujnJson<T = unknown>(path: string) {
  const res = await jsonClient.get<T>(appendJsonType(path))
  return res.data
}

/** 视频 / 图片直链（经 CORS 代理，供 video/img 标签使用） */
export function buildYujnMediaUrl(path: string) {
  const target = `${YUJN_ORIGIN}${path}`
  const proxy = import.meta.env.VITE_CORS_PROXY_URL
  if (proxy) {
    return `${proxy}?url=${encodeURIComponent(target)}&_t=${Date.now()}`
  }
  return `/yujn-api${path}${path.includes('?') ? '&' : '?'}_t=${Date.now()}`
}

export function isDirectMediaPath(path: string) {
  return path.includes('type=')
}

export function extractYujnPayload(data: unknown): unknown {
  if (data == null) return data
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if ('contents' in obj && typeof obj.contents === 'string') {
      try {
        return JSON.parse(obj.contents)
      } catch {
        return obj.contents
      }
    }
    return obj.data ?? obj.url ?? obj.img ?? obj.image_url ?? obj.msg ?? obj.echo ?? obj.pyq ?? obj
  }
  return data
}

export function normalizeImageResult(payload: unknown): string | string[] {
  const value = extractYujnPayload(payload)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string') as string[]
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const candidate = obj.url ?? obj.img ?? obj.image ?? obj.pic
    if (typeof candidate === 'string') return candidate
    if (Array.isArray(candidate)) {
      return candidate.filter((item) => typeof item === 'string') as string[]
    }
  }
  return ''
}

export function normalizeTextLines(payload: unknown): string[] {
  const value = extractYujnPayload(payload)
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split('\n').map((line) => line.trim()).filter(Boolean)
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .filter(Boolean)
  }
  if (value != null) return [String(value)]
  return []
}
