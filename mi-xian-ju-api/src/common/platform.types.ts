export type PlatformStatus = 'enabled' | 'disabled'

export type AdapterType = 'builtin' | 'http_custom'

export type ApiFunctionRow = {
  id: string
  code: string
  name: string
  method: string
  description: string
  params_schema_json: string | null
  default_params_json: string | null
  response_type: string
  is_public: number
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiSourceRow = {
  id: string
  code: string
  name: string
  base_url: string
  status: PlatformStatus
  timeout_ms: number
  rate_limit_json: string | null
  created_at: string
  updated_at: string
}

export type ApiAdapterRow = {
  id: string
  source_id: string
  code: string
  name: string
  type: AdapterType
  builtin_key: string | null
  method: string
  url_template: string | null
  headers_json: string | null
  query_template_json: string | null
  body_template: string | null
  timeout_ms: number
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiFunctionAdapterRow = {
  id: string
  function_id: string
  adapter_id: string
  priority: number
  weight: number
  fallback_enabled: number
  fixed_params_json: string | null
  default_params_json: string | null
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiResponseMapRow = {
  id: string
  function_id: string | null
  adapter_id: string
  data_path: string | null
  items_path: string | null
  fields_json: string | null
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiFunctionAdapterConfig = {
  binding: ApiFunctionAdapterRow
  adapter: ApiAdapterRow
  source: ApiSourceRow
  responseMap: ApiResponseMapRow | null
}

export type AdminUserRow = {
  id: string
  username: string
  password_hash: string
  display_name: string
  status: PlatformStatus
  created_at: string
  updated_at: string
  last_login_at: string | null
}

export type AdminSessionRow = {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  created_at: string
  revoked_at: string | null
}

export type ApiFunctionSummary = Omit<ApiFunctionRow, 'params_schema_json' | 'default_params_json'> & {
  paramsSchema: Record<string, unknown> | null
  defaultParams: Record<string, unknown>
}
