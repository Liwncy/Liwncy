import type {
  AdminSessionRow,
  AdminUserRow,
  ApiAdapterRow,
  ApiFunctionAdapterConfig,
  ApiFunctionRow,
  ApiFunctionSummary,
  ApiResponseMapRow,
  ApiSourceRow,
} from '../common/platform.types'

function parseJsonObject(value: string | null): Record<string, unknown> {
  if (!value) return {}
  const parsed = JSON.parse(value) as unknown
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
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

  async listAdapterConfigs(functionId: string): Promise<ApiFunctionAdapterConfig[]> {
    const result = await this.db
      .prepare(
        `SELECT
           fa.id AS binding_id,
           fa.function_id,
           fa.adapter_id,
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
           AND fa.status = 'enabled'
           AND a.status = 'enabled'
           AND s.status = 'enabled'
         ORDER BY fa.priority ASC, fa.weight DESC`,
      )
      .bind(functionId)
      .all<Record<string, unknown>>()

    return result.results.map((row) => ({
      binding: {
        id: String(row.binding_id),
        function_id: String(row.function_id),
        adapter_id: String(row.adapter_id),
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
}
