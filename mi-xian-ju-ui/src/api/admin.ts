import { get, patch, post } from '@/api/http'
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
  rate_limit_json?: string | null
}

export interface AdminAdapterConfig {
  id: string
  source_id: string
  code: string
  name: string
  type: string
  builtin_key: string | null
  method: string
  url_template: string | null
  headers_json: string | null
  query_template_json: string | null
  body_template: string | null
  body_type: string
  timeout_ms: number
  status: string
  source_code: string
  source_name: string
}

export interface AdminFunctionParamConfig {
  id: string
  function_id: string
  function_code: string
  function_name: string
  param_key: string
  label: string
  source: string
  type: string
  required: number
  description: string
  sort: number
  status: string
  defaultValue?: unknown
  allowValues: unknown[]
}

export interface AdminFunctionRouteConfig {
  id: string
  function_id: string
  function_code: string
  function_name: string
  route_key: string
  name: string
  match: Record<string, unknown>
  defaultParams: Record<string, unknown>
  sort: number
  status: string
}

export interface AdminAdapterParamMapConfig {
  id: string
  function_id: string
  adapter_id: string
  route_id: string | null
  function_code: string
  function_name: string
  adapter_code: string
  adapter_name: string
  route_key: string | null
  route_name: string | null
  public_param: string
  target: string
  target_key: string
  template: string | null
  status: string
  defaultValue?: unknown
}

export interface AdminFunctionAdapterConfig {
  id: string
  function_id: string
  adapter_id: string
  route_id: string | null
  route_key: string | null
  route_name: string | null
  function_code: string
  function_name: string
  adapter_code: string
  adapter_name: string
  source_code: string
  source_name: string
  priority: number
  weight: number
  fallback_enabled: number
  status: string
  fixedParams: Record<string, unknown>
  defaultParams: Record<string, unknown>
}

export interface AdminResponseMapConfig {
  id: string
  function_id: string | null
  adapter_id: string
  function_code: string | null
  function_name: string | null
  adapter_code: string
  adapter_name: string
  data_path: string | null
  items_path: string | null
  fields: Record<string, unknown>
  status: string
}

export interface AdminMenuConfig {
  id: string
  parent_id: string | null
  scope: string
  module: string
  title: string
  subtitle: string | null
  icon: string | null
  path: string | null
  i18n_key: string | null
  sort: number
  status: string
  payload: Record<string, unknown>
}

export interface AdminConfigResponse {
  functions: AdminFunctionConfig[]
  sources: AdminSourceConfig[]
  adapters: AdminAdapterConfig[]
  functionAdapters: AdminFunctionAdapterConfig[]
  functionParams: AdminFunctionParamConfig[]
  functionRoutes: AdminFunctionRouteConfig[]
  adapterParamMaps: AdminAdapterParamMapConfig[]
  responseMaps: AdminResponseMapConfig[]
  menus: AdminMenuConfig[]
}

export interface AdminFunctionDebugAttempt {
  bindingId: string
  adapterId: string
  adapterCode: string
  adapterName: string
  sourceCode: string
  sourceName: string
  priority: number
  fallbackEnabled: boolean
  method: string
  url?: string
  requestParams?: Record<string, unknown>
  queryParams?: Record<string, unknown>
  bodyParams?: Record<string, unknown>
  responseStatus?: number
  durationMs: number
  success: boolean
  error?: string
  rawResponse?: unknown
  mappedResponse?: unknown
  normalizedResponse?: unknown
}

export interface AdminFunctionDebugResponse {
  code: string
  name: string
  method: string
  responseType: string
  inputParams: Record<string, unknown>
  publicParams: Record<string, unknown>
  route: {
    id: string
    routeKey: string
    name: string
    match: Record<string, unknown>
    defaultParams: Record<string, unknown>
  } | null
  adapters: Array<{
    bindingId: string
    adapterCode: string
    adapterName: string
    sourceCode: string
    priority: number
    fallbackEnabled: boolean
  }>
  attempts: AdminFunctionDebugAttempt[]
  durationMs: number
  result?: {
    code: string
    name: string
    responseType: string
    data: unknown
  }
  errors: string[]
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

export function debugAdminFunction(data: {
  code: string
  method: string
  params: Record<string, unknown>
}) {
  return post<ApiResult<AdminFunctionDebugResponse>>('/admin/functions/debug', data, {
    headers: authHeaders(),
    timeout: 30000,
  })
}

export function updateAdminFunction(
  id: string,
  data: AdminFunctionPayload,
) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/functions/${id}`, data, {
    headers: authHeaders(),
  })
}

export function updateAdminFunctionAdapter(
  id: string,
  data: AdminFunctionAdapterPayload,
) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/function-adapters/${id}`, data, {
    headers: authHeaders(),
  })
}

export interface AdminFunctionPayload {
  code?: string
  name?: string
  method?: string
  description?: string
  paramsSchema?: Record<string, unknown> | null
  defaultParams?: Record<string, unknown>
  responseType?: string
  isPublic?: boolean
  status?: string
}

export interface AdminFunctionAdapterPayload {
  functionId?: string
  adapterId?: string
  routeId?: string | null
  status?: string
  priority?: number
  weight?: number
  fallbackEnabled?: boolean
  defaultParams?: Record<string, unknown>
  fixedParams?: Record<string, unknown>
}

export function createAdminFunction(data: AdminFunctionPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/functions', data, {
    headers: authHeaders(),
  })
}

export function createAdminFunctionAdapter(data: AdminFunctionAdapterPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/function-adapters', data, {
    headers: authHeaders(),
  })
}

export interface AdminSourcePayload {
  code?: string
  name?: string
  baseUrl?: string
  status?: string
  timeoutMs?: number
  rateLimit?: Record<string, unknown>
}

export interface AdminAdapterPayload {
  sourceId?: string
  code?: string
  name?: string
  type?: string
  builtinKey?: string | null
  method?: string
  urlTemplate?: string | null
  headers?: Record<string, unknown>
  queryTemplate?: Record<string, unknown>
  bodyTemplate?: string | null
  bodyType?: string
  timeoutMs?: number
  status?: string
}

export function createAdminSource(data: AdminSourcePayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/sources', data, {
    headers: authHeaders(),
  })
}

export function updateAdminSource(id: string, data: AdminSourcePayload) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/sources/${id}`, data, {
    headers: authHeaders(),
  })
}

export function createAdminAdapter(data: AdminAdapterPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/adapters', data, {
    headers: authHeaders(),
  })
}

export function updateAdminAdapter(id: string, data: AdminAdapterPayload) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/adapters/${id}`, data, {
    headers: authHeaders(),
  })
}

export interface AdminFunctionParamPayload {
  functionId?: string
  paramKey?: string
  label?: string
  source?: string
  type?: string
  required?: boolean
  defaultValue?: unknown
  allowValues?: unknown[]
  description?: string
  sort?: number
  status?: string
}

export interface AdminFunctionRoutePayload {
  functionId?: string
  routeKey?: string
  name?: string
  match?: Record<string, unknown>
  defaultParams?: Record<string, unknown>
  sort?: number
  status?: string
}

export interface AdminAdapterParamMapPayload {
  functionId?: string
  adapterId?: string
  routeId?: string | null
  publicParam?: string
  target?: string
  targetKey?: string
  template?: string | null
  defaultValue?: unknown
  status?: string
}

export function createAdminFunctionParam(data: AdminFunctionParamPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/function-params', data, {
    headers: authHeaders(),
  })
}

export function updateAdminFunctionParam(id: string, data: AdminFunctionParamPayload) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/function-params/${id}`, data, {
    headers: authHeaders(),
  })
}

export function createAdminFunctionRoute(data: AdminFunctionRoutePayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/function-routes', data, {
    headers: authHeaders(),
  })
}

export function updateAdminFunctionRoute(id: string, data: AdminFunctionRoutePayload) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/function-routes/${id}`, data, {
    headers: authHeaders(),
  })
}

export function createAdminAdapterParamMap(data: AdminAdapterParamMapPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/adapter-param-maps', data, {
    headers: authHeaders(),
  })
}

export function updateAdminAdapterParamMap(id: string, data: AdminAdapterParamMapPayload) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/adapter-param-maps/${id}`, data, {
    headers: authHeaders(),
  })
}

export interface AdminResponseMapPayload {
  functionId?: string | null
  adapterId?: string
  dataPath?: string | null
  itemsPath?: string | null
  fields?: Record<string, unknown>
  status?: string
}

export interface AdminMenuPayload {
  id?: string
  parentId?: string | null
  scope?: string
  module?: string
  title?: string
  subtitle?: string | null
  icon?: string | null
  path?: string | null
  i18nKey?: string | null
  sort?: number
  status?: string
  payload?: Record<string, unknown>
}

export interface AdminMenuImportPayload {
  scope?: string
  module?: string
  replace?: boolean
}

export function createAdminResponseMap(data: AdminResponseMapPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/response-maps', data, {
    headers: authHeaders(),
  })
}

export function updateAdminResponseMap(id: string, data: AdminResponseMapPayload) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/response-maps/${id}`, data, {
    headers: authHeaders(),
  })
}

export function createAdminMenu(data: AdminMenuPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/menus', data, {
    headers: authHeaders(),
  })
}

export function updateAdminMenu(id: string, data: AdminMenuPayload) {
  return patch<ApiResult<AdminConfigResponse>>(`/admin/menus/${id}`, data, {
    headers: authHeaders(),
  })
}

export function importAdminMenus(data: AdminMenuImportPayload) {
  return post<ApiResult<AdminConfigResponse>>('/admin/menus/import', data, {
    headers: authHeaders(),
  })
}
