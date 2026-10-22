DROP TABLE IF EXISTS api_menus;

ALTER TABLE api_placements RENAME TO api_menus;
ALTER TABLE api_menus RENAME COLUMN page TO ref;
ALTER TABLE api_menus ADD COLUMN kind TEXT NOT NULL DEFAULT 'page';

DROP INDEX IF EXISTS idx_api_placements_page;
CREATE INDEX idx_api_menus_kind_ref_sort ON api_menus(kind, ref, sort);

ALTER TABLE api_endpoints ADD COLUMN request_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE api_platforms ADD COLUMN auth_json TEXT NOT NULL DEFAULT '{}';
