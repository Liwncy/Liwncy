import type {
  AdminSessionRow,
  AdminUserRow,
  ApiAdapterRow,
  ApiAdapterParamMapRow,
  ApiAdapterParamMapSummary,
  ApiFunctionAdapterConfig,
  ApiFunctionRow,
  ApiFunctionAdapterSummary,
  ApiFunctionAdapterRow,
  ApiFunctionParamRow,
  ApiFunctionParamSummary,
  ApiFunctionRouteRow,
  ApiFunctionRouteSummary,
  ApiFunctionSummary,
  ApiMenuRow,
  ApiMenuSummary,
  ApiMenuTreeSummary,
  ApiResponseMapRow,
  ApiResponseMapSummary,
  ApiSourceRow,
} from '../common/platform.types'

function parseJsonObject(value: string | null): Record<string, unknown> {
  if (!value) return {}
  const parsed = JSON.parse(value) as unknown
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
}

function parseJsonValue(value: string | null): unknown {
  if (!value) return undefined
  return JSON.parse(value) as unknown
}

function parseJsonArray(value: string | null): unknown[] {
  if (!value) return []
  const parsed = JSON.parse(value) as unknown
  return Array.isArray(parsed) ? parsed : []
}

/** D1 平台配置访问层。 */
export class D1PlatformRepository {
  constructor(private readonly db: D1Database) {}

  async findFunctionByCode(code: string): Promise<ApiFunctionRow | null> {
    return this.db
      .prepare('SELECT * FROM api_functions WHERE code = ? AND status = ? LIMIT 1')
      .bind(code, 'enabled')
      .first<ApiFunctionRow>()
  }

  async listFunctions(): Promise<ApiFunctionSummary[]> {
    const result = await this.db
      .prepare('SELECT * FROM api_functions ORDER BY code ASC')
      .all<ApiFunctionRow>()

    return result.results.map((row) => ({
      ...row,
      paramsSchema: row.params_schema_json ? parseJsonObject(row.params_schema_json) : null,
      defaultParams: parseJsonObject(row.default_params_json),
    }))
  }

  async listSources(): Promise<ApiSourceRow[]> {
    const result = await this.db.prepare('SELECT * FROM api_sources ORDER BY code ASC').all<ApiSourceRow>()
    return result.results
  }

  async listAdapters(): Promise<Array<ApiAdapterRow & { source_code: string; source_name: string }>> {
    const result = await this.db
      .prepare(
        `SELECT a.*, s.code AS source_code, s.name AS source_name
         FROM api_adapters a
         INNER JOIN api_sources s ON s.id = a.source_id
         ORDER BY a.code ASC`,
      )
      .all<ApiAdapterRow & { source_code: string; source_name: string }>()

    return result.results
  }

  async listFunctionParams(functionId: string): Promise<ApiFunctionParamRow[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM api_function_params
         WHERE function_id = ?
           AND status = 'enabled'
         ORDER BY sort ASC, param_key ASC`,
      )
      .bind(functionId)
      .all<ApiFunctionParamRow>()

    return result.results
  }

  async listFunctionRoutes(functionId: string): Promise<ApiFunctionRouteRow[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM api_function_routes
         WHERE function_id = ?
           AND status = 'enabled'
         ORDER BY sort ASC, route_key ASC`,
      )
      .bind(functionId)
      .all<ApiFunctionRouteRow>()

    return result.results
  }

  async listParamMaps(functionId: string, adapterId: string, routeId: string | null): Promise<ApiAdapterParamMapRow[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM api_adapter_param_maps
         WHERE function_id = ?
           AND adapter_id = ?
           AND status = 'enabled'
           AND (route_id = ? OR route_id IS NULL)
         ORDER BY route_id DESC, target ASC, target_key ASC`,
      )
      .bind(functionId, adapterId, routeId)
      .all<ApiAdapterParamMapRow>()

    return result.results
  }

  async listFunctionParamSummaries(): Promise<ApiFunctionParamSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT p.*, f.code AS function_code, f.name AS function_name
         FROM api_function_params p
         INNER JOIN api_functions f ON f.id = p.function_id
         ORDER BY f.code ASC, p.sort ASC, p.param_key ASC`,
      )
      .all<ApiFunctionParamRow & { function_code: string; function_name: string }>()

    return result.results.map((row) => ({
      ...row,
      function_code: row.function_code,
      function_name: row.function_name,
      defaultValue: parseJsonValue(row.default_value_json),
      allowValues: parseJsonArray(row.allow_values_json),
    }))
  }

  async listFunctionRouteSummaries(): Promise<ApiFunctionRouteSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT r.*, f.code AS function_code, f.name AS function_name
         FROM api_function_routes r
         INNER JOIN api_functions f ON f.id = r.function_id
         ORDER BY f.code ASC, r.sort ASC, r.route_key ASC`,
      )
      .all<ApiFunctionRouteRow & { function_code: string; function_name: string }>()

    return result.results.map((row) => ({
      ...row,
      function_code: row.function_code,
      function_name: row.function_name,
      match: parseJsonObject(row.match_json),
      defaultParams: parseJsonObject(row.default_params_json),
    }))
  }

  async listAdapterParamMapSummaries(): Promise<ApiAdapterParamMapSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT
           pm.*,
           f.code AS function_code,
           f.name AS function_name,
           a.code AS adapter_code,
           a.name AS adapter_name,
           r.route_key,
           r.name AS route_name
         FROM api_adapter_param_maps pm
         INNER JOIN api_functions f ON f.id = pm.function_id
         INNER JOIN api_adapters a ON a.id = pm.adapter_id
         LEFT JOIN api_function_routes r ON r.id = pm.route_id
         ORDER BY f.code ASC, a.code ASC, r.route_key ASC, pm.target ASC, pm.target_key ASC`,
      )
      .all<ApiAdapterParamMapRow & {
        function_code: string
        function_name: string
        adapter_code: string
        adapter_name: string
        route_key: string | null
        route_name: string | null
      }>()

    return result.results.map((row) => ({
      ...row,
      function_code: row.function_code,
      function_name: row.function_name,
      adapter_code: row.adapter_code,
      adapter_name: row.adapter_name,
      route_key: row.route_key,
      route_name: row.route_name,
      defaultValue: parseJsonValue(row.default_value_json),
    }))
  }

  async listResponseMapSummaries(): Promise<ApiResponseMapSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT
           rm.*,
           f.code AS function_code,
           f.name AS function_name,
           a.code AS adapter_code,
           a.name AS adapter_name
         FROM api_response_maps rm
         LEFT JOIN api_functions f ON f.id = rm.function_id
         INNER JOIN api_adapters a ON a.id = rm.adapter_id
         ORDER BY a.code ASC, f.code ASC`,
      )
      .all<ApiResponseMapRow & {
        function_code: string | null
        function_name: string | null
        adapter_code: string
        adapter_name: string
      }>()

    return result.results.map((row) => ({
      ...row,
      function_code: row.function_code,
      function_name: row.function_name,
      adapter_code: row.adapter_code,
      adapter_name: row.adapter_name,
      fields: parseJsonObject(row.fields_json),
    }))
  }

  async listMenus(): Promise<ApiMenuSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM api_menus
         ORDER BY scope ASC, module ASC, parent_id ASC, sort ASC, title ASC`,
      )
      .all<ApiMenuRow>()

    return result.results.map((row) => ({
      ...row,
      payload: parseJsonObject(row.payload_json),
    }))
  }

  async listMenuTree(scope: 'top' | 'side', module: string): Promise<ApiMenuTreeSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM api_menus
         WHERE scope = ?
           AND module = ?
           AND status = 'enabled'
         ORDER BY sort ASC, title ASC`,
      )
      .bind(scope, module)
      .all<ApiMenuRow>()

    const rows = result.results.map((row) => ({
      ...row,
      payload: parseJsonObject(row.payload_json),
    }))
    const byParent = new Map<string, ApiMenuSummary[]>()
    for (const row of rows) {
      const key = row.parent_id ?? ''
      byParent.set(key, [...(byParent.get(key) ?? []), row])
    }

    const build = (parentId: string | null): ApiMenuTreeSummary[] =>
      (byParent.get(parentId ?? '') ?? []).map((row) => ({
        ...row,
        children: build(row.id),
      }))

    return build(null)
  }

  async listFunctionAdapters(): Promise<ApiFunctionAdapterSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT
           fa.*,
           r.route_key,
           r.name AS route_name,
           f.code AS function_code,
           f.name AS function_name,
           a.code AS adapter_code,
           a.name AS adapter_name,
           s.code AS source_code,
           s.name AS source_name
         FROM api_function_adapters fa
         INNER JOIN api_functions f ON f.id = fa.function_id
         INNER JOIN api_adapters a ON a.id = fa.adapter_id
         INNER JOIN api_sources s ON s.id = a.source_id
         LEFT JOIN api_function_routes r ON r.id = fa.route_id
         ORDER BY f.code ASC, fa.priority ASC, a.code ASC`,
      )
      .all<ApiFunctionAdapterRow & {
        route_key: string | null
        route_name: string | null
        function_code: string
        function_name: string
        adapter_code: string
        adapter_name: string
        source_code: string
        source_name: string
      }>()

    return result.results.map((row) => ({
      id: row.id,
      function_id: row.function_id,
      adapter_id: row.adapter_id,
      route_id: row.route_id,
      priority: row.priority,
      weight: row.weight,
      fallback_enabled: row.fallback_enabled,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      route_key: row.route_key,
      route_name: row.route_name,
      function_code: row.function_code,
      function_name: row.function_name,
      adapter_code: row.adapter_code,
      adapter_name: row.adapter_name,
      source_code: row.source_code,
      source_name: row.source_name,
      fixedParams: parseJsonObject(row.fixed_params_json),
      defaultParams: parseJsonObject(row.default_params_json),
    }))
  }

  async listAdapterConfigs(functionId: string, routeId: string | null): Promise<ApiFunctionAdapterConfig[]> {
    const result = await this.db
      .prepare(
        `SELECT
           fa.id AS binding_id,
           fa.function_id,
           fa.adapter_id,
           fa.route_id,
           fa.priority,
           fa.weight,
           fa.fallback_enabled,
           fa.fixed_params_json,
           fa.default_params_json,
           fa.status AS binding_status,
           fa.created_at AS binding_created_at,
           fa.updated_at AS binding_updated_at,
           a.id AS adapter_row_id,
           a.source_id,
           a.code AS adapter_code,
           a.name AS adapter_name,
           a.type,
           a.builtin_key,
           a.method,
           a.url_template,
           a.headers_json,
           a.query_template_json,
           a.body_template,
           a.body_type,
           a.timeout_ms AS adapter_timeout_ms,
           a.status AS adapter_status,
           a.created_at AS adapter_created_at,
           a.updated_at AS adapter_updated_at,
           s.id AS source_row_id,
           s.code AS source_code,
           s.name AS source_name,
           s.base_url,
           s.status AS source_status,
           s.timeout_ms AS source_timeout_ms,
           s.rate_limit_json,
           s.created_at AS source_created_at,
           s.updated_at AS source_updated_at,
           rm.id AS response_map_id,
           rm.function_id AS response_map_function_id,
           rm.adapter_id AS response_map_adapter_id,
           rm.data_path,
           rm.items_path,
           rm.fields_json,
           rm.status AS response_map_status,
           rm.created_at AS response_map_created_at,
           rm.updated_at AS response_map_updated_at
         FROM api_function_adapters fa
         INNER JOIN api_adapters a ON a.id = fa.adapter_id
         INNER JOIN api_sources s ON s.id = a.source_id
         LEFT JOIN api_response_maps rm
           ON rm.adapter_id = a.id
          AND (rm.function_id = fa.function_id OR rm.function_id IS NULL)
          AND rm.status = 'enabled'
         WHERE fa.function_id = ?
           AND fa.route_id = ?
           AND fa.status = 'enabled'
           AND a.status = 'enabled'
           AND s.status = 'enabled'
         ORDER BY fa.priority ASC, fa.weight DESC`,
      )
      .bind(functionId, routeId)
      .all<Record<string, unknown>>()

    return result.results.map((row) => ({
      binding: {
        id: String(row.binding_id),
        function_id: String(row.function_id),
        adapter_id: String(row.adapter_id),
        route_id: row.route_id === null ? null : String(row.route_id),
        priority: Number(row.priority),
        weight: Number(row.weight),
        fallback_enabled: Number(row.fallback_enabled),
        fixed_params_json: row.fixed_params_json === null ? null : String(row.fixed_params_json),
        default_params_json: row.default_params_json === null ? null : String(row.default_params_json),
        status: String(row.binding_status) as 'enabled' | 'disabled',
        created_at: String(row.binding_created_at),
        updated_at: String(row.binding_updated_at),
      },
      adapter: {
        id: String(row.adapter_row_id),
        source_id: String(row.source_id),
        code: String(row.adapter_code),
        name: String(row.adapter_name),
        type: String(row.type) as 'builtin' | 'http_custom',
        builtin_key: row.builtin_key === null ? null : String(row.builtin_key),
        method: String(row.method),
        url_template: row.url_template === null ? null : String(row.url_template),
        headers_json: row.headers_json === null ? null : String(row.headers_json),
        query_template_json: row.query_template_json === null ? null : String(row.query_template_json),
        body_template: row.body_template === null ? null : String(row.body_template),
        body_type: String(row.body_type) as 'none' | 'json' | 'form' | 'text',
        timeout_ms: Number(row.adapter_timeout_ms),
        status: String(row.adapter_status) as 'enabled' | 'disabled',
        created_at: String(row.adapter_created_at),
        updated_at: String(row.adapter_updated_at),
      },
      source: {
        id: String(row.source_row_id),
        code: String(row.source_code),
        name: String(row.source_name),
        base_url: String(row.base_url),
        status: String(row.source_status) as 'enabled' | 'disabled',
        timeout_ms: Number(row.source_timeout_ms),
        rate_limit_json: row.rate_limit_json === null ? null : String(row.rate_limit_json),
        created_at: String(row.source_created_at),
        updated_at: String(row.source_updated_at),
      },
      responseMap: row.response_map_id
        ? {
            id: String(row.response_map_id),
            function_id: row.response_map_function_id === null ? null : String(row.response_map_function_id),
            adapter_id: String(row.response_map_adapter_id),
            data_path: row.data_path === null ? null : String(row.data_path),
            items_path: row.items_path === null ? null : String(row.items_path),
            fields_json: row.fields_json === null ? null : String(row.fields_json),
            status: String(row.response_map_status) as 'enabled' | 'disabled',
            created_at: String(row.response_map_created_at),
            updated_at: String(row.response_map_updated_at),
          }
        : null,
    }))
  }

  async countUsers(): Promise<number> {
    const row = await this.db.prepare('SELECT COUNT(1) AS count FROM adm_users').first<{ count: number }>()
    return row?.count ?? 0
  }

  async findUserByUsername(username: string): Promise<AdminUserRow | null> {
    return this.db
      .prepare('SELECT * FROM adm_users WHERE username = ? AND status = ? LIMIT 1')
      .bind(username, 'enabled')
      .first<AdminUserRow>()
  }

  async findUserById(id: string): Promise<AdminUserRow | null> {
    return this.db
      .prepare('SELECT * FROM adm_users WHERE id = ? AND status = ? LIMIT 1')
      .bind(id, 'enabled')
      .first<AdminUserRow>()
  }

  async createAdminUser(user: { id: string; username: string; passwordHash: string; displayName: string }) {
    await this.db
      .prepare(
        `INSERT INTO adm_users (id, username, password_hash, display_name, status)
         VALUES (?, ?, ?, ?, 'enabled')`,
      )
      .bind(user.id, user.username, user.passwordHash, user.displayName)
      .run()

    await this.db
      .prepare(
        `INSERT OR IGNORE INTO adm_user_roles (user_id, role_id)
         VALUES (?, 'role_admin')`,
      )
      .bind(user.id)
      .run()
  }

  async updateUserLastLogin(userId: string) {
    await this.db
      .prepare("UPDATE adm_users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
      .bind(userId)
      .run()
  }

  async createSession(session: { id: string; userId: string; tokenHash: string; expiresAt: string }) {
    await this.db
      .prepare(
        `INSERT INTO adm_sessions (id, user_id, token_hash, expires_at)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(session.id, session.userId, session.tokenHash, session.expiresAt)
      .run()
  }

  async findSessionByTokenHash(tokenHash: string): Promise<AdminSessionRow | null> {
    return this.db
      .prepare(
        `SELECT * FROM adm_sessions
         WHERE token_hash = ?
           AND revoked_at IS NULL
           AND expires_at > datetime('now')
         LIMIT 1`,
      )
      .bind(tokenHash)
      .first<AdminSessionRow>()
  }

  async createFunction(input: {
    id: string
    code: string
    name: string
    method: string
    description: string
    paramsSchema?: Record<string, unknown> | null
    defaultParams?: Record<string, unknown>
    responseType: string
    isPublic: boolean
    status: 'enabled' | 'disabled'
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_functions (
           id, code, name, method, description, params_schema_json,
           default_params_json, response_type, is_public, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.code,
        input.name,
        input.method,
        input.description,
        input.paramsSchema === undefined || input.paramsSchema === null ? null : JSON.stringify(input.paramsSchema),
        input.defaultParams === undefined ? '{}' : JSON.stringify(input.defaultParams),
        input.responseType,
        input.isPublic ? 1 : 0,
        input.status,
      )
      .run()
  }

  async updateFunction(
    id: string,
    input: {
      code?: string
      name?: string
      method?: string
      description?: string
      paramsSchema?: Record<string, unknown> | null
      status?: 'enabled' | 'disabled'
      isPublic?: boolean
      defaultParams?: Record<string, unknown>
      responseType?: string
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_functions
         SET code = COALESCE(?, code),
             name = COALESCE(?, name),
             method = COALESCE(?, method),
             description = COALESCE(?, description),
             params_schema_json = COALESCE(?, params_schema_json),
             default_params_json = COALESCE(?, default_params_json),
             response_type = COALESCE(?, response_type),
             is_public = COALESCE(?, is_public),
             status = COALESCE(?, status),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.code ?? null,
        input.name ?? null,
        input.method ?? null,
        input.description ?? null,
        input.paramsSchema === undefined ? null : input.paramsSchema === null ? null : JSON.stringify(input.paramsSchema),
        input.defaultParams === undefined ? null : JSON.stringify(input.defaultParams),
        input.responseType ?? null,
        input.isPublic === undefined ? null : input.isPublic ? 1 : 0,
        input.status ?? null,
        id,
      )
      .run()
  }

  async createFunctionAdapter(input: {
    id: string
    functionId: string
    adapterId: string
    routeId?: string | null
    priority: number
    weight: number
    fallbackEnabled: boolean
    defaultParams?: Record<string, unknown>
    fixedParams?: Record<string, unknown>
    status: 'enabled' | 'disabled'
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_function_adapters (
           id, function_id, adapter_id, route_id, priority, weight,
           fallback_enabled, fixed_params_json, default_params_json, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.functionId,
        input.adapterId,
        input.routeId ?? null,
        input.priority,
        input.weight,
        input.fallbackEnabled ? 1 : 0,
        input.fixedParams === undefined ? null : JSON.stringify(input.fixedParams),
        input.defaultParams === undefined ? null : JSON.stringify(input.defaultParams),
        input.status,
      )
      .run()
  }

  async updateFunctionAdapter(
    id: string,
    input: {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      routeIdTouched?: boolean
      status?: 'enabled' | 'disabled'
      priority?: number
      weight?: number
      fallbackEnabled?: boolean
      defaultParams?: Record<string, unknown>
      fixedParams?: Record<string, unknown>
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_function_adapters
         SET function_id = COALESCE(?, function_id),
             adapter_id = COALESCE(?, adapter_id),
             route_id = CASE WHEN ? = 1 THEN ? ELSE route_id END,
             priority = COALESCE(?, priority),
             weight = COALESCE(?, weight),
             fallback_enabled = COALESCE(?, fallback_enabled),
             default_params_json = COALESCE(?, default_params_json),
             fixed_params_json = COALESCE(?, fixed_params_json),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.functionId ?? null,
        input.adapterId ?? null,
        input.routeIdTouched ? 1 : 0,
        input.routeId ?? null,
        input.priority ?? null,
        input.weight ?? null,
        input.fallbackEnabled === undefined ? null : input.fallbackEnabled ? 1 : 0,
        input.defaultParams === undefined ? null : JSON.stringify(input.defaultParams),
        input.fixedParams === undefined ? null : JSON.stringify(input.fixedParams),
        input.status ?? null,
        id,
      )
      .run()
  }

  async createSource(input: {
    id: string
    code: string
    name: string
    baseUrl: string
    status: 'enabled' | 'disabled'
    timeoutMs: number
    rateLimit?: Record<string, unknown>
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_sources (id, code, name, base_url, status, timeout_ms, rate_limit_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.code,
        input.name,
        input.baseUrl,
        input.status,
        input.timeoutMs,
        input.rateLimit === undefined ? null : JSON.stringify(input.rateLimit),
      )
      .run()
  }

  async createMenu(input: {
    id: string
    parentId?: string | null
    scope: 'top' | 'side'
    module: string
    title: string
    subtitle?: string | null
    icon?: string | null
    path?: string | null
    i18nKey?: string | null
    sort: number
    status: 'enabled' | 'disabled'
    payload?: Record<string, unknown>
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_menus (
           id, parent_id, scope, module, title, subtitle, icon, path,
           i18n_key, sort, status, payload_json
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.parentId ?? null,
        input.scope,
        input.module,
        input.title,
        input.subtitle ?? null,
        input.icon ?? null,
        input.path ?? null,
        input.i18nKey ?? null,
        input.sort,
        input.status,
        input.payload === undefined ? '{}' : JSON.stringify(input.payload),
      )
      .run()
  }

  async replaceMenus(scope: 'top' | 'side', module: string, menus: Array<{
    id: string
    parentId?: string | null
    title: string
    subtitle?: string | null
    icon?: string | null
    path?: string | null
    i18nKey?: string | null
    sort: number
    status: 'enabled' | 'disabled'
    payload?: Record<string, unknown>
  }>) {
    await this.db.prepare('DELETE FROM api_menus WHERE scope = ? AND module = ?').bind(scope, module).run()
    for (const menu of menus) {
      await this.upsertMenu({ ...menu, scope, module })
    }
  }

  async upsertMenus(scope: 'top' | 'side', module: string, menus: Array<{
    id: string
    parentId?: string | null
    title: string
    subtitle?: string | null
    icon?: string | null
    path?: string | null
    i18nKey?: string | null
    sort: number
    status: 'enabled' | 'disabled'
    payload?: Record<string, unknown>
  }>) {
    for (const menu of menus) {
      await this.upsertMenu({ ...menu, scope, module })
    }
  }

  private async upsertMenu(input: {
    id: string
    parentId?: string | null
    scope: 'top' | 'side'
    module: string
    title: string
    subtitle?: string | null
    icon?: string | null
    path?: string | null
    i18nKey?: string | null
    sort: number
    status: 'enabled' | 'disabled'
    payload?: Record<string, unknown>
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_menus (
           id, parent_id, scope, module, title, subtitle, icon, path,
           i18n_key, sort, status, payload_json
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           parent_id = excluded.parent_id,
           scope = excluded.scope,
           module = excluded.module,
           title = excluded.title,
           subtitle = excluded.subtitle,
           icon = excluded.icon,
           path = excluded.path,
           i18n_key = excluded.i18n_key,
           sort = excluded.sort,
           status = excluded.status,
           payload_json = excluded.payload_json,
           updated_at = datetime('now')`,
      )
      .bind(
        input.id,
        input.parentId ?? null,
        input.scope,
        input.module,
        input.title,
        input.subtitle ?? null,
        input.icon ?? null,
        input.path ?? null,
        input.i18nKey ?? null,
        input.sort,
        input.status,
        input.payload === undefined ? '{}' : JSON.stringify(input.payload),
      )
      .run()
  }

  async updateMenu(
    id: string,
    input: {
      parentId?: string | null
      parentIdTouched?: boolean
      scope?: 'top' | 'side'
      module?: string
      title?: string
      subtitle?: string | null
      subtitleTouched?: boolean
      icon?: string | null
      iconTouched?: boolean
      path?: string | null
      pathTouched?: boolean
      i18nKey?: string | null
      i18nKeyTouched?: boolean
      sort?: number
      status?: 'enabled' | 'disabled'
      payload?: Record<string, unknown>
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_menus
         SET parent_id = CASE WHEN ? THEN ? ELSE parent_id END,
             scope = COALESCE(?, scope),
             module = COALESCE(?, module),
             title = COALESCE(?, title),
             subtitle = CASE WHEN ? THEN ? ELSE subtitle END,
             icon = CASE WHEN ? THEN ? ELSE icon END,
             path = CASE WHEN ? THEN ? ELSE path END,
             i18n_key = CASE WHEN ? THEN ? ELSE i18n_key END,
             sort = COALESCE(?, sort),
             status = COALESCE(?, status),
             payload_json = COALESCE(?, payload_json),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.parentIdTouched ? 1 : 0,
        input.parentId ?? null,
        input.scope ?? null,
        input.module ?? null,
        input.title ?? null,
        input.subtitleTouched ? 1 : 0,
        input.subtitle ?? null,
        input.iconTouched ? 1 : 0,
        input.icon ?? null,
        input.pathTouched ? 1 : 0,
        input.path ?? null,
        input.i18nKeyTouched ? 1 : 0,
        input.i18nKey ?? null,
        input.sort ?? null,
        input.status ?? null,
        input.payload === undefined ? null : JSON.stringify(input.payload),
        id,
      )
      .run()
  }

  async updateSource(
    id: string,
    input: {
      code?: string
      name?: string
      baseUrl?: string
      status?: 'enabled' | 'disabled'
      timeoutMs?: number
      rateLimit?: Record<string, unknown>
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_sources
         SET code = COALESCE(?, code),
             name = COALESCE(?, name),
             base_url = COALESCE(?, base_url),
             status = COALESCE(?, status),
             timeout_ms = COALESCE(?, timeout_ms),
             rate_limit_json = COALESCE(?, rate_limit_json),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.code ?? null,
        input.name ?? null,
        input.baseUrl ?? null,
        input.status ?? null,
        input.timeoutMs ?? null,
        input.rateLimit === undefined ? null : JSON.stringify(input.rateLimit),
        id,
      )
      .run()
  }

  async createAdapter(input: {
    id: string
    sourceId: string
    code: string
    name: string
    type: 'builtin' | 'http_custom'
    builtinKey?: string | null
    method: string
    urlTemplate?: string | null
    headers?: Record<string, unknown>
    queryTemplate?: Record<string, unknown>
    bodyTemplate?: string | null
    bodyType: 'none' | 'json' | 'form' | 'text'
    timeoutMs: number
    status: 'enabled' | 'disabled'
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_adapters (
           id, source_id, code, name, type, builtin_key, method, url_template,
           headers_json, query_template_json, body_template, body_type, timeout_ms, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.sourceId,
        input.code,
        input.name,
        input.type,
        input.builtinKey ?? null,
        input.method,
        input.urlTemplate ?? null,
        input.headers === undefined ? null : JSON.stringify(input.headers),
        input.queryTemplate === undefined ? null : JSON.stringify(input.queryTemplate),
        input.bodyTemplate ?? null,
        input.bodyType,
        input.timeoutMs,
        input.status,
      )
      .run()
  }

  async updateAdapter(
    id: string,
    input: {
      sourceId?: string
      code?: string
      name?: string
      type?: 'builtin' | 'http_custom'
      builtinKey?: string | null
      method?: string
      urlTemplate?: string | null
      headers?: Record<string, unknown>
      queryTemplate?: Record<string, unknown>
      bodyTemplate?: string | null
      bodyType?: 'none' | 'json' | 'form' | 'text'
      timeoutMs?: number
      status?: 'enabled' | 'disabled'
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_adapters
         SET source_id = COALESCE(?, source_id),
             code = COALESCE(?, code),
             name = COALESCE(?, name),
             type = COALESCE(?, type),
             builtin_key = COALESCE(?, builtin_key),
             method = COALESCE(?, method),
             url_template = COALESCE(?, url_template),
             headers_json = COALESCE(?, headers_json),
             query_template_json = COALESCE(?, query_template_json),
             body_template = COALESCE(?, body_template),
             body_type = COALESCE(?, body_type),
             timeout_ms = COALESCE(?, timeout_ms),
             status = COALESCE(?, status),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.sourceId ?? null,
        input.code ?? null,
        input.name ?? null,
        input.type ?? null,
        input.builtinKey ?? null,
        input.method ?? null,
        input.urlTemplate ?? null,
        input.headers === undefined ? null : JSON.stringify(input.headers),
        input.queryTemplate === undefined ? null : JSON.stringify(input.queryTemplate),
        input.bodyTemplate ?? null,
        input.bodyType ?? null,
        input.timeoutMs ?? null,
        input.status ?? null,
        id,
      )
      .run()
  }

  async createFunctionParam(input: {
    id: string
    functionId: string
    paramKey: string
    label: string
    source: 'query' | 'body' | 'any'
    type: 'string' | 'number' | 'boolean' | 'json'
    required: boolean
    defaultValue?: unknown
    allowValues?: unknown[]
    description: string
    sort: number
    status: 'enabled' | 'disabled'
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_function_params (
           id, function_id, param_key, label, source, type, required,
           default_value_json, allow_values_json, description, sort, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.functionId,
        input.paramKey,
        input.label,
        input.source,
        input.type,
        input.required ? 1 : 0,
        input.defaultValue === undefined ? null : JSON.stringify(input.defaultValue),
        input.allowValues === undefined ? null : JSON.stringify(input.allowValues),
        input.description,
        input.sort,
        input.status,
      )
      .run()
  }

  async updateFunctionParam(
    id: string,
    input: {
      functionId?: string
      paramKey?: string
      label?: string
      source?: 'query' | 'body' | 'any'
      type?: 'string' | 'number' | 'boolean' | 'json'
      required?: boolean
      defaultValue?: unknown
      allowValues?: unknown[]
      description?: string
      sort?: number
      status?: 'enabled' | 'disabled'
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_function_params
         SET function_id = COALESCE(?, function_id),
             param_key = COALESCE(?, param_key),
             label = COALESCE(?, label),
             source = COALESCE(?, source),
             type = COALESCE(?, type),
             required = COALESCE(?, required),
             default_value_json = COALESCE(?, default_value_json),
             allow_values_json = COALESCE(?, allow_values_json),
             description = COALESCE(?, description),
             sort = COALESCE(?, sort),
             status = COALESCE(?, status),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.functionId ?? null,
        input.paramKey ?? null,
        input.label ?? null,
        input.source ?? null,
        input.type ?? null,
        input.required === undefined ? null : input.required ? 1 : 0,
        input.defaultValue === undefined ? null : JSON.stringify(input.defaultValue),
        input.allowValues === undefined ? null : JSON.stringify(input.allowValues),
        input.description ?? null,
        input.sort ?? null,
        input.status ?? null,
        id,
      )
      .run()
  }

  async createFunctionRoute(input: {
    id: string
    functionId: string
    routeKey: string
    name: string
    match: Record<string, unknown>
    defaultParams?: Record<string, unknown>
    sort: number
    status: 'enabled' | 'disabled'
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_function_routes (
           id, function_id, route_key, name, match_json, default_params_json, sort, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.functionId,
        input.routeKey,
        input.name,
        JSON.stringify(input.match),
        input.defaultParams === undefined ? null : JSON.stringify(input.defaultParams),
        input.sort,
        input.status,
      )
      .run()
  }

  async updateFunctionRoute(
    id: string,
    input: {
      functionId?: string
      routeKey?: string
      name?: string
      match?: Record<string, unknown>
      defaultParams?: Record<string, unknown>
      sort?: number
      status?: 'enabled' | 'disabled'
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_function_routes
         SET function_id = COALESCE(?, function_id),
             route_key = COALESCE(?, route_key),
             name = COALESCE(?, name),
             match_json = COALESCE(?, match_json),
             default_params_json = COALESCE(?, default_params_json),
             sort = COALESCE(?, sort),
             status = COALESCE(?, status),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.functionId ?? null,
        input.routeKey ?? null,
        input.name ?? null,
        input.match === undefined ? null : JSON.stringify(input.match),
        input.defaultParams === undefined ? null : JSON.stringify(input.defaultParams),
        input.sort ?? null,
        input.status ?? null,
        id,
      )
      .run()
  }

  async createAdapterParamMap(input: {
    id: string
    functionId: string
    adapterId: string
    routeId?: string | null
    publicParam: string
    target: 'param' | 'query' | 'header' | 'body'
    targetKey: string
    template?: string | null
    defaultValue?: unknown
    status: 'enabled' | 'disabled'
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_adapter_param_maps (
           id, function_id, adapter_id, route_id, public_param, target,
           target_key, template, default_value_json, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.functionId,
        input.adapterId,
        input.routeId ?? null,
        input.publicParam,
        input.target,
        input.targetKey,
        input.template ?? null,
        input.defaultValue === undefined ? null : JSON.stringify(input.defaultValue),
        input.status,
      )
      .run()
  }

  async updateAdapterParamMap(
    id: string,
    input: {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      routeIdTouched?: boolean
      publicParam?: string
      target?: 'param' | 'query' | 'header' | 'body'
      targetKey?: string
      template?: string | null
      defaultValue?: unknown
      status?: 'enabled' | 'disabled'
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_adapter_param_maps
         SET function_id = COALESCE(?, function_id),
             adapter_id = COALESCE(?, adapter_id),
             route_id = CASE WHEN ? = 1 THEN ? ELSE route_id END,
             public_param = COALESCE(?, public_param),
             target = COALESCE(?, target),
             target_key = COALESCE(?, target_key),
             template = COALESCE(?, template),
             default_value_json = COALESCE(?, default_value_json),
             status = COALESCE(?, status),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.functionId ?? null,
        input.adapterId ?? null,
        input.routeIdTouched ? 1 : 0,
        input.routeId ?? null,
        input.publicParam ?? null,
        input.target ?? null,
        input.targetKey ?? null,
        input.template ?? null,
        input.defaultValue === undefined ? null : JSON.stringify(input.defaultValue),
        input.status ?? null,
        id,
      )
      .run()
  }

  async createResponseMap(input: {
    id: string
    functionId?: string | null
    adapterId: string
    dataPath?: string | null
    itemsPath?: string | null
    fields?: Record<string, unknown>
    status: 'enabled' | 'disabled'
  }) {
    await this.db
      .prepare(
        `INSERT INTO api_response_maps (
           id, function_id, adapter_id, data_path, items_path, fields_json, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.functionId ?? null,
        input.adapterId,
        input.dataPath ?? null,
        input.itemsPath ?? null,
        input.fields === undefined ? null : JSON.stringify(input.fields),
        input.status,
      )
      .run()
  }

  async updateResponseMap(
    id: string,
    input: {
      functionId?: string | null
      functionIdTouched?: boolean
      adapterId?: string
      dataPath?: string | null
      itemsPath?: string | null
      fields?: Record<string, unknown>
      status?: 'enabled' | 'disabled'
    },
  ) {
    await this.db
      .prepare(
        `UPDATE api_response_maps
         SET function_id = CASE WHEN ? = 1 THEN ? ELSE function_id END,
             adapter_id = COALESCE(?, adapter_id),
             data_path = COALESCE(?, data_path),
             items_path = COALESCE(?, items_path),
             fields_json = COALESCE(?, fields_json),
             status = COALESCE(?, status),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        input.functionIdTouched ? 1 : 0,
        input.functionId ?? null,
        input.adapterId ?? null,
        input.dataPath ?? null,
        input.itemsPath ?? null,
        input.fields === undefined ? null : JSON.stringify(input.fields),
        input.status ?? null,
        id,
      )
      .run()
  }
}
