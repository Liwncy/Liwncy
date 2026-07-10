CREATE TABLE IF NOT EXISTS api_chains (
  id TEXT PRIMARY KEY,
  function_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_default INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (function_id) REFERENCES api_functions(id) ON DELETE CASCADE,
  UNIQUE (function_id, code)
);

CREATE INDEX IF NOT EXISTS idx_api_chains_function_id ON api_chains(function_id);
CREATE INDEX IF NOT EXISTS idx_api_chains_default ON api_chains(function_id, is_default, status);

CREATE TABLE IF NOT EXISTS api_chain_steps (
  id TEXT PRIMARY KEY,
  chain_id TEXT NOT NULL,
  step_key TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'normalize_params',
    'match_route',
    'map_request',
    'call_adapter',
    'map_response',
    'normalize_response'
  )),
  name TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  sort INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'enabled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (chain_id) REFERENCES api_chains(id) ON DELETE CASCADE,
  UNIQUE (chain_id, step_key)
);

CREATE INDEX IF NOT EXISTS idx_api_chain_steps_chain_id ON api_chain_steps(chain_id);

INSERT OR IGNORE INTO api_chains (id, function_id, code, name, description, is_default, sort, status)
VALUES
  ('chain_litevideo_default', 'fn_hot_video', 'default', '轻视频默认链', '整理公开参数、匹配视频场景、调用遇见 API 并标准化视频响应。', 1, 10, 'enabled'),
  ('chain_liteimage_default', 'fn_random_image', 'default', '轻图默认链', '整理公开参数、匹配图片场景、调用遇见 API 并标准化图片响应。', 1, 10, 'enabled'),
  ('chain_liteword_default', 'fn_lite_word', 'default', '轻文案默认链', '整理公开参数、匹配文案场景、调用遇见 API 并标准化文案响应。', 1, 10, 'enabled');

INSERT OR IGNORE INTO api_chain_steps (id, chain_id, step_key, type, name, config_json, sort, status)
VALUES
  ('step_litevideo_normalize_params', 'chain_litevideo_default', 'normalize-params', 'normalize_params', '整理公开参数', '{"source":"api_function_params"}', 10, 'enabled'),
  ('step_litevideo_match_route', 'chain_litevideo_default', 'match-route', 'match_route', '匹配视频场景', '{"source":"api_function_routes"}', 20, 'enabled'),
  ('step_litevideo_map_request', 'chain_litevideo_default', 'map-request', 'map_request', '生成第三方请求参数', '{"source":"api_adapter_param_maps"}', 30, 'enabled'),
  ('step_litevideo_call_adapter', 'chain_litevideo_default', 'call-adapter', 'call_adapter', '调用视频 Adapter', '{"source":"api_function_adapters"}', 40, 'enabled'),
  ('step_litevideo_map_response', 'chain_litevideo_default', 'map-response', 'map_response', '映射第三方响应', '{"source":"api_response_maps"}', 50, 'enabled'),
  ('step_litevideo_normalize_response', 'chain_litevideo_default', 'normalize-response', 'normalize_response', '标准化视频响应', '{"responseType":"video-url"}', 60, 'enabled'),

  ('step_liteimage_normalize_params', 'chain_liteimage_default', 'normalize-params', 'normalize_params', '整理公开参数', '{"source":"api_function_params"}', 10, 'enabled'),
  ('step_liteimage_match_route', 'chain_liteimage_default', 'match-route', 'match_route', '匹配图片场景', '{"source":"api_function_routes"}', 20, 'enabled'),
  ('step_liteimage_map_request', 'chain_liteimage_default', 'map-request', 'map_request', '生成第三方请求参数', '{"source":"api_adapter_param_maps"}', 30, 'enabled'),
  ('step_liteimage_call_adapter', 'chain_liteimage_default', 'call-adapter', 'call_adapter', '调用图片 Adapter', '{"source":"api_function_adapters"}', 40, 'enabled'),
  ('step_liteimage_map_response', 'chain_liteimage_default', 'map-response', 'map_response', '映射第三方响应', '{"source":"api_response_maps"}', 50, 'enabled'),
  ('step_liteimage_normalize_response', 'chain_liteimage_default', 'normalize-response', 'normalize_response', '标准化图片响应', '{"responseType":"image-url"}', 60, 'enabled'),

  ('step_liteword_normalize_params', 'chain_liteword_default', 'normalize-params', 'normalize_params', '整理公开参数', '{"source":"api_function_params"}', 10, 'enabled'),
  ('step_liteword_match_route', 'chain_liteword_default', 'match-route', 'match_route', '匹配文案场景', '{"source":"api_function_routes"}', 20, 'enabled'),
  ('step_liteword_map_request', 'chain_liteword_default', 'map-request', 'map_request', '生成第三方请求参数', '{"source":"api_adapter_param_maps"}', 30, 'enabled'),
  ('step_liteword_call_adapter', 'chain_liteword_default', 'call-adapter', 'call_adapter', '调用文案 Adapter', '{"source":"api_function_adapters"}', 40, 'enabled'),
  ('step_liteword_map_response', 'chain_liteword_default', 'map-response', 'map_response', '映射第三方响应', '{"source":"api_response_maps"}', 50, 'enabled'),
  ('step_liteword_normalize_response', 'chain_liteword_default', 'normalize-response', 'normalize_response', '标准化文案响应', '{"responseType":"text-lines"}', 60, 'enabled');
