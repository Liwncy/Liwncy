-- 未来 D1 菜单表参考结构（与 MenuNode 字段对应）
-- scope + module 区分顶部导航与各模块侧栏

CREATE TABLE IF NOT EXISTS menu (
  id TEXT NOT NULL,
  parent_id TEXT,
  scope TEXT NOT NULL CHECK (scope IN ('top', 'side')),
  module TEXT NOT NULL DEFAULT 'layout',
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  path TEXT,
  i18n_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  payload TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (scope, module, id)
);

CREATE INDEX IF NOT EXISTS idx_menu_parent ON menu (scope, module, parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_sort ON menu (scope, module, sort_order);
