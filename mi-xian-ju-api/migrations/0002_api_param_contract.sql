ALTER TABLE api_adapters ADD COLUMN body_type TEXT NOT NULL DEFAULT 'none';
ALTER TABLE api_function_adapters ADD COLUMN route_id TEXT;

CREATE INDEX IF NOT EXISTS idx_api_function_adapters_route_id ON api_function_adapters(route_id);

CREATE TABLE IF NOT EXISTS api_function_params (
  id TEXT PRIMARY KEY,
  function_id TEXT NOT NULL,
  param_key TEXT NOT NULL,
  label TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'any' CHECK (source IN ('query', 'body', 'any')),
  type TEXT NOT NULL DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  required INTEGER NOT NULL DEFAULT 0,
  default_value_json TEXT,
  allow_values_json TEXT,
  description TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (function_id) REFERENCES api_functions(id) ON DELETE CASCADE,
  UNIQUE (function_id, param_key)
);

CREATE INDEX IF NOT EXISTS idx_api_function_params_function_id ON api_function_params(function_id);

CREATE TABLE IF NOT EXISTS api_function_routes (
  id TEXT PRIMARY KEY,
  function_id TEXT NOT NULL,
  route_key TEXT NOT NULL,
  name TEXT NOT NULL,
  match_json TEXT NOT NULL DEFAULT '{}',
  default_params_json TEXT,
  sort INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (function_id) REFERENCES api_functions(id) ON DELETE CASCADE,
  UNIQUE (function_id, route_key)
);

CREATE INDEX IF NOT EXISTS idx_api_function_routes_function_id ON api_function_routes(function_id);

CREATE TABLE IF NOT EXISTS api_adapter_param_maps (
  id TEXT PRIMARY KEY,
  function_id TEXT NOT NULL,
  adapter_id TEXT NOT NULL,
  route_id TEXT,
  public_param TEXT NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('param', 'query', 'header', 'body')),
  target_key TEXT NOT NULL,
  template TEXT,
  default_value_json TEXT,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (function_id) REFERENCES api_functions(id) ON DELETE CASCADE,
  FOREIGN KEY (adapter_id) REFERENCES api_adapters(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES api_function_routes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_adapter_param_maps_function_id ON api_adapter_param_maps(function_id);
CREATE INDEX IF NOT EXISTS idx_api_adapter_param_maps_adapter_id ON api_adapter_param_maps(adapter_id);
CREATE INDEX IF NOT EXISTS idx_api_adapter_param_maps_route_id ON api_adapter_param_maps(route_id);

UPDATE api_functions
SET params_schema_json = '{"type":"object","properties":{"category":{"type":"string"}}}',
    default_params_json = '{}',
    updated_at = datetime('now')
WHERE id IN ('fn_hot_video', 'fn_random_image', 'fn_lite_word');

INSERT OR IGNORE INTO api_function_params (
  id,
  function_id,
  param_key,
  label,
  source,
  type,
  required,
  default_value_json,
  description,
  sort,
  status
)
VALUES
  ('fp_hot_video_category', 'fn_hot_video', 'category', '视频分类', 'any', 'string', 0, '"zzxjj"', '芈仙居视频分类编码，例如 xiaojiejie。', 10, 'enabled'),
  ('fp_random_image_category', 'fn_random_image', 'category', '图片分类', 'any', 'string', 0, '"sjtp"', '芈仙居图片分类编码。', 10, 'enabled'),
  ('fp_lite_word_category', 'fn_lite_word', 'category', '文案分类', 'any', 'string', 0, '"wenrou"', '芈仙居文案分类编码。', 10, 'enabled');

INSERT OR IGNORE INTO api_function_routes (
  id,
  function_id,
  route_key,
  name,
  match_json,
  default_params_json,
  sort,
  status
)
VALUES
  ('fr_hot_video_default', 'fn_hot_video', 'default', '默认视频分类', '{}', '{}', 1000, 'enabled'),
  ('fr_hot_video_xiaojiejie', 'fn_hot_video', 'xiaojiejie', '小姐姐视频', '{"category":"xiaojiejie"}', '{}', 10, 'enabled'),
  ('fr_random_image_default', 'fn_random_image', 'default', '默认图片分类', '{}', '{}', 1000, 'enabled'),
  ('fr_lite_word_default', 'fn_lite_word', 'default', '默认文案分类', '{}', '{}', 1000, 'enabled');

UPDATE api_function_adapters
SET route_id = 'fr_hot_video_default',
    fixed_params_json = '{}',
    default_params_json = '{}',
    updated_at = datetime('now')
WHERE id = 'fa_hot_video_yujn';

UPDATE api_function_adapters
SET route_id = 'fr_random_image_default',
    fixed_params_json = '{}',
    default_params_json = '{}',
    updated_at = datetime('now')
WHERE id = 'fa_random_image_yujn';

UPDATE api_function_adapters
SET route_id = 'fr_lite_word_default',
    fixed_params_json = '{}',
    default_params_json = '{}',
    updated_at = datetime('now')
WHERE id = 'fa_lite_word_yujn';

INSERT OR IGNORE INTO api_function_adapters (
  id,
  function_id,
  adapter_id,
  route_id,
  priority,
  weight,
  fallback_enabled,
  fixed_params_json,
  default_params_json,
  status
)
VALUES
  ('fa_hot_video_xiaojiejie_yujn_xjj', 'fn_hot_video', 'adp_yujn_json', 'fr_hot_video_xiaojiejie', 100, 1, 1, '{"path":"/api/xjj.php"}', '{}', 'enabled'),
  ('fa_hot_video_xiaojiejie_yujn_zzxjj', 'fn_hot_video', 'adp_yujn_json', 'fr_hot_video_xiaojiejie', 200, 1, 1, '{"path":"/api/zzxjj.php"}', '{}', 'enabled');

INSERT OR IGNORE INTO api_adapter_param_maps (
  id,
  function_id,
  adapter_id,
  route_id,
  public_param,
  target,
  target_key,
  template,
  status
)
VALUES
  ('apm_hot_video_yujn_category_path', 'fn_hot_video', 'adp_yujn_json', 'fr_hot_video_default', 'category', 'param', 'path', '/api/{{category}}.php', 'enabled'),
  ('apm_random_image_yujn_category_path', 'fn_random_image', 'adp_yujn_json', 'fr_random_image_default', 'category', 'param', 'path', '/api/{{category}}.php', 'enabled'),
  ('apm_lite_word_yujn_category_path', 'fn_lite_word', 'adp_yujn_json', 'fr_lite_word_default', 'category', 'param', 'path', '/api/{{category}}.php', 'enabled');
