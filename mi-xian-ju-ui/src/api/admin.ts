import { get, post } from '@/api/http'
import { useUserStore } from '@/store/user'
import type { ApiResult } from '@/types/global'

export interface AdminUser {
  id: string
  username: string
  displayName: string
}

export interface AdminLoginResponse {
  token: string
  expiresAt: string
  user: AdminUser
}

export interface AdminFunctionConfig {
  id: string
  code: string
  name: string
  method: string
  description: string
  response_type: string
  is_public: number
  status: string
  paramsSchema: Record<string, unknown> | null
  defaultParams: Record<string, unknown>
}

export interface AdminSourceConfig {
  id: string
  code: string
  name: string
  base_url: string
  status: string
  timeout_ms: number
}

export interface AdminAdapterConfig {
  id: string
  code: string
  name: string
  type: string
  method: string
  status: string
  source_code: string
  source_name: string
}

export interface AdminConfigResponse {
  functions: AdminFunctionConfig[]
  sources: AdminSourceConfig[]
  adapters: AdminAdapterConfig[]
}

function authHeaders() {
  const userStore = useUserStore()
  return {
    Authorization: `Bearer ${userStore.token}`,
  }
}

export function loginAdmin(username: string, password: string) {
  return post<ApiResult<AdminLoginResponse>>(
    '/admin/auth/login',
    { username, password },
    { timeout: 30000 },
  )
}

export function fetchAdminConfig() {
  return get<ApiResult<AdminConfigResponse>>('/admin/config', {
    headers: authHeaders(),
  })
}
