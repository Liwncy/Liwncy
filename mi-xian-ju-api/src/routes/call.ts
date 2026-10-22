import type { Hono } from 'hono'
import type { AppDatabase, AppEnv, WorkerFetcher } from '../env'
import { HttpError } from '../http'

type PageName = 'words' | 'videos' | 'images'

type PlacementRow = {
  placement_id: string
  group_title: string
  sort: number
  name: string
  endpoint_id: string
  request_json: string
}

const PAGE_COPY: Record<PageName, { missing: string; failed: string; groupId: string }> = {
  words: { missing: '没有这个文案', failed: '这句没取到，再试下', groupId: 'words' },
  videos: { missing: '没有这个视频源', failed: '这支没取到，再试下', groupId: 'videos' },
  images: { missing: '没有这个图源', failed: '这张没取到，再试下', groupId: 'images' },
}

export function registerPageRoutes(app: Hono<AppEnv>) {
  app.get('/api/words/menus', (c) => menus(c.env.DB, 'words'))
  app.get('/api/videos/menus', (c) => menus(c.env.DB, 'videos'))
  app.get('/api/images/menus', (c) => menus(c.env.DB, 'images'))
  app.get('/api/words', (c) => load(c.env.DB, c.env.CF_WORKER, 'words', c.req.query('id') ?? ''))
  app.get('/api/videos', (c) => load(c.env.DB, c.env.CF_WORKER, 'videos', c.req.query('id') ?? ''))
  app.get('/api/images', (c) => load(c.env.DB, c.env.CF_WORKER, 'images', c.req.query('id') ?? ''))
}

async function menus(db: AppDatabase, page: PageName) {
  try {
    const rows = await listPlacements(db, page)
    return Response.json({ groups: groupRows(page, rows) })
  } catch (error) {
    return fail(page, error)
  }
}

async function load(db: AppDatabase, worker: WorkerFetcher, page: PageName, id: string) {
  try {
    const row = await findPlacement(db, page, id)
    if (!row) throw new HttpError(PAGE_COPY[page].missing, 400)
    const upstream = await callCatalog(worker, row)
    if (page === 'words') return Response.json({ title: row.name, lines: readLines(upstream) })
    if (page === 'videos') return Response.json({ title: row.name, url: readVideoUrl(upstream) })
    return Response.json({ title: row.name, urls: readImageUrls(upstream) })
  } catch (error) {
    return fail(page, error)
  }
}

function groupRows(page: PageName, rows: Array<Pick<PlacementRow, 'placement_id' | 'group_title' | 'name'>>) {
  const groups: Array<{ id: string; title: string; items: Array<{ id: string; title: string }> }> = []
  for (const row of rows) {
    const title = row.group_title || PAGE_COPY[page].groupId
    let group = groups.find((item) => item.title === title)
    if (!group) {
      group = { id: title, title, items: [] }
      groups.push(group)
    }
    group.items.push({ id: row.placement_id, title: row.name })
  }
  if (groups.length === 1) groups[0].id = PAGE_COPY[page].groupId
  return groups
}

async function listPlacements(db: AppDatabase, page: PageName) {
  const result = await db
    .prepare(
      `SELECT p.id AS placement_id, p.group_title, p.sort, e.name
       FROM api_menus p
       JOIN api_endpoints e ON e.id = p.endpoint_id
       JOIN api_platforms s ON s.id = e.platform_id
       WHERE p.kind = 'page' AND p.ref = ? AND e.status = 'enabled' AND s.status = 'enabled'
       ORDER BY p.sort, p.id`,
    )
    .bind(page)
    .all<Pick<PlacementRow, 'placement_id' | 'group_title' | 'sort' | 'name'>>()
  return result.results
}

async function findPlacement(db: AppDatabase, page: PageName, id: string) {
  const result = await db
    .prepare(
      `SELECT p.id AS placement_id, p.group_title, p.sort, e.id AS endpoint_id, e.name, e.request_json
       FROM api_menus p
       JOIN api_endpoints e ON e.id = p.endpoint_id
       JOIN api_platforms s ON s.id = e.platform_id
       WHERE p.id = ? AND p.kind = 'page' AND p.ref = ? AND e.status = 'enabled' AND s.status = 'enabled'`,
    )
    .bind(id, page)
    .all<PlacementRow>()
  return result.results[0]
}

type Upstream = {
  contentType: string
  finalUrl: string
  text: string
  mapped: Record<string, unknown> | null
}

async function callCatalog(worker: WorkerFetcher, row: PlacementRow): Promise<Upstream> {
  const requestJson = JSON.parse(row.request_json || '{}') as { entry?: string }
  const entry = requestJson.entry === 'POST' ? 'POST' : 'GET'
  let response: Response
  try {
    response = await worker.fetch(
      new Request(`https://cf-worker/api/catalog/${encodeURIComponent(row.endpoint_id)}`, { method: entry }),
    )
  } catch {
    throw new HttpError('对方没返回', 502)
  }
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase()
  const finalUrl = response.headers.get('x-final-url') ?? ''
  if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
    await response.body?.cancel()
    if (!response.ok || !finalUrl) throw new HttpError('对方没返回', 502)
    return { contentType, finalUrl, text: '', mapped: null }
  }
  const text = await response.text()
  if (text.length > 1_000_000) throw new HttpError('正文太大', 502)
  if (contentType.includes('json')) {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return { contentType, finalUrl, text, mapped: null }
    }
    if (isEnvelope(parsed)) {
      if (parsed.code !== 0) throw new HttpError('对方没返回', 502)
      const data = parsed.data
      const mapped = data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : {}
      return { contentType, finalUrl, text, mapped }
    }
  }
  if (!response.ok) throw new HttpError('对方没返回', 502)
  return { contentType, finalUrl, text, mapped: null }
}

function isEnvelope(value: unknown): value is { code: number; data: unknown } {
  return !!value && typeof value === 'object' && !Array.isArray(value) && 'code' in value && 'data' in value
}

function readLines(upstream: Upstream) {
  const value = upstream.mapped ? upstream.mapped.lines : upstream.text
  const lines = toLines(value)
  if (lines.length === 0) throw new HttpError('这句没取到，再试下', 502)
  return lines
}

function readVideoUrl(upstream: Upstream) {
  const picked = upstream.mapped
    ? textValue(upstream.mapped.url)
    : upstream.contentType.startsWith('video/') && upstream.finalUrl
      ? upstream.finalUrl
      : textValue(upstream.text)
  if (!isHttpUrl(picked)) throw new HttpError('这支没取到，再试下', 502)
  return picked
}

function readImageUrls(upstream: Upstream) {
  const urls = upstream.mapped
    ? collectUrls(upstream.mapped.urls)
    : upstream.contentType.startsWith('image/') && upstream.finalUrl
      ? [upstream.finalUrl]
      : isHttpUrl(textValue(upstream.text))
        ? [textValue(upstream.text)]
        : []
  if (urls.length === 0) throw new HttpError('这张没取到，再试下', 502)
  return urls
}

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toLines(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }
  if (Array.isArray(value)) return value.flatMap(toLines)
  return []
}

function collectUrls(value: unknown): string[] {
  if (typeof value === 'string') return isHttpUrl(value.trim()) ? [value.trim()] : []
  if (Array.isArray(value)) return value.flatMap(collectUrls)
  return []
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function fail(page: PageName, error: unknown) {
  if (error instanceof HttpError) {
    const missing = error.status === 400 && error.message === PAGE_COPY[page].missing
    return Response.json(
      { message: missing ? error.message : PAGE_COPY[page].failed },
      { status: missing ? 400 : 502 },
    )
  }
  console.error(error)
  return Response.json({ message: PAGE_COPY[page].failed }, { status: 500 })
}
