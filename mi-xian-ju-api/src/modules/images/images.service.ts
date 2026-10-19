import type { AppEnv } from '../../env'
import { findYujnBaseUrl, listLiteImageMenus, type ImageMenuRow } from './images.repository'

export class ImageError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

type ImageGroup = {
  id: string
  title: string
  items: Array<{ id: string; title: string }>
}

export async function listImageMenus(db: AppEnv['Bindings']['DB']): Promise<ImageGroup[]> {
  const rows = await listLiteImageMenus(db)
  const groups = new Map<string, ImageGroup>()
  for (const row of rows.filter((item) => !item.parent_id)) {
    groups.set(row.id, { id: row.id, title: row.title, items: [] })
  }
  for (const row of rows.filter((item) => item.parent_id)) {
    const group = groups.get(row.parent_id ?? '')
    if (!group || !readApiPath(row)) continue
    group.items.push({ id: row.id, title: row.title })
  }
  return [...groups.values()].filter((group) => group.items.length > 0)
}

export async function fetchImage(db: AppEnv['Bindings']['DB'], menuId: string) {
  const rows = await listLiteImageMenus(db)
  const menu = rows.find((row) => row.id === menuId)
  const apiPath = menu ? readApiPath(menu) : ''
  if (!menu || !apiPath) throw new ImageError('没有这个图源', 400)

  const baseUrl = await findYujnBaseUrl(db)
  let target: URL
  try {
    target = new URL(apiPath, baseUrl)
  } catch {
    throw new ImageError('这个图源地址不对', 500)
  }
  if (target.origin !== new URL(baseUrl).origin) {
    throw new ImageError('这个图源地址不对', 500)
  }

  try {
    const response = await fetch(target, { redirect: 'follow' })
    const urls = await readImageUrls(response)
    if (urls.length === 0) throw new Error('empty')
    return { title: menu.title, urls }
  } catch (error) {
    if (error instanceof ImageError) throw error
    throw new ImageError('这张没取到，再试下', 502)
  }
}

function readApiPath(row: ImageMenuRow) {
  try {
    const payload = JSON.parse(row.payload_json) as { api?: unknown; data?: { api?: unknown } }
    const api = typeof payload.api === 'string' ? payload.api : payload.data?.api
    return typeof api === 'string' && api.startsWith('/api/') ? api : ''
  } catch {
    return ''
  }
}

async function readImageUrls(response: Response) {
  const type = response.headers.get('content-type') ?? ''
  if (type.startsWith('image/') && response.url) return [response.url]
  const text = await response.text()
  if (!text.trim()) return response.url && type.startsWith('image/') ? [response.url] : []
  try {
    return collectUrls(JSON.parse(text))
  } catch {
    return isHttpUrl(text.trim()) ? [text.trim()] : []
  }
}

function collectUrls(value: unknown): string[] {
  if (typeof value === 'string') return isHttpUrl(value) ? [value.trim()] : []
  if (Array.isArray(value)) return value.flatMap(collectUrls)
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  const preferred = [record.url, record.img, record.image, record.pic, record.data, record.image_url]
  const found = preferred.flatMap(collectUrls)
  return found.length > 0 ? found : []
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim())
}
