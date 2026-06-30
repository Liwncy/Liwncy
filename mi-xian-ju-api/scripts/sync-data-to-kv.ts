/**
 * 将仓库根目录 data/ 同步到 Cloudflare KV。
 *
 * 用法：
 *   pnpm sync:kv -- --dry-run
 *   pnpm sync:kv -- --prefix=common
 *   pnpm sync:kv                    # 默认写入本地 preview KV（wrangler dev 使用）
 *   pnpm sync:kv -- --remote        # 写入线上 production KV（deploy 前）
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const remote = args.includes('--remote')
const prefixArg = args.find((a: string) => a.startsWith('--prefix='))?.split('=')[1]

/** wrangler dev 绑定 preview_id；本地开发须 --local --preview */
function wranglerKvPutFlags(): string {
  return remote ? '--preview false' : '--local --preview'
}

async function collectFiles(dir: string, base = ''): Promise<string[]> {
  const entries = await readdir(dir)
  const files: string[] = []

  for (const entry of entries) {
    const full = path.join(dir, entry)
    const rel = base ? `${base}/${entry}` : entry
    const info = await stat(full)
    if (info.isDirectory()) {
      files.push(...(await collectFiles(full, rel)))
    } else {
      files.push(rel.replace(/\\/g, '/'))
    }
  }

  return files
}

async function main() {
  const files = await collectFiles(DATA_DIR)
  const filtered = prefixArg ? files.filter((f) => f.startsWith(prefixArg)) : files

  console.log(
    `Found ${filtered.length} file(s) under data/ → ${remote ? 'remote production KV' : 'local preview KV (wrangler dev)'}`,
  )

  for (const rel of filtered) {
    const kvKey = rel
    const filePath = path.join(DATA_DIR, rel)
    const content = await readFile(filePath, 'utf-8')

    if (dryRun) {
      console.log(`[dry-run] ${kvKey} (${content.length} bytes)`)
      continue
    }

    execSync(
      `wrangler kv key put "${kvKey}" --path="${filePath}" --binding=DATA_KV ${wranglerKvPutFlags()}`,
      { stdio: 'inherit', cwd: path.resolve(__dirname, '..') },
    )
    console.log(`uploaded: ${kvKey}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
