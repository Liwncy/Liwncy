CREATE TABLE bookmark_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE bookmark_links (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL
);

INSERT INTO bookmark_categories (id, name, sort_order) VALUES
  ('cat-site', '本站', 1),
  ('cat-code', '代码', 2);

INSERT INTO bookmark_links (id, category_id, title, url, description, sort_order) VALUES
  ('link-notes', 'cat-site', '个人笔记本', 'https://liwncy-notes.apifox.cn', '平时工作中的笔记以及灵感。', 1),
  ('link-kvideo', 'cat-site', '私人观影院', 'https://kvideo-cqp.pages.dev', 'Cloudflare 部署 KVideo 实现自由观影。', 2),
  ('link-github', 'cat-code', 'Github', 'https://github.com/liwncy', '', 1),
  ('link-gitee', 'cat-code', 'Gitee', 'https://gitee.com/liwncy', '', 2);
