import type { AppDatabase } from '../../env'
import { listCurrentTrendRows } from './trends.repository'

export const TREND_BOARDS = [
  { platform: 'zhihu', name: '知乎' },
  { platform: 'baidu', name: '百度' },
  { platform: 'bili', name: '哔哩哔哩' },
  { platform: 'toutiao', name: '头条' },
  { platform: 'douyin', name: '抖音' },
] as const

export type TrendPlatform = (typeof TREND_BOARDS)[number]['platform']

export type TrendItem = {
  id: number
  rank: number
  title: string
  detail: string | null
  hotValue: number | null
  hotLabel: string | null
  url: string | null
  coverUrl: string | null
}

export type TrendBoard = {
  platform: TrendPlatform
  name: string
  updatedAt: number
  items: TrendItem[]
}

export class TrendError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

const NAMES = new Map(TREND_BOARDS.map((board) => [board.platform, board.name]))

export async function listTrends(
  db: AppDatabase,
  input: { platform?: string; limit?: string; maxAgeHours?: string },
): Promise<{ generatedAt: number; boards: TrendBoard[] }> {
  const platform = readPlatform(input.platform)
  const limit = clampInt(input.limit, 30, 1, 50)
  const maxAgeHours = clampInt(input.maxAgeHours, 6, 1, 168)
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000
  const rows = await listCurrentTrendRows(db, cutoff, limit, platform)

  const grouped = new Map<TrendPlatform, TrendBoard>()
  for (const row of rows) {
    const name = NAMES.get(row.platform as TrendPlatform)
    if (!name) continue
    const key = row.platform as TrendPlatform
    let board = grouped.get(key)
    if (!board) {
      board = { platform: key, name, updatedAt: row.last_seen_at, items: [] }
      grouped.set(key, board)
    }
    board.items.push({
      id: row.id,
      rank: row.rank,
      title: row.title,
      detail: row.detail,
      hotValue: row.hot_value,
      hotLabel: row.hot_label,
      url: row.url,
      coverUrl: row.cover_url,
    })
  }

  const boards = TREND_BOARDS.flatMap((board) => {
    const found = grouped.get(board.platform)
    return found ? [found] : []
  })
  return { generatedAt: Date.now(), boards }
}

function readPlatform(value: string | undefined): TrendPlatform | undefined {
  if (!value) return undefined
  if (!NAMES.has(value as TrendPlatform)) {
    throw new TrendError('没有这个榜', 400)
  }
  return value as TrendPlatform
}

function clampInt(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}
