CREATE TABLE api_placements (
  id           TEXT PRIMARY KEY,
  endpoint_id  TEXT NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  page         TEXT NOT NULL,
  group_title  TEXT NOT NULL DEFAULT '',
  sort         INTEGER NOT NULL DEFAULT 100
);

CREATE INDEX idx_api_placements_page ON api_placements(page, sort);

INSERT OR IGNORE INTO api_endpoints
  (id, platform_id, name, method, path, query_json, mapping_json, status, note)
VALUES
  ('ep-liteword-sgyl', 'yujn', '诗歌语录', 'GET', '/api/sgyl.php', '{"type":"json"}', NULL, 'enabled', ''),
  ('ep-liteword-pyq', 'yujn', '朋友圈', 'GET', '/api/pyq.php', '{"type":"json"}', '{"lines":"pyq"}', 'enabled', ''),
  ('ep-liteword-wenrou', 'yujn', '温柔文案', 'GET', '/api/wenrou.php', '{"type":"json"}', '{"lines":"echo"}', 'enabled', ''),
  ('ep-litevideo-xjj', 'yujn', '小姐姐', 'GET', '/api/xjj.php', '{"type":"json"}', '{"url":"data"}', 'enabled', ''),
  ('ep-litevideo-zzxjj', 'yujn', '转转小姐姐', 'GET', '/api/zzxjj.php', '{"type":"json"}', '{"url":"data"}', 'enabled', ''),
  ('ep-litevideo-sjxl', 'yujn', '随机系列', 'GET', '/api/sjxl.php', '{"type":"json"}', '{"url":"data"}', 'enabled', ''),
  ('ep-liteimage-heisi', 'yujn', '黑丝图片', 'GET', '/api/heisi.php', '{}', NULL, 'enabled', ''),
  ('ep-liteimage-tuji', 'yujn', '美女图集', 'GET', '/api/tuji.php', '{}', NULL, 'enabled', ''),
  ('ep-liteimage-fuji', 'yujn', '腹肌图片', 'GET', '/api/fujiimg.php', '{"type":"image"}', NULL, 'enabled', ''),
  ('ep-liteimage-gzl', 'yujn', '高清晰', 'GET', '/api/gzl_ACG.php', '{}', NULL, 'enabled', ''),
  ('ep-liteimage-sjtp', 'yujn', '随机头像', 'GET', '/api/sjtp.php', '{}', '{"urls":"image_url"}', 'enabled', ''),
  ('ep-liteimage-qltx', 'yujn', '情侣头像', 'GET', '/api/qltx.php', '{}', NULL, 'enabled', ''),
  ('ep-liteimage-maomi', 'yujn', '可爱猫咪', 'GET', '/api/maomi.php', '{}', NULL, 'enabled', ''),
  ('ep-liteimage-lltx', 'yujn', '网红美女', 'GET', '/api/lltx.php', '{"type":"image"}', NULL, 'enabled', ''),
  ('ep-liteimage-long', 'yujn', '龙图', 'GET', '/api/long.php', '{}', NULL, 'enabled', ''),
  ('ep-liteimage-emo', 'yujn', 'EMO', 'GET', '/api/emo.php', '{}', NULL, 'enabled', '');

INSERT OR IGNORE INTO api_placements (id, endpoint_id, page, group_title, sort) VALUES
  ('liteword-sgyl', 'ep-liteword-sgyl', 'words', '文案', 10),
  ('liteword-pyq', 'ep-liteword-pyq', 'words', '文案', 20),
  ('liteword-wenrou', 'ep-liteword-wenrou', 'words', '文案', 30),
  ('litevideo-xjj', 'ep-litevideo-xjj', 'videos', '视频源', 10),
  ('litevideo-zzxjj', 'ep-litevideo-zzxjj', 'videos', '视频源', 20),
  ('litevideo-sjxl', 'ep-litevideo-sjxl', 'videos', '视频源', 30),
  ('side-liteimage-aa', 'ep-liteimage-heisi', 'images', '🥰小姐姐', 101),
  ('side-liteimage-ab', 'ep-liteimage-tuji', 'images', '🥰小姐姐', 102),
  ('side-liteimage-ba', 'ep-liteimage-fuji', 'images', '😎小哥哥', 201),
  ('side-liteimage-eb', 'ep-liteimage-gzl', 'images', '🖼️壁纸', 301),
  ('side-liteimage-ca', 'ep-liteimage-sjtp', 'images', '👤换头像', 401),
  ('side-liteimage-cb', 'ep-liteimage-qltx', 'images', '👤换头像', 402),
  ('side-liteimage-cc', 'ep-liteimage-maomi', 'images', '👤换头像', 403),
  ('side-liteimage-cd', 'ep-liteimage-lltx', 'images', '👤换头像', 404),
  ('side-liteimage-da', 'ep-liteimage-long', 'images', '😂表情图', 501),
  ('side-liteimage-db', 'ep-liteimage-emo', 'images', '😂表情图', 502);
