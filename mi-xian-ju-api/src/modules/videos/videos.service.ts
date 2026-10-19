import type { AppEnv } from '../../env'
import { findYujnBaseUrl, listLiteVideoMenus, type VideoMenuRow } from './videos.repository'

export class VideoError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

type VideoGroup = {
  id: string
  title: string
  items: Array<{ id: string; title: string }>
}

export async function listVideoMenus(db: AppEnv['Bindings']['DB']): Promise<VideoGroup[]> {
  const rows = await listLiteVideoMenus(db)
  const groups = new Map<string, VideoGroup>()
  for (const row of rows.filter((item) => !item.parent_id)) {
    groups.set(row.id, { id: row.id, title: row.title, items: [] })
  }
  for (const row of rows.filter((item) => item.parent_id)) {
    const group = groups.get(row.parent_id ?? '')
    if (!group || !readVideoPath(row)) continue
    group.items.push({ id: row.id, title: row.title })
  }
  const nested = [...groups.values()].filter((group) => group.items.length > 0)
  if (nested.length > 0) return nested

  const items = rows.filter((row) => !row.parent_id && readVideoPath(row)).map((row) => ({ id: row.id, title: row.title }))
  return items.length > 0 ? [{ id: 'videos', title: '视频源', items }] : []
}

export async function fetchVideo(db: AppEnv['Bindings']['DB'], menuId: string) {
  const rows = await listLiteVideoMenus(db)
  const menu = rows.find((row) => row.id === menuId)
  const apiPath = menu ? readVideoPath(menu) : ''
  if (!menu || !apiPath) throw new VideoError('没有这个视频源', 400)

  const baseUrl = await findYujnBaseUrl(db)
  let target: URL
  try {
    target = new URL(apiPath, baseUrl)
  } catch {
    throw new VideoError('这个视频源地址不对', 500)
  }
  if (target.origin !== new URL(baseUrl).origin) {
    throw new VideoError('这个视频源地址不对', 500)
  }
  target.searchParams.set('type', 'json')

  try {
    const response = await fetch(target, { redirect: 'follow' })
    const url = await readVideoUrl(response)
    if (!url) throw new Error('empty')
    return { title: menu.title, url }
  } catch (error) {
    if (error instanceof VideoError) throw error
    throw new VideoError('这支没取到，再试下', 502)
  }
}

function readVideoPath(row: VideoMenuRow) {
  try {
    const payload = JSON.parse(row.payload_json) as {
      api?: unknown
      category?: unknown
      data?: { api?: unknown; category?: unknown }
    }
    const api = typeof payload.api === 'string' ? payload.api : payload.data?.api
    if (typeof api === 'string') {
      const path = api.split('?')[0] ?? ''
      if (/^\/api\/[A-Za-z0-9_-]+\.php$/.test(path)) return path
    }
    const category = typeof payload.data?.category === 'string' ? payload.data.category : payload.category
    if (typeof category === 'string' && /^[A-Za-z0-9_-]+$/.test(category)) return `/api/${category}.php`
    return ''
  } catch {
    return ''
  }
}

async function readVideoUrl(response: Response) {
  const type = response.headers.get('content-type') ?? ''
  if (type.startsWith('video/') && response.url) return response.url
  const text = (await response.text()).trim()
  if (isHttpUrl(text)) return text
  try {
    const parsed = JSON.parse(text) as { data?: unknown; url?: unknown }
    if (typeof parsed.data === 'string' && isHttpUrl(parsed.data.trim())) return parsed.data.trim()
    if (typeof parsed.url === 'string' && isHttpUrl(parsed.url.trim())) return parsed.url.trim()
  } catch {
    return ''
  }
  return ''
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim())
}
