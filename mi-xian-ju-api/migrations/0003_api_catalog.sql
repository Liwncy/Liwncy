CREATE TABLE api_platforms (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  base_url   TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'enabled',
  note       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE api_endpoints (
  id           TEXT PRIMARY KEY,
  platform_id  TEXT NOT NULL REFERENCES api_platforms(id),
  name         TEXT NOT NULL,
  method       TEXT NOT NULL DEFAULT 'GET',
  path         TEXT NOT NULL,
  query_json   TEXT NOT NULL DEFAULT '{}',
  mapping_json TEXT,
  status       TEXT NOT NULL DEFAULT 'enabled',
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_api_endpoints_platform_id ON api_endpoints(platform_id);

INSERT OR IGNORE INTO api_platforms (id, name, base_url, status, note)
VALUES ('yujn', '遇见 API', 'https://api.yujn.cn', 'enabled', '');
