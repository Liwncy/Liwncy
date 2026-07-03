:::: anchor
::::

:::: title 背景说明
::::

:::: describe GitHub Pages 不认识 Vue Router 的 history 子路由，直接访问 `/lite-video`、`/admin/dashboard` 这类路径时，会先按静态文件查找，所以容易出现 404。
::::

Vue Router 使用 `history` 模式时，页面路径看起来像真实地址：

```text
/
/lite-video
/admin/dashboard
```

在本地 Vite 开发服务器里，这些路径都能正常访问。但部署到 GitHub Pages 后，直接打开子页面或刷新子页面时，GitHub Pages 会把 URL 当成真实文件路径处理。

例如访问：

```text
https://liwncy.github.io/lite-video
```

GitHub Pages 会尝试查找仓库里的 `lite-video` 文件或目录。实际静态站点里只有 `index.html` 和 `assets/`，所以服务器层面会返回 404。

:::: quote

这个问题不是 Vue Router 配置错误，而是 GitHub Pages 静态托管的限制。

::::

:::: title 解决思路
::::

把构建后的 `index.html` 复制一份，改名为 `404.html`，放在 GitHub Pages 仓库根目录。

当 GitHub Pages 找不到 `/lite-video` 这种真实路径时，会返回 `404.html`。只要 `404.html` 内容和 `index.html` 一样，浏览器仍然能加载 Vue 应用。Vue 启动后会根据当前 URL 渲染正确的路由页面。

:::: describe 这种方式下，直接访问子页面时 HTTP 状态码仍可能是 `404`，但页面内容能正常渲染。这是 GitHub Pages + history 路由的常见兜底方案。
::::

:::: table

| 文件 | 作用 |
|------|------|
| `index.html` | 正常访问站点首页时加载 Vue 应用 |
| `404.html` | 直接访问子路由时兜底加载 Vue 应用 |
| `.nojekyll` | 禁止 GitHub Pages 按 Jekyll 规则处理静态资源 |
| `assets/` | Vite 构建后的 JS、CSS、图片等静态资源 |

::::

:::: title 手动发布步骤
::::

### 1. 构建前端

在 `mi-xian-ju-ui` 目录执行：

```powershell
pnpm build:prod
```

构建产物会生成到：

```text
D:\Workspace\mygithub\Liwncy\mi-xian-ju-ui\dist
```

### 2. 清空 GitHub Pages 仓库旧文件

目标目录：

```text
D:\Workspace\mygithub\Liwncy.github.io
```

清空该目录下除 `.git` 以外的旧文件和旧 `assets`。

:::: quote

不要删除 `.git` 目录，否则目标仓库会丢失 Git 信息。

::::

### 3. 复制 dist 文件

把：

```text
D:\Workspace\mygithub\Liwncy\mi-xian-ju-ui\dist\*
```

复制到：

```text
D:\Workspace\mygithub\Liwncy.github.io
```

复制完成后，目标目录应该类似：

```text
Liwncy.github.io/
├── assets/
├── index.html
└── ...
```

### 4. 复制 404.html

在 `Liwncy.github.io` 根目录，把 `index.html` 复制一份并命名为 `404.html`：

```powershell
Copy-Item `
  -Path "D:\Workspace\mygithub\Liwncy.github.io\index.html" `
  -Destination "D:\Workspace\mygithub\Liwncy.github.io\404.html" `
  -Force
```

最终根目录至少应该有：

```text
index.html
404.html
assets/
```

### 5. 添加 .nojekyll

建议保留一个空的 `.nojekyll` 文件：

```powershell
New-Item `
  -Path "D:\Workspace\mygithub\Liwncy.github.io\.nojekyll" `
  -ItemType File `
  -Force
```

### 6. 提交并推送

进入 `Liwncy.github.io` 目录：

```powershell
cd D:\Workspace\mygithub\Liwncy.github.io
git add -A
git commit -m "部署更新"
git push
```

推送后，GitHub Pages 会自动发布。

:::: title 一键命令
::::

如果确认目标仓库没有未提交内容，可以用下面的 PowerShell 命令完成复制：

```powershell
cd D:\Workspace\mygithub\Liwncy\mi-xian-ju-ui
pnpm build:prod

Get-ChildItem -Force "D:\Workspace\mygithub\Liwncy.github.io" |
  Where-Object { $_.Name -ne ".git" } |
  Remove-Item -Recurse -Force

Copy-Item `
  -Path "D:\Workspace\mygithub\Liwncy\mi-xian-ju-ui\dist\*" `
  -Destination "D:\Workspace\mygithub\Liwncy.github.io" `
  -Recurse `
  -Force

Copy-Item `
  -Path "D:\Workspace\mygithub\Liwncy.github.io\index.html" `
  -Destination "D:\Workspace\mygithub\Liwncy.github.io\404.html" `
  -Force

New-Item `
  -Path "D:\Workspace\mygithub\Liwncy.github.io\.nojekyll" `
  -ItemType File `
  -Force

cd D:\Workspace\mygithub\Liwncy.github.io
git add -A
git commit -m "部署更新"
git push
```

:::: title 验证方式
::::

发布后访问首页：

```text
https://liwncy.github.io/
```

再直接访问子页面：

```text
https://liwncy.github.io/lite-video
https://liwncy.github.io/admin/dashboard
```

如果能看到 Vue 应用正常渲染，就说明 fallback 生效。

:::: title 注意事项
::::

:::: table

| 注意点 | 说明 |
|--------|------|
| 每次构建后都要重新复制 `404.html` | Vite 资源文件名带 hash，旧 `404.html` 可能引用旧资源 |
| 子页面直达可能仍是 HTTP 404 | GitHub Pages 返回的是 404 页面，但页面内容能正常渲染 |
| `.nojekyll` 建议保留 | 避免 GitHub Pages 对静态资源做 Jekyll 处理 |
| hash 路由不需要该方案 | 例如 `/#/lite-video`，但 URL 不如 history 模式美观 |

::::
