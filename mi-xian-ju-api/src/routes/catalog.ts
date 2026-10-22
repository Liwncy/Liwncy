import type { Context, Hono } from 'hono'
import type { AppDatabase, AppEnv } from '../env'
import { HttpError, ok } from '../http'
import { pathParts } from '../mapping'

const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'])
const PLATFORM_COLUMNS = 'id, name, base_url, auth_json, status, note, created_at, updated_at'
const ENDPOINT_COLUMNS =
  'id, platform_id, name, method, path, request_json, mapping_json, status, note, created_at, updated_at'

type PlatformRow = {
  id: string
  name: string
  base_url: string
  auth_json: string
  status: string
  note: string
  created_at: string
  updated_at: string
}

type MenuRow = {
  id: string
  endpoint_id: string
  kind: string
  ref: string
  group_title: string
  sort: number
  note: string
  created_at: string
  updated_at: string
}

type EndpointRow = {
  id: string
  platform_id: string
  name: string
  method: string
  path: string
  request_json: string
  mapping_json: string | null
  status: string
  note: string
  created_at: string
  updated_at: string
}

export function registerCatalog(app: Hono<AppEnv>) {
  app.use('/api/admin/*', async (c, next) => {
    const expected = c.env.ADMIN_TOKEN
    if (!expected) throw new HttpError('管理凭证还没配', 500)
    const header = c.req.header('authorization') ?? ''
    const [scheme, token] = header.split(' ')
    if (scheme?.toLowerCase() !== 'bearer' || !token || !sameToken(token, expected)) {
      throw new HttpError('没有管理凭证', 401)
    }
    await next()
  })

  app.get('/api/admin/platforms', async (c) => {
    const rows = await listPlatforms(c.env.DB)
    return c.json(ok(rows.map(presentPlatform)))
  })

  app.post('/api/admin/platforms', async (c) => {
    const body = await readBody(c)
    const id = crypto.randomUUID()
    const name = readName(body.name)
    const baseUrl = readBaseUrl(body.base_url)
    const status = readStatus(body.status, 'enabled')
    const note = readNote(body.note)
    const authJson = readAuth(body.auth_json)
    await c.env.DB.prepare(
      `INSERT INTO api_platforms (id, name, base_url, auth_json, status, note) VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, name, baseUrl, authJson, status, note)
      .run()
    return c.json(ok(presentPlatform(await requirePlatform(c.env.DB, id))))
  })

  app.patch('/api/admin/platforms/:id', async (c) => {
    const id = c.req.param('id')
    await requirePlatform(c.env.DB, id)
    const body = await readBody(c)
    const sets: string[] = []
    const values: unknown[] = []
    if ('name' in body) {
      sets.push('name = ?')
      values.push(readName(body.name))
    }
    if ('base_url' in body) {
      sets.push('base_url = ?')
      values.push(readBaseUrl(body.base_url))
    }
    if ('auth_json' in body) {
      sets.push('auth_json = ?')
      values.push(readAuth(body.auth_json))
    }
    if ('status' in body) {
      sets.push('status = ?')
      values.push(readStatus(body.status))
    }
    if ('note' in body) {
      sets.push('note = ?')
      values.push(readNote(body.note))
    }
    if (sets.length === 0) throw new HttpError('没有要改的', 400)
    await c.env.DB.prepare(
      `UPDATE api_platforms SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(...values, id)
      .run()
    return c.json(ok(presentPlatform(await requirePlatform(c.env.DB, id))))
  })

  app.delete('/api/admin/platforms/:id', async (c) => {
    const id = c.req.param('id')
    await requirePlatform(c.env.DB, id)
    const count = await c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM api_endpoints WHERE platform_id = ?`,
    )
      .bind(id)
      .all<{ n: number }>()
    if ((count.results[0]?.n ?? 0) > 0) throw new HttpError('平台下面还有接口', 400)
    await c.env.DB.prepare(`DELETE FROM api_platforms WHERE id = ?`).bind(id).run()
    return c.json(ok({ id }))
  })

  app.get('/api/admin/endpoints', async (c) => {
    const platformId = c.req.query('platformId') ?? ''
    const statement = platformId
      ? c.env.DB.prepare(
          `SELECT ${ENDPOINT_COLUMNS} FROM api_endpoints WHERE platform_id = ? ORDER BY updated_at DESC, id`,
        ).bind(platformId)
      : c.env.DB.prepare(`SELECT ${ENDPOINT_COLUMNS} FROM api_endpoints ORDER BY updated_at DESC, id`)
    const result = await statement.all<EndpointRow>()
    return c.json(ok(result.results.map(presentEndpoint)))
  })

  app.post('/api/admin/endpoints', async (c) => {
    const body = await readBody(c)
    const platformId = readName(body.platform_id, '请填写平台')
    await requirePlatform(c.env.DB, platformId)
    const id = crypto.randomUUID()
    const path = readEndpointPath(body.path)
    await c.env.DB.prepare(
      `INSERT INTO api_endpoints
         (id, platform_id, name, method, path, request_json, mapping_json, status, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        platformId,
        readName(body.name),
        readMethod(body.method, 'GET'),
        path,
        readRequest(body.request_json, path),
        readMapping(body.mapping_json),
        readStatus(body.status, 'enabled'),
        readNote(body.note),
      )
      .run()
    return c.json(ok(presentEndpoint(await requireEndpoint(c.env.DB, id))))
  })

  app.patch('/api/admin/endpoints/:id', async (c) => {
    const id = c.req.param('id')
    const current = await requireEndpoint(c.env.DB, id)
    const body = await readBody(c)
    const sets: string[] = []
    const values: unknown[] = []
    const nextPath = 'path' in body ? readEndpointPath(body.path) : current.path
    if ('path' in body || 'request_json' in body) {
      const requestValue = 'request_json' in body ? body.request_json : JSON.parse(current.request_json)
      sets.push('request_json = ?')
      values.push(readRequest(requestValue, nextPath))
    }
    if ('platform_id' in body) {
      const platformId = readName(body.platform_id, '请填写平台')
      await requirePlatform(c.env.DB, platformId)
      sets.push('platform_id = ?')
      values.push(platformId)
    }
    if ('name' in body) {
      sets.push('name = ?')
      values.push(readName(body.name))
    }
    if ('method' in body) {
      sets.push('method = ?')
      values.push(readMethod(body.method))
    }
    if ('path' in body) {
      sets.push('path = ?')
      values.push(nextPath)
    }
    if ('mapping_json' in body) {
      sets.push('mapping_json = ?')
      values.push(readMapping(body.mapping_json))
    }
    if ('status' in body) {
      sets.push('status = ?')
      values.push(readStatus(body.status))
    }
    if ('note' in body) {
      sets.push('note = ?')
      values.push(readNote(body.note))
    }
    if (sets.length === 0) throw new HttpError('没有要改的', 400)
    await c.env.DB.prepare(
      `UPDATE api_endpoints SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(...values, id)
      .run()
    return c.json(ok(presentEndpoint(await requireEndpoint(c.env.DB, id))))
  })

  app.delete('/api/admin/endpoints/:id', async (c) => {
    const id = c.req.param('id')
    await requireEndpoint(c.env.DB, id)
    await c.env.DB.prepare(`DELETE FROM api_endpoints WHERE id = ?`).bind(id).run()
    return c.json(ok({ id }))
  })

  app.get('/api/admin/menus', async (c) => {
    const kind = c.req.query('kind') ?? ''
    const ref = c.req.query('ref') ?? ''
    const filters: string[] = []
    const values: string[] = []
    if (kind) {
      filters.push('kind = ?')
      values.push(kind)
    }
    if (ref) {
      filters.push('ref = ?')
      values.push(ref)
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const result = await c.env.DB.prepare(
      `SELECT id, endpoint_id, kind, ref, group_title, sort, note, created_at, updated_at
       FROM api_menus ${where} ORDER BY kind, ref, sort, id`,
    )
      .bind(...values)
      .all<MenuRow>()
    return c.json(ok(result.results))
  })

  app.post('/api/admin/menus', async (c) => {
    const body = await readBody(c)
    const endpointId = readName(body.endpoint_id, '请选择接口')
    await requireEndpoint(c.env.DB, endpointId)
    const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : crypto.randomUUID()
    await c.env.DB.prepare(
      `INSERT INTO api_menus (id, endpoint_id, kind, ref, group_title, sort, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, endpointId, readKind(body.kind), readName(body.ref, '请填写用在哪'), readGroup(body.group_title), readSort(body.sort), readNote(body.note))
      .run()
    return c.json(ok(await requireMenu(c.env.DB, id)))
  })

  app.patch('/api/admin/menus/:id', async (c) => {
    const id = c.req.param('id')
    await requireMenu(c.env.DB, id)
    const body = await readBody(c)
    const sets: string[] = []
    const values: unknown[] = []
    if ('endpoint_id' in body) {
      const endpointId = readName(body.endpoint_id, '请选择接口')
      await requireEndpoint(c.env.DB, endpointId)
      sets.push('endpoint_id = ?')
      values.push(endpointId)
    }
    if ('kind' in body) {
      sets.push('kind = ?')
      values.push(readKind(body.kind))
    }
    if ('ref' in body) {
      sets.push('ref = ?')
      values.push(readName(body.ref, '请填写用在哪'))
    }
    if ('group_title' in body) {
      sets.push('group_title = ?')
      values.push(readGroup(body.group_title))
    }
    if ('sort' in body) {
      sets.push('sort = ?')
      values.push(readSort(body.sort))
    }
    if ('note' in body) {
      sets.push('note = ?')
      values.push(readNote(body.note))
    }
    if (sets.length === 0) throw new HttpError('没有要改的', 400)
    await c.env.DB.prepare(`UPDATE api_menus SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`)
      .bind(...values, id)
      .run()
    return c.json(ok(await requireMenu(c.env.DB, id)))
  })

  app.delete('/api/admin/menus/:id', async (c) => {
    const id = c.req.param('id')
    await requireMenu(c.env.DB, id)
    await c.env.DB.prepare(`DELETE FROM api_menus WHERE id = ?`).bind(id).run()
    return c.json(ok({ id }))
  })

  app.post('/api/admin/endpoints/:id/try', async (c) => {
    const endpoint = await requireEndpoint(c.env.DB, c.req.param('id'))
    const body = await c.req.json().catch(() => ({}))
    const supplied = readTryParams(body)
    const request = JSON.parse(endpoint.request_json) as { entry?: string; params?: Record<string, { from?: string }> }
    const entry = request.entry === 'POST' ? 'POST' : 'GET'
    const url = new URL(`https://cf-worker/api/catalog/${encodeURIComponent(endpoint.id)}`)
    const headers = new Headers()
    if (entry === 'POST') headers.set('content-type', 'application/json')
    const outboundBody: Record<string, string> = {}
    for (const [name, spec] of Object.entries(request.params ?? {})) {
      const value = supplied[name]
      if (!value) throw new HttpError('还缺参数', 400)
      if (spec.from === 'query') url.searchParams.set(name, value)
      else if (spec.from === 'header') headers.set(name, value)
      else outboundBody[name] = value
    }
    let response: Response
    try {
      response = await c.env.CF_WORKER.fetch(
        new Request(url, {
          method: entry,
          headers,
          body: entry === 'POST' ? JSON.stringify(outboundBody) : undefined,
        }),
      )
    } catch {
      throw new HttpError('调用没连上', 502)
    }
    return new Response(response.body, { status: response.status, headers: response.headers })
  })
}

async function listPlatforms(db: AppDatabase) {
  const result = await db
    .prepare(`SELECT ${PLATFORM_COLUMNS} FROM api_platforms ORDER BY updated_at DESC, id`)
    .all<PlatformRow>()
  return result.results
}

async function requirePlatform(db: AppDatabase, id: string) {
  const result = await db
    .prepare(`SELECT ${PLATFORM_COLUMNS} FROM api_platforms WHERE id = ?`)
    .bind(id)
    .all<PlatformRow>()
  const row = result.results[0]
  if (!row) throw new HttpError('平台不存在', 404)
  return row
}

async function requireMenu(db: AppDatabase, id: string) {
  const result = await db
    .prepare(
      `SELECT id, endpoint_id, kind, ref, group_title, sort, note, created_at, updated_at
       FROM api_menus WHERE id = ?`,
    )
    .bind(id)
    .all<MenuRow>()
  const row = result.results[0]
  if (!row) throw new HttpError('菜单不存在', 404)
  return row
}

async function requireEndpoint(db: AppDatabase, id: string) {
  const result = await db
    .prepare(`SELECT ${ENDPOINT_COLUMNS} FROM api_endpoints WHERE id = ?`)
    .bind(id)
    .all<EndpointRow>()
  const row = result.results[0]
  if (!row) throw new HttpError('接口不存在', 404)
  return row
}

function presentPlatform(row: PlatformRow) {
  return { ...row, auth_json: JSON.parse(row.auth_json) as unknown }
}

function presentEndpoint(row: EndpointRow) {
  return {
    ...row,
    request_json: JSON.parse(row.request_json) as unknown,
    mapping_json: parseStoredMapping(row.mapping_json),
  }
}

function parseStoredMapping(value: string | null) {
  if (value === null) return null
  const parsed = JSON.parse(value) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError('这份映射坏了', 500)
  }
  return parsed as Record<string, string>
}

async function readBody(c: Context<AppEnv>) {
  const body = await c.req.json().catch(() => {
    throw new HttpError('请求体不是 JSON', 400)
  })
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError('请求体不是 JSON', 400)
  return body as Record<string, unknown>
}

function readName(value: unknown, message = '请填写名称') {
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(message, 400)
  return value.trim()
}

function readKind(value: unknown) {
  if (value === undefined || value === null || value === '') return 'page'
  if (typeof value !== 'string' || !value.trim()) throw new HttpError('请填写给谁用', 400)
  return value.trim()
}

function readGroup(value: unknown) {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw new HttpError('分组要是文字', 400)
  return value.trim()
}

function readSort(value: unknown) {
  if (value === undefined || value === null || value === '') return 100
  const sort = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(sort)) throw new HttpError('排序要是整数', 400)
  return sort
}

function readNote(value: unknown) {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw new HttpError('备注要是文字', 400)
  return value.trim()
}

function readStatus(value: unknown, fallback?: 'enabled' | 'disabled') {
  if (value === undefined && fallback) return fallback
  if (value !== 'enabled' && value !== 'disabled') throw new HttpError('没有这个状态', 400)
  return value
}

function readBaseUrl(value: unknown) {
  if (typeof value !== 'string') throw new HttpError('根地址需要是 http 或 https', 400)
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new HttpError('根地址需要是 http 或 https', 400)
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
    throw new HttpError('根地址需要是 http 或 https', 400)
  }
  return url.origin
}

function readEndpointPath(value: unknown) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('?') ||
    value.includes('#') ||
    value.includes('\\')
  ) {
    throw new HttpError('路径要以 / 开头', 400)
  }
  return value
}

function readMethod(value: unknown, fallback?: string) {
  const method = (typeof value === 'string' ? value : fallback ?? '').toUpperCase()
  if (!METHODS.has(method)) throw new HttpError('没有这个方法', 400)
  return method
}

function readAuth(value: unknown) {
  if (value === undefined || value === null) return '{}'
  if (typeof value !== 'object' || Array.isArray(value)) throw new HttpError('鉴权要是对象', 400)
  const record = value as Record<string, unknown>
  if (Object.keys(record).length === 0) return '{}'
  return JSON.stringify({
    header: readStringMap(record.header, '鉴权请求头要是对象'),
    query: readStringMap(record.query, '鉴权查询要是对象'),
  })
}

function readStringMap(value: unknown, message: string) {
  if (value === undefined) return {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(message, 400)
  const out: Record<string, string> = {}
  for (const [key, item] of Object.entries(value)) {
    if (!key.trim() || typeof item !== 'string') throw new HttpError(message, 400)
    out[key] = item
  }
  return out
}

function readRequest(value: unknown, path: string) {
  if (value === undefined || value === null) return '{}'
  if (typeof value !== 'object' || Array.isArray(value)) throw new HttpError('请求配置要是对象', 400)
  const record = value as Record<string, unknown>
  if (Object.keys(record).length === 0) return '{}'
  const entry = record.entry === undefined ? 'GET' : record.entry
  if (entry !== 'GET' && entry !== 'POST') throw new HttpError('入口只接受 GET 或 POST', 400)
  const paramsIn = record.params === undefined ? {} : record.params
  if (!paramsIn || typeof paramsIn !== 'object' || Array.isArray(paramsIn)) {
    throw new HttpError('参数配置要是对象', 400)
  }
  const params: Record<string, { from: string; in: string; as: string }> = {}
  for (const [name, spec] of Object.entries(paramsIn)) {
    if (!/^[A-Za-z0-9_-]+$/.test(name)) throw new HttpError('参数名不对', 400)
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new HttpError('参数配置要是对象', 400)
    const item = spec as Record<string, unknown>
    if (item.from !== 'query' && item.from !== 'body' && item.from !== 'header') {
      throw new HttpError('参数来源不对', 400)
    }
    if (item.in !== 'query' && item.in !== 'path' && item.in !== 'header' && item.in !== 'body') {
      throw new HttpError('参数去向不对', 400)
    }
    if (typeof item.as !== 'string' || !/^[A-Za-z0-9_-]+$/.test(item.as)) throw new HttpError('对方字段名不对', 400)
    if (item.from === 'body' && entry !== 'POST') throw new HttpError('正文参数要走 POST', 400)
    if (item.in === 'path' && !path.includes(`{${item.as}}`)) throw new HttpError('路径里没有这个空位', 400)
    params[name] = { from: item.from, in: item.in, as: item.as }
  }
  const fixedIn =
    record.fixed === undefined ? {} : (record.fixed as Record<string, unknown>)
  if (!fixedIn || typeof fixedIn !== 'object' || Array.isArray(fixedIn)) throw new HttpError('固定部分要是对象', 400)
  const body = fixedIn.body === undefined || fixedIn.body === null ? null : readPlainObject(fixedIn.body)
  return JSON.stringify({
    entry,
    params,
    fixed: {
      query: readStringMap(fixedIn.query, '固定查询要是对象'),
      header: readStringMap(fixedIn.header, '固定请求头要是对象'),
      body,
    },
  })
}

function readPlainObject(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError('固定正文要是对象', 400)
  const out: Record<string, string | number | boolean> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'string' && typeof item !== 'number' && typeof item !== 'boolean') {
      throw new HttpError('固定正文要是字符串、数字或布尔', 400)
    }
    out[key] = item
  }
  return out
}

function readTryParams(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const params = (value as Record<string, unknown>).params
  if (params === undefined) return {}
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new HttpError('参数要是对象', 400)
  const out: Record<string, string> = {}
  for (const [key, item] of Object.entries(params)) {
    if (typeof item !== 'string' || !item.trim()) throw new HttpError('参数要是文字', 400)
    out[key] = item
  }
  return out
}

function readMapping(value: unknown) {
  if (value === undefined || value === null) return null
  if (typeof value !== 'object' || Array.isArray(value)) throw new HttpError('映射要是对象或 null', 400)
  const record = value as Record<string, unknown>
  const stored: Record<string, string> = {}
  for (const [key, path] of Object.entries(record)) {
    if (typeof path !== 'string' || !path.trim()) throw new HttpError('映射路径不对', 400)
    pathParts(key)
    pathParts(path.trim())
    stored[key] = path.trim()
  }
  return JSON.stringify(stored)
}

function sameToken(actual: string, expected: string) {
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < actual.length; i += 1) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}
