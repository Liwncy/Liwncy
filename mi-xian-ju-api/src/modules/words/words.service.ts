import type { AppEnv } from '../../env'
import { findYujnBaseUrl, listLiteWordMenus, type WordMenuRow } from './words.repository'

export class WordError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

type WordGroup = {
  id: string
  title: string
  items: Array<{ id: string; title: string }>
}

export async function listWordMenus(db: AppEnv['Bindings']['DB']): Promise<WordGroup[]> {
  const rows = await listLiteWordMenus(db)
  const groups = new Map<string, WordGroup>()
  for (const row of rows.filter((item) => !item.parent_id)) {
    groups.set(row.id, { id: row.id, title: row.title, items: [] })
  }
  for (const row of rows.filter((item) => item.parent_id)) {
    const group = groups.get(row.parent_id ?? '')
    if (!group || !readWordPath(row)) continue
    group.items.push({ id: row.id, title: row.title })
  }
  const nested = [...groups.values()].filter((group) => group.items.length > 0)
  if (nested.length > 0) return nested

  const items = rows.filter((row) => !row.parent_id && readWordPath(row)).map((row) => ({ id: row.id, title: row.title }))
  return items.length > 0 ? [{ id: 'words', title: '文案', items }] : []
}

export async function fetchWord(db: AppEnv['Bindings']['DB'], menuId: string) {
  const rows = await listLiteWordMenus(db)
  const menu = rows.find((row) => row.id === menuId)
  const apiPath = menu ? readWordPath(menu) : ''
  if (!menu || !apiPath) throw new WordError('没有这个文案', 400)

  const baseUrl = await findYujnBaseUrl(db)
  let target: URL
  try {
    target = new URL(apiPath, baseUrl)
  } catch {
    throw new WordError('这个文案地址不对', 500)
  }
  if (target.origin !== new URL(baseUrl).origin) {
    throw new WordError('这个文案地址不对', 500)
  }
  target.searchParams.set('type', 'json')

  try {
    const response = await fetch(target, { redirect: 'follow' })
    const lines = await readLines(response)
    if (lines.length === 0) throw new Error('empty')
    return { title: menu.title, lines }
  } catch (error) {
    if (error instanceof WordError) throw error
    throw new WordError('这句没取到，再试下', 502)
  }
}

function readWordPath(row: WordMenuRow) {
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

async function readLines(response: Response) {
  const text = (await response.text()).trim()
  if (!text) return []
  try {
    return linesFromValue(JSON.parse(text))
  } catch {
    return splitLines(text)
  }
}

function linesFromValue(value: unknown): string[] {
  if (typeof value === 'string') return splitLines(value)
  if (Array.isArray(value)) return value.flatMap(linesFromValue)
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  const preferred = [record.echo, record.pyq, record.data, record.msg, record.text, record.content, record.contents]
  for (const item of preferred) {
    const lines = linesFromValue(item)
    if (lines.length > 0) return lines
  }
  return []
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
