export type PlatformStatus = 'enabled' | 'disabled'

export type AdapterType = 'builtin' | 'http_custom'

export type FunctionParamSource = 'query' | 'body' | 'any'

export type FunctionParamType = 'string' | 'number' | 'boolean' | 'json'

export type AdapterBodyType = 'none' | 'json' | 'form' | 'text'

export type AdapterParamMapTarget = 'param' | 'query' | 'header' | 'body'

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
  body_type: AdapterBodyType
  timeout_ms: number
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiFunctionAdapterRow = {
  id: string
  function_id: string
  adapter_id: string
  route_id: string | null
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

export type ApiFunctionParamRow = {
  id: string
  function_id: string
  param_key: string
  label: string
  source: FunctionParamSource
  type: FunctionParamType
  required: number
  default_value_json: string | null
  allow_values_json: string | null
  description: string
  sort: number
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiFunctionRouteRow = {
  id: string
  function_id: string
  route_key: string
  name: string
  match_json: string
  default_params_json: string | null
  sort: number
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiAdapterParamMapRow = {
  id: string
  function_id: string
  adapter_id: string
  route_id: string | null
  public_param: string
  target: AdapterParamMapTarget
  target_key: string
  template: string | null
  default_value_json: string | null
  status: PlatformStatus
  created_at: string
  updated_at: string
}

export type ApiMenuRow = {
  id: string
  parent_id: string | null
  scope: 'top' | 'side'
  module: string
  title: string
  subtitle: string | null
  icon: string | null
  path: string | null
  i18n_key: string | null
  sort: number
  status: PlatformStatus
  payload_json: string | null
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

export type ApiFunctionAdapterSummary = Omit<
  ApiFunctionAdapterRow,
  'fixed_params_json' | 'default_params_json'
> & {
  route_key: string | null
  route_name: string | null
  function_code: string
  function_name: string
  adapter_code: string
  adapter_name: string
  source_code: string
  source_name: string
  fixedParams: Record<string, unknown>
  defaultParams: Record<string, unknown>
}

export type ApiFunctionParamSummary = Omit<
  ApiFunctionParamRow,
  'default_value_json' | 'allow_values_json'
> & {
  function_code: string
  function_name: string
  defaultValue: unknown
  allowValues: unknown[]
}

export type ApiFunctionRouteSummary = Omit<
  ApiFunctionRouteRow,
  'match_json' | 'default_params_json'
> & {
  function_code: string
  function_name: string
  match: Record<string, unknown>
  defaultParams: Record<string, unknown>
}

export type ApiAdapterParamMapSummary = Omit<
  ApiAdapterParamMapRow,
  'default_value_json'
> & {
  function_code: string
  function_name: string
  adapter_code: string
  adapter_name: string
  route_key: string | null
  route_name: string | null
  defaultValue: unknown
}

export type ApiResponseMapSummary = Omit<ApiResponseMapRow, 'fields_json'> & {
  function_code: string | null
  function_name: string | null
  adapter_code: string
  adapter_name: string
  fields: Record<string, unknown>
}

export type ApiMenuSummary = Omit<ApiMenuRow, 'payload_json'> & {
  payload: Record<string, unknown>
}

export type ApiMenuTreeSummary = ApiMenuSummary & {
  children?: ApiMenuTreeSummary[]
}
