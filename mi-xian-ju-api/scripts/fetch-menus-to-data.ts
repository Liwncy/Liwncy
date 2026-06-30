/**
 * 从各页面 menu 原始 API 拉取数据，转为新 MenuNode 格式写入 data/，可选同步 KV。
 *
 * 用法：
 *   pnpm fetch:menus
 *   pnpm fetch:menus -- --api-base=http://127.0.0.1:8787/api
 *   pnpm fetch:menus -- --dry-run
 *   pnpm fetch:menus -- --sync-kv
 *   pnpm fetch:menus -- --only=topMenu,hotBans
 *
 * Apifox Mock 需携带 clientid（与 GithubIo request.ts 一致），否则返回随机假数据。
 *
 * 数据源优先级：
 *   1. --api-base + /webs/...（默认 Apifox Mock）
 *   2. 本地已有 data/
 *   3. mi-xian-ju-ui/src/config/*-menus.json
 *   4. GitHub Raw legacy（--raw-ref）
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { canonicalizeMenuTree } from '../src/common/canonicalize-menu'
import { normalizeMenuTree } from '../src/common/normalize-menu'
import type { MenuNode } from '../src/common/menu.types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const DATA_DIR = path.join(ROOT, 'data')
const UI_CONFIG_DIR = path.join(ROOT, 'mi-xian-ju-ui/src/config')

/** 与 GithubIo .env VITE_API_URL / VITE_CLIENT_ID 一致 */
const DEFAULT_API_BASE = 'https://m1.apifoxmock.com/m1/7609513-7348322-default'
const DEFAULT_CLIENT_ID = '6e64c2eeb9c6716965a67a6f8d3879e0'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const syncKv = args.includes('--sync-kv')
const syncKvRemote = args.includes('--sync-kv-remote')
const apiBase = (args.find((a) => a.startsWith('--api-base='))?.split('=')[1]
  ?? process.env.MENU_API_BASE
  ?? DEFAULT_API_BASE).replace(/\/$/, '')
const clientId = args.find((a) => a.startsWith('--client-id='))?.split('=')[1]
  ?? process.env.MENU_CLIENT_ID
  ?? DEFAULT_CLIENT_ID
const rawRef = args.find((a) => a.startsWith('--raw-ref='))?.split('=')[1] ?? '351d8cd'
const rawBase = `https://raw.githubusercontent.com/Liwncy/Liwncy/${rawRef}/data`
const onlyArg = args.find((a) => a.startsWith('--only='))?.split('=')[1]
const onlySet = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim())) : null

interface MenuTask {
  key: string
  apiPath: string
  dataFile: string
  topMenu?: boolean
  apiParams?: Record<string, string>
  configFallback?: string
}

const TASKS: MenuTask[] = [
  {
    key: 'topMenu',
    apiPath: '/webs/layout/topMenu',
    dataFile: 'webs/layout/topMenu/index',
    topMenu: true,
  },
  {
    key: 'hotBans',
    apiPath: '/webs/hotBans/getSideMenus',
    dataFile: 'webs/hotBans/sideMenu/index',
    configFallback: 'hot-bans-menus.json',
  },
  {
    key: 'bookMark',
    apiPath: '/webs/bookMark/getBookMarks',
    dataFile: 'webs/bookMark/sideMenu/index',
    apiParams: { dataSource: '0' },
  },
  {
    key: 'bookMarkLike',
    apiPath: '/webs/bookMark/getBookMarks',
    dataFile: 'webs/bookMark/sideMenu/index_like',
    apiParams: { dataSource: '1' },
  },
  {
    key: 'liteVideo',
    apiPath: '/webs/liteVideo/sideMenu',
    dataFile: 'webs/liteVideo/sideMenu/index',
    configFallback: 'lite-video-menus.json',
  },
  {
    key: 'liteImage',
    apiPath: '/webs/liteImage/sideMenu',
    dataFile: 'webs/liteImage/sideMenu/index',
    configFallback: 'lite-image-menus.json',
  },
  {
    key: 'liteWord',
    apiPath: '/webs/liteWord/sideMenu',
    dataFile: 'webs/liteWord/sideMenu/index',
    configFallback: 'lite-word-menus.json',
  },
  {
    key: 'aiTool',
    apiPath: '/webs/aiTool/sideMenu',
    dataFile: 'webs/aiTool/sideMenu/index',
    configFallback: 'ai-tools-menus.json',
  },
  {
    key: 'dailyhot',
    apiPath: '/webs/dailyhot/sideMenu',
    dataFile: 'webs/dailyhot/sideMenu/index',
    configFallback: 'daily-hot-menus.json',
  },
]

interface ApiResultLike {
  success?: boolean
  code?: number
  data?: unknown
}

function isLikelyMockData(body: ApiResultLike, nodes: MenuNode[]): boolean {
  if (!nodes.length) return true
  // Apifox 部分接口 success 字段不准，以 code=200 或有效中文菜单为准
  if (body.code === 200) return false
  if (body.success === true) return false
  const text = JSON.stringify(nodes).slice(0, 800)
  return /irure|consectetur|lorem|adipisicing|culpa/i.test(text)
}

function apiHeaders(): HeadersInit {
  return { clientid: clientId }
}

async function fetchJson(url: string, headers?: HeadersInit): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchFromApi(task: MenuTask): Promise<MenuNode[] | null> {
  const url = new URL(apiBase + task.apiPath)
  if (task.apiParams) {
    for (const [k, v] of Object.entries(task.apiParams)) {
      url.searchParams.set(k, v)
    }
  }

  try {
    const body = (await fetchJson(url.toString(), apiHeaders())) as ApiResultLike | unknown[]
    const raw = Array.isArray(body) ? body : (body as ApiResultLike).data
    if (!Array.isArray(raw) || !raw.length) return null
    const nodes = normalizeMenuTree(raw)
    const result = Array.isArray(body) ? { success: true } : (body as ApiResultLike)
    if (isLikelyMockData(result, nodes)) {
      console.warn(`  [skip api] ${task.key}: 疑似 Apifox 随机 mock（检查 clientid）`)
      return null
    }
    console.log(`  [api] ${task.key} ← ${url}`)
    return nodes
  } catch (err) {
    console.warn(`  [api fail] ${task.key}: ${(err as Error).message}`)
    return null
  }
}

async function fetchFromRaw(task: MenuTask): Promise<MenuNode[] | null> {
  const url = `${rawBase}/${task.dataFile}`
  try {
    const raw = await fetchJson(url)
    if (!Array.isArray(raw) || !raw.length) return null
    console.log(`  [raw] ${task.key} ← ${url}`)
    return normalizeMenuTree(raw)
  } catch {
    return null
  }
}

async function fetchFromConfig(task: MenuTask): Promise<MenuNode[] | null> {
  if (!task.configFallback) return null
  const filePath = path.join(UI_CONFIG_DIR, task.configFallback)
  try {
    const raw = JSON.parse(await readFile(filePath, 'utf-8'))
    if (!Array.isArray(raw) || !raw.length) return null
    console.log(`  [config] ${task.key} ← ${task.configFallback}`)
    return normalizeMenuTree(raw)
  } catch {
    return null
  }
}

async function fetchFromLocalData(task: MenuTask): Promise<MenuNode[] | null> {
  const filePath = path.join(DATA_DIR, task.dataFile)
  try {
    const raw = JSON.parse(await readFile(filePath, 'utf-8'))
    if (!Array.isArray(raw) || !raw.length) return null
    console.log(`  [local] ${task.key} ← data/${task.dataFile}`)
    return normalizeMenuTree(raw)
  } catch {
    return null
  }
}

async function resolveMenu(task: MenuTask): Promise<MenuNode[] | null> {
  return (
    (await fetchFromApi(task)) ??
    (await fetchFromLocalData(task)) ??
    (await fetchFromConfig(task)) ??
    (await fetchFromRaw(task))
  )
}

async function writeMenuFile(task: MenuTask, nodes: MenuNode[]) {
  const canonical = canonicalizeMenuTree(nodes, { topMenu: task.topMenu })
  const filePath = path.join(DATA_DIR, task.dataFile)
  const content = `${JSON.stringify(canonical, null, 2)}\n`

  if (dryRun) {
    console.log(`  [dry-run] would write data/${task.dataFile} (${content.length} bytes)`)
    return
  }

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf-8')
  console.log(`  [write] data/${task.dataFile}`)
}

async function syncToKv(dataFile: string) {
  const filePath = path.join(DATA_DIR, dataFile)
  const kvFlags = syncKvRemote ? '--preview false' : '--local --preview'
  execSync(
    `wrangler kv key put "${dataFile}" --path="${filePath}" --binding=DATA_KV ${kvFlags}`,
    { stdio: 'inherit', cwd: path.resolve(__dirname, '..') },
  )
}

async function main() {
  console.log(`API base: ${apiBase}`)
  console.log(`Client ID: ${clientId}`)
  console.log(`Raw base: ${rawBase}\n`)

  const tasks = onlySet ? TASKS.filter((t) => onlySet.has(t.key)) : TASKS
  const written: string[] = []

  for (const task of tasks) {
    console.log(`→ ${task.key}`)
    const nodes = await resolveMenu(task)
    if (!nodes?.length) {
      console.warn(`  [skip] ${task.key}: 无可用数据源\n`)
      continue
    }
    await writeMenuFile(task, nodes)
    written.push(task.dataFile)
    console.log('')
  }

  if (syncKv && written.length && !dryRun) {
    console.log('Syncing KV...')
    for (const file of written) {
      syncToKv(file)
    }
  }

  console.log(`Done. ${written.length} menu file(s) updated.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
