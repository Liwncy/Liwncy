CREATE TABLE IF NOT EXISTS api_menus (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  scope TEXT NOT NULL CHECK (scope IN ('top', 'side')),
  module TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  path TEXT,
  i18n_key TEXT,
  sort INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled')),
  payload_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_api_menus_scope_module ON api_menus (scope, module, status, sort);
CREATE INDEX IF NOT EXISTS idx_api_menus_parent ON api_menus (parent_id);

INSERT OR IGNORE INTO api_menus
  (id, parent_id, scope, module, title, icon, sort, status, payload_json)
VALUES
  ('litevideo-xjj', NULL, 'side', 'liteVideo', '小姐姐', 'layui-icon-video', 10, 'enabled', '{"api":"/api/v1/litevideo?type=xjj","data":{"category":"xjj"}}'),
  ('litevideo-zzxjj', NULL, 'side', 'liteVideo', '转转小姐姐', 'layui-icon-video', 20, 'enabled', '{"api":"/api/v1/litevideo?type=zzxjj","data":{"category":"zzxjj"}}'),
  ('litevideo-sjxl', NULL, 'side', 'liteVideo', '随机系列', 'layui-icon-video', 30, 'enabled', '{"api":"/api/v1/litevideo?type=sjxl","data":{"category":"sjxl"}}'),
  ('liteimage-heisi', NULL, 'side', 'liteImage', '黑丝', 'layui-icon-picture', 10, 'enabled', '{"api":"/api/v1/liteimage?type=heisi","data":{"category":"heisi"}}'),
  ('liteimage-sjtp', NULL, 'side', 'liteImage', '随机图片', 'layui-icon-picture', 20, 'enabled', '{"api":"/api/v1/liteimage?type=sjtp","data":{"category":"sjtp"}}'),
  ('liteimage-maomi', NULL, 'side', 'liteImage', '猫咪', 'layui-icon-picture', 30, 'enabled', '{"api":"/api/v1/liteimage?type=maomi","data":{"category":"maomi"}}'),
  ('liteword-sgyl', NULL, 'side', 'liteWord', '诗歌语录', 'layui-icon-read', 10, 'enabled', '{"api":"/api/v1/liteword?type=sgyl","data":{"category":"sgyl"}}'),
  ('liteword-pyq', NULL, 'side', 'liteWord', '朋友圈', 'layui-icon-read', 20, 'enabled', '{"api":"/api/v1/liteword?type=pyq","data":{"category":"pyq"}}'),
  ('liteword-wenrou', NULL, 'side', 'liteWord', '温柔文案', 'layui-icon-read', 30, 'enabled', '{"api":"/api/v1/liteword?type=wenrou","data":{"category":"wenrou"}}');
