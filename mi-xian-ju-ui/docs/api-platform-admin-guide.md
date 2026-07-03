:::: anchor
::::

:::: title 平台入口
::::

:::: describe 后台 API 接口平台用于维护 `mi-xian-ju-api` 的 D1 配置，让芈仙居公开接口固定，对外部平台调用方式可配置、可替换、可 fallback。
::::

后台登录地址：

```text
/admin/login
```

登录成功后进入：

```text
/admin/dashboard
```

公开接口统一使用：

```text
/api/v1/:code
```

例如：

```text
/api/v1/litevideo?category=xiaojiejie
/api/v1/liteimage?category=sjtp
/api/v1/liteword?category=wenrou
```

:::: table

| 后台菜单 | 用途 |
|----------|------|
| 控制台 | 查看接口、参数、平台源、Adapter 数量，并快速跳转 |
| 功能接口 | 维护公开接口和功能 Adapter 绑定 |
| 参数契约 | 维护公开参数、Route 场景、Adapter 参数映射 |
| 平台适配 | 维护平台源、Adapter、响应映射 |

::::

:::: title 核心概念
::::

:::: table

| 概念 | 说明 | 示例 |
|------|------|------|
| 功能接口 | 芈仙居对外固定暴露的接口 | `litevideo` |
| 平台源 | 第三方 API 平台基础信息 | `遇见 API` / `https://api.yujn.cn` |
| Adapter | 某个平台上的一种调用方式 | `yujn-json` |
| 公开参数 | 芈仙居接口允许用户传入的参数 | `category=xiaojiejie` |
| Route 场景 | 根据公开参数匹配不同调用场景 | `{"category":"xiaojiejie"}` |
| 参数映射 | 把公开参数转换为第三方请求参数 | `path=/api/{{category}}.php` |
| 功能 Adapter 绑定 | 功能接口在某个 Route 下可调用的 Adapter | `litevideo + xiaojiejie + yujn-json` |
| 响应映射 | 把第三方返回值转换为芈仙居统一结构 | `{"url":"data.url"}` |

::::

:::: quote

公开参数不等于第三方 API 参数。后台可以把公开参数映射到第三方请求的 `path`、`query`、`header` 或 `body`。

::::

参数映射示例：

```text
公开参数：category
目标：param
目标 Key：path
模板：/api/{{category}}.php
```

Adapter URL 模板：

```text
{{baseUrl}}{{path}}
```

最终请求：

```text
https://api.yujn.cn/api/xiaojiejie.php
```

:::: title 控制台
::::

路径：

```text
/admin/dashboard
```

用途：

- 查看接口数量
- 查看参数场景数量
- 查看平台源数量
- 查看 Adapter 数量
- 快速进入功能接口、参数契约、平台适配页面

:::: title 功能接口
::::

路径：

```text
/admin/api/functions
```

该页面维护两部分：

- 功能接口
- 功能 Adapter 绑定

### 新增功能接口

点击 `新增接口`，填写公开接口基础信息。

:::: table

| 字段 | 说明 | 示例 |
|------|------|------|
| 接口编码 | 公开接口 code，优先使用小写单词；单词表达不清时再组合 | `litevideo` |
| 名称 | 后台展示名称 | `轻视频` |
| 方法 | 公开接口请求方法 | `GET` |
| 响应类型 | 返回标准化类型 | `video-url` |
| 描述 | 接口说明 | `随机热门视频` |
| 参数 Schema | JSON Schema 风格说明，可为空 | `{"type":"object"}` |
| 默认参数 | JSON 对象 | `{}` |
| 公开接口 | 是否允许 `/api/v1/:code` 访问 | `是` |
| 状态 | 是否启用 | `enabled` |

::::

常见响应类型：

```text
raw
video-url
image-url
text-lines
```

保存后，公开接口地址就是：

```text
/api/v1/{接口编码}
```

### 新增 Adapter 绑定

点击 `新增绑定`，配置某个功能接口可以调用哪个 Adapter。

:::: table

| 字段 | 说明 |
|------|------|
| 功能接口 | 选择要绑定的公开功能 |
| Route | 选择参数场景，可不绑定 |
| Adapter | 选择调用哪个第三方 Adapter |
| 优先级 | 数字越小越先调用 |
| 权重 | 预留权重，正整数 |
| Fallback | 当前 Adapter 失败后是否继续尝试下一个 |
| 固定参数 | 总是传入 Adapter 的参数 |
| 默认参数 | 绑定级别默认参数 |
| 状态 | 是否启用 |

::::

固定参数示例：

```json
{"path":"/api/xjj.php"}
```

### 多 Adapter fallback

:::: table

| 功能 | Route | Adapter | 优先级 | Fallback |
|------|-------|---------|--------|----------|
| `litevideo` | `xiaojiejie` | `yujn-json` | `100` | 开启 |
| `litevideo` | `xiaojiejie` | `other-json` | `200` | 开启 |

::::

调用逻辑：

1. 先调用优先级 `100` 的 Adapter。
2. 如果失败且 fallback 开启，则调用优先级 `200` 的 Adapter。
3. 如果全部失败，公开接口返回调用失败。

:::: title 参数契约
::::

路径：

```text
/admin/api/contracts
```

该页面维护三部分：

- 公开参数
- 参数场景 Route
- Adapter 参数映射

### 新增公开参数

点击 `新增参数`。

:::: table

| 字段 | 说明 | 示例 |
|------|------|------|
| 功能接口 | 参数所属功能 | `热门视频` |
| 参数 Key | 用户传入的参数名 | `category` |
| 名称 | 中文说明 | `视频分类` |
| 来源 | 参数来源 | `any` / `query` / `body` |
| 类型 | 参数类型 | `string` / `number` / `boolean` / `json` |
| 默认值 JSON | 默认值，可以是字符串、数字、对象等 | `"zzxjj"` |
| 可选值 JSON | 限定允许值，必须是数组 | `["xiaojiejie","zzxjj"]` |
| 说明 | 参数说明 | `芈仙居视频分类编码` |
| 排序 | 展示顺序 | `10` |
| 必填 | 是否必传 | `否` |
| 状态 | 是否启用 | `enabled` |

::::

### 新增 Route 场景

点击 `新增 Route`。

:::: table

| 字段 | 说明 | 示例 |
|------|------|------|
| 功能接口 | Route 所属功能 | `热门视频` |
| Route Key | 场景编码 | `xiaojiejie` |
| 名称 | 场景名称 | `小姐姐视频` |
| 匹配 JSON | 参数匹配条件 | `{"category":"xiaojiejie"}` |
| 默认参数 | 该场景默认参数 | `{}` |
| 排序 | 匹配顺序 | `10` |
| 状态 | 是否启用 | `enabled` |

::::

匹配 JSON 示例：

```json
{"category":"xiaojiejie"}
```

如果匹配 JSON 是空对象：

```json
{}
```

表示默认场景。

### 新增 Adapter 参数映射

点击 `新增映射`。

:::: table

| 字段 | 说明 | 示例 |
|------|------|------|
| 功能接口 | 所属功能 | `热门视频` |
| Route | 所属场景，可选 | `xiaojiejie` |
| Adapter | 目标 Adapter | `yujn-json` |
| 公开参数 | 用户传入的参数 | `category` |
| 目标 | 映射到 Adapter 的哪里 | `param` / `query` / `header` / `body` |
| 目标 Key | Adapter 参数名 | `path` |
| 模板 | 参数转换模板 | `/api/{{category}}.php` |
| 默认值 JSON | 参数缺省值 | `"zzxjj"` |
| 状态 | 是否启用 | `enabled` |

::::

常见目标说明：

:::: table

| 目标 | 作用 |
|------|------|
| `param` | 进入 Adapter URL 模板参数 |
| `query` | 拼接到 URL query |
| `header` | 作为请求头 |
| `body` | 作为 POST/PUT body 参数 |

::::

:::: title 平台适配
::::

路径：

```text
/admin/api/adapters
```

该页面维护三部分：

- 平台源
- Adapter
- 响应映射

### 新增平台源

点击 `新增平台`。

:::: table

| 字段 | 说明 | 示例 |
|------|------|------|
| 编码 | 平台编码 | `yujn` |
| 名称 | 平台名称 | `遇见 API` |
| Base URL | 平台基础地址 | `https://api.yujn.cn` |
| 超时 | 请求超时毫秒数 | `20000` |
| 状态 | 是否启用 | `enabled` |

::::

### 新增 Adapter

点击 `新增 Adapter`。

:::: table

| 字段 | 说明 | 示例 |
|------|------|------|
| 平台源 | 所属平台 | `遇见 API` |
| 编码 | Adapter 编码 | `yujn-json` |
| 名称 | Adapter 名称 | `遇见 API JSON 通用适配器` |
| 类型 | Adapter 类型 | `http_custom` |
| 方法 | HTTP 方法 | `GET` |
| Body 类型 | body 格式 | `none` |
| URL 模板 | 请求 URL 模板 | `{{baseUrl}}{{path}}` |
| Headers JSON | 请求头 JSON | `{}` |
| Query JSON | 默认 Query JSON | `{"type":"json"}` |
| 超时 | 请求超时毫秒数 | `20000` |
| 状态 | 是否启用 | `enabled` |

::::

URL 模板常见变量：

```text
{{baseUrl}}
{{path}}
{{category}}
```

### 新增响应映射

点击 `新增映射`。

:::: table

| 字段 | 说明 |
|------|------|
| Adapter | 哪个 Adapter 的返回 |
| 功能接口 | 哪个功能使用，留空表示通用 |
| Data Path | 从响应中取哪一层数据 |
| Items Path | 从 data 中取列表路径 |
| 字段映射 JSON | 输出字段和来源路径的映射 |
| 状态 | 是否启用 |

::::

假设第三方返回：

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "title": "标题",
        "url": "https://example.com/a.mp4"
      }
    ]
  }
}
```

可以配置：

```text
Data Path: data
Items Path: list
```

字段映射：

```json
{
  "title": "title",
  "url": "url"
}
```

系统会先应用响应映射，再根据功能接口的响应类型做标准化。

:::: title 完整示例：litevideo
::::

目标：

```text
/api/v1/litevideo?category=xiaojiejie
```

调用第三方：

```text
https://api.yujn.cn/api/xiaojiejie.php?type=json
```

:::: table

| 步骤 | 配置内容 |
|------|----------|
| 1. 平台源 | `yujn` / `遇见 API` / `https://api.yujn.cn` |
| 2. Adapter | `yujn-json` / `GET` / `{{baseUrl}}{{path}}` / Query `{"type":"json"}` |
| 3. 功能接口 | `litevideo` / `轻视频` / `GET` / `video-url` |
| 4. 公开参数 | `category` / 默认值 `"zzxjj"` / 类型 `string` |
| 5. Route | `xiaojiejie` / 匹配 `{"category":"xiaojiejie"}` |
| 6. 参数映射 | `category` -> `param.path` / `/api/{{category}}.php` |
| 7. Adapter 绑定 | `litevideo + xiaojiejie + yujn-json` / 优先级 `100` |

::::

验证访问：

```text
https://mxjapi.lwcfworker.dpdns.org/api/v1/litevideo?category=xiaojiejie
```

预期返回：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "code": "litevideo",
    "name": "轻视频",
    "responseType": "video-url",
    "data": {
      "url": "https://..."
    }
  }
}
```

:::: title 配置排查顺序
::::

如果公开接口访问失败，可以按下面顺序检查：

1. 功能接口是否启用，是否公开。
2. 请求方法是否匹配，例如功能配置为 `GET`，请求也必须是 `GET`。
3. 公开参数是否启用，必填参数是否传入。
4. Route 是否能匹配当前参数。
5. 功能 Adapter 绑定是否启用。
6. Adapter 是否启用。
7. 平台源是否启用。
8. 参数映射是否正确生成第三方请求参数。
9. URL 模板是否能拼出正确第三方地址。
10. 第三方 API 是否可访问。
11. 响应映射是否配置错误。
12. 响应类型是否适合当前返回值。

:::: title 常见问题
::::

:::: table

| 问题 | 优先检查 |
|------|----------|
| 没有匹配的参数场景 | Route 的匹配 JSON 是否覆盖当前请求参数 |
| 暂无可用 adapter | 功能 Adapter 绑定、Adapter、平台源是否启用 |
| 第三方 URL 拼错 | Adapter URL 模板和参数映射是否正确 |
| POST 参数没有传过去 | 参数映射目标是否为 `body`，Adapter Body 类型是否不是 `none` |
| 返回结构不符合前端预期 | 响应类型、Data Path、Items Path、字段映射 JSON |

::::

:::: title 推荐配置顺序
::::

新增一个完整 API 时，建议按下面顺序：

1. 新增平台源。
2. 新增 Adapter。
3. 新增功能接口。
4. 新增公开参数。
5. 新增 Route。
6. 新增参数映射。
7. 新增功能 Adapter 绑定。
8. 必要时新增响应映射。
9. 访问 `/api/v1/:code` 验证。
10. 前端页面接入该接口。
