const TOKEN_KEY = 'mxj-admin-token'

export type Platform = {
  id: string
  name: string
  base_url: string
  auth_json: { header?: Record<string, string>; query?: Record<string, string> }
  status: 'enabled' | 'disabled'
  note: string
}

export type Endpoint = {
  id: string
  platform_id: string
  name: string
  method: string
  path: string
  request_json: Record<string, unknown>
  mapping_json: Record<string, string> | null
  status: 'enabled' | 'disabled'
  note: string
}

export type MenuItem = {
  id: string
  endpoint_id: string
  kind: string
  ref: string
  group_title: string
  sort: number
  note: string
}

export function readAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) ?? ''
}

export function saveAdminToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token.trim())
}

async function admin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readAdminToken()
  const response = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const body = (await response.json().catch(() => ({}))) as { code?: number; msg?: string; data?: T }
  if (!response.ok || body.code) throw new Error(body.msg || '没办成')
  return body.data as T
}

export const fetchPlatforms = () => admin<Platform[]>('/api/admin/platforms')
export const fetchEndpoints = () => admin<Endpoint[]>('/api/admin/endpoints')
export const fetchMenus = () => admin<MenuItem[]>('/api/admin/menus')

export const createPlatform = (body: unknown) =>
  admin<Platform>('/api/admin/platforms', { method: 'POST', body: JSON.stringify(body) })
export const updatePlatform = (id: string, body: unknown) =>
  admin<Platform>(`/api/admin/platforms/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const removePlatform = (id: string) => admin(`/api/admin/platforms/${id}`, { method: 'DELETE' })

export const createEndpoint = (body: unknown) =>
  admin<Endpoint>('/api/admin/endpoints', { method: 'POST', body: JSON.stringify(body) })
export const updateEndpoint = (id: string, body: unknown) =>
  admin<Endpoint>(`/api/admin/endpoints/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const removeEndpoint = (id: string) => admin(`/api/admin/endpoints/${id}`, { method: 'DELETE' })

export const createMenu = (body: unknown) =>
  admin<MenuItem>('/api/admin/menus', { method: 'POST', body: JSON.stringify(body) })
export const updateMenu = (id: string, body: unknown) =>
  admin<MenuItem>(`/api/admin/menus/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const removeMenu = (id: string) => admin(`/api/admin/menus/${id}`, { method: 'DELETE' })

export async function tryEndpoint(id: string, params: Record<string, string>) {
  const token = readAdminToken()
  const response = await fetch(`/api/admin/endpoints/${id}/try`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ params }),
  })
  const type = response.headers.get('content-type') ?? ''
  if (type.startsWith('image/') || type.startsWith('video/')) {
    await response.body?.cancel()
    const url = response.headers.get('x-final-url') ?? ''
    if (!response.ok) throw new Error('没试通')
    return url || '拿到了文件'
  }
  const text = await response.text()
  if (!response.ok) {
    let message = '没试通'
    try {
      const body = JSON.parse(text) as { msg?: string; message?: string }
      message = body.msg || body.message || message
    } catch {
      message = '没试通'
    }
    throw new Error(message)
  }
  return text
}
