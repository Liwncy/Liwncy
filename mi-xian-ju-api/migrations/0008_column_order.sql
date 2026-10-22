CREATE TABLE api_platforms_next (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  base_url   TEXT NOT NULL,
  auth_json  TEXT NOT NULL DEFAULT '{}',
  status     TEXT NOT NULL DEFAULT 'enabled',
  note       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO api_platforms_next (id, name, base_url, auth_json, status, note, created_at, updated_at)
SELECT id, name, base_url, auth_json, status, note, created_at, updated_at
FROM api_platforms;

CREATE TABLE api_endpoints_next (
  id           TEXT PRIMARY KEY,
  platform_id  TEXT NOT NULL REFERENCES api_platforms_next(id),
  name         TEXT NOT NULL,
  method       TEXT NOT NULL DEFAULT 'GET',
  path         TEXT NOT NULL,
  request_json TEXT NOT NULL DEFAULT '{}',
  mapping_json TEXT,
  status       TEXT NOT NULL DEFAULT 'enabled',
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO api_endpoints_next (
  id, platform_id, name, method, path, request_json, mapping_json, status, note, created_at, updated_at
)
SELECT id, platform_id, name, method, path, request_json, mapping_json, status, note, created_at, updated_at
FROM api_endpoints;

CREATE TABLE api_menus_next (
  id           TEXT PRIMARY KEY,
  endpoint_id  TEXT NOT NULL REFERENCES api_endpoints_next(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'page',
  ref          TEXT NOT NULL,
  group_title  TEXT NOT NULL DEFAULT '',
  sort         INTEGER NOT NULL DEFAULT 100,
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO api_menus_next (id, endpoint_id, kind, ref, group_title, sort, note, created_at, updated_at)
SELECT id, endpoint_id, kind, ref, group_title, sort, note, created_at, updated_at
FROM api_menus;

DROP TABLE api_menus;
DROP TABLE api_endpoints;
DROP TABLE api_platforms;

ALTER TABLE api_platforms_next RENAME TO api_platforms;
ALTER TABLE api_endpoints_next RENAME TO api_endpoints;
ALTER TABLE api_menus_next RENAME TO api_menus;

CREATE INDEX idx_api_endpoints_platform_id ON api_endpoints(platform_id);
CREATE INDEX idx_api_menus_kind_ref_sort ON api_menus(kind, ref, sort);
