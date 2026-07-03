CREATE TABLE IF NOT EXISTS adm_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS adm_roles (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS adm_user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES adm_users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES adm_roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS adm_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES adm_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_adm_sessions_user_id ON adm_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_adm_sessions_expires_at ON adm_sessions(expires_at);

CREATE TABLE IF NOT EXISTS adm_api_tokens (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'enabled',
  rate_limit_json TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_sources (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enabled',
  timeout_ms INTEGER NOT NULL DEFAULT 20000,
  rate_limit_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_adapters (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('builtin', 'http_custom')),
  builtin_key TEXT,
  method TEXT NOT NULL DEFAULT 'GET',
  url_template TEXT,
  headers_json TEXT,
  query_template_json TEXT,
  body_template TEXT,
  timeout_ms INTEGER NOT NULL DEFAULT 20000,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_id) REFERENCES api_sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_adapters_source_id ON api_adapters(source_id);

CREATE TABLE IF NOT EXISTS api_functions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  description TEXT NOT NULL DEFAULT '',
  params_schema_json TEXT,
  default_params_json TEXT,
  response_type TEXT NOT NULL DEFAULT 'raw',
  is_public INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_api_functions_status ON api_functions(status);

CREATE TABLE IF NOT EXISTS api_function_adapters (
  id TEXT PRIMARY KEY,
  function_id TEXT NOT NULL,
  adapter_id TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  weight INTEGER NOT NULL DEFAULT 1,
  fallback_enabled INTEGER NOT NULL DEFAULT 1,
  fixed_params_json TEXT,
  default_params_json TEXT,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (function_id) REFERENCES api_functions(id) ON DELETE CASCADE,
  FOREIGN KEY (adapter_id) REFERENCES api_adapters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_function_adapters_function_id ON api_function_adapters(function_id);
CREATE INDEX IF NOT EXISTS idx_api_function_adapters_priority ON api_function_adapters(function_id, priority);

CREATE TABLE IF NOT EXISTS api_response_maps (
  id TEXT PRIMARY KEY,
  function_id TEXT,
  adapter_id TEXT NOT NULL,
  data_path TEXT,
  items_path TEXT,
  fields_json TEXT,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (function_id) REFERENCES api_functions(id) ON DELETE CASCADE,
  FOREIGN KEY (adapter_id) REFERENCES api_adapters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_response_maps_function_id ON api_response_maps(function_id);
CREATE INDEX IF NOT EXISTS idx_api_response_maps_adapter_id ON api_response_maps(adapter_id);

INSERT OR IGNORE INTO adm_roles (id, code, name, description)
VALUES ('role_admin', 'admin', '管理员', '拥有后台管理权限');

INSERT OR IGNORE INTO api_sources (id, code, name, base_url, status, timeout_ms)
VALUES ('src_yujn', 'yujn', '遇见 API', 'https://api.yujn.cn', 'enabled', 20000);

INSERT OR IGNORE INTO api_adapters (
  id,
  source_id,
  code,
  name,
  type,
  method,
  url_template,
  query_template_json,
  timeout_ms,
  status
)
VALUES (
  'adp_yujn_json',
  'src_yujn',
  'yujn-json',
  '遇见 API JSON 通用适配器',
  'http_custom',
  'GET',
  '{{baseUrl}}{{path}}',
  '{"type":"json"}',
  20000,
  'enabled'
);

INSERT OR IGNORE INTO api_functions (
  id,
  code,
  name,
  method,
  description,
  params_schema_json,
  default_params_json,
  response_type,
  is_public,
  status
)
VALUES
  (
    'fn_hot_video',
    'hot-video',
    '热门视频',
    'GET',
    '按功能获取随机热门视频，不向前端暴露第三方平台。',
    '{"type":"object","properties":{"path":{"type":"string"},"type":{"type":"string"}}}',
    '{"path":"/api/zzxjj.php"}',
    'video-url',
    1,
    'enabled'
  ),
  (
    'fn_random_image',
    'random-image',
    '随机图片',
    'GET',
    '按功能获取随机图片。',
    '{"type":"object","properties":{"path":{"type":"string"},"type":{"type":"string"}}}',
    '{"path":"/api/sjtp.php"}',
    'image-url',
    1,
    'enabled'
  ),
  (
    'fn_lite_word',
    'lite-word',
    '随机文案',
    'GET',
    '按功能获取随机文案。',
    '{"type":"object","properties":{"path":{"type":"string"},"type":{"type":"string"}}}',
    '{"path":"/api/wenrou.php"}',
    'text-lines',
    1,
    'enabled'
  );

INSERT OR IGNORE INTO api_function_adapters (
  id,
  function_id,
  adapter_id,
  priority,
  weight,
  fallback_enabled,
  fixed_params_json,
  default_params_json,
  status
)
VALUES
  ('fa_hot_video_yujn', 'fn_hot_video', 'adp_yujn_json', 100, 1, 1, '{}', '{}', 'enabled'),
  ('fa_random_image_yujn', 'fn_random_image', 'adp_yujn_json', 100, 1, 1, '{}', '{}', 'enabled'),
  ('fa_lite_word_yujn', 'fn_lite_word', 'adp_yujn_json', 100, 1, 1, '{}', '{}', 'enabled');
