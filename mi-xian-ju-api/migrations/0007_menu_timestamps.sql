CREATE TABLE api_menus_next (
  id           TEXT PRIMARY KEY,
  endpoint_id  TEXT NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'page',
  ref          TEXT NOT NULL,
  group_title  TEXT NOT NULL DEFAULT '',
  sort         INTEGER NOT NULL DEFAULT 100,
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO api_menus_next (id, endpoint_id, kind, ref, group_title, sort, note, created_at, updated_at)
SELECT id, endpoint_id, kind, ref, group_title, sort, '', datetime('now'), datetime('now')
FROM api_menus;

DROP TABLE api_menus;
ALTER TABLE api_menus_next RENAME TO api_menus;
CREATE INDEX idx_api_menus_kind_ref_sort ON api_menus(kind, ref, sort);
