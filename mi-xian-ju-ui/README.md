# 芈仙居 UI（mi-xian-ju-ui）



Vue 3 + Layui Vue 前端，与 [mi-xian-ju-api](../mi-xian-ju-api) 配套。



## 结构



```

src/

├── layouts/

│   ├── site/            # 主站布局（/）

│   └── admin/           # 精简 Admin 布局（/admin）

├── views/

│   ├── site/            # 首页、书签、热榜等

│   └── admin/           # 登录、控制台

├── router/

│   ├── site.routes.ts   # 主站路由，无 /webs 前缀

│   └── admin.routes.ts

├── api/                 # 请求 mi-xian-ju-api

└── store/

```



## 路由



| 路径 | 说明 |

|------|------|

| `/` | 首页 |

| `/bookmark` | 书签 |

| `/notes` | 随记 |

| `/read` | 文章阅读 |

| `/ai-tools` | AI 工具 |

| `/personality-test` | 性格测试 |

| `/hot-bans` | 热榜（60s API） |

| `/daily-hot` | 今日热榜（Peark API） |

| `/lite-video` | 随机视频（遇见 API + xgplayer） |
| `/lite-image` | 图片浏览 |
| `/lite-word` | 文案工具 |

| `/admin/dashboard` | 控制台 |



## 开发



```bash

# 终端 1：API

cd mi-xian-ju-api && pnpm dev



# 终端 2：UI

cd mi-xian-ju-ui

pnpm install

pnpm dev     # http://127.0.0.1:5678

pnpm typecheck

pnpm build

```



Vite 已将 `/api`、`/data` 代理到 `http://127.0.0.1:8787`。



## 与 GithubIo 的关系



本项目从 GithubIo 精简迁移而来，去除 docs / admin 模板演示页，保留 Layui Vue 作为 UI 库。迁移完成后可删除 `GithubIo/`。

