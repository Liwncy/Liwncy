import type { AppDatabase } from '../../env'

export type TrendRow = {
  id: number
  platform: string
  title: string
  rank: number
  detail: string | null
  hot_value: number | null
  hot_label: string | null
  url: string | null
  cover_url: string | null
  last_seen_at: number
}

export async function listCurrentTrendRows(
  db: AppDatabase,
  cutoff: number,
  limit: number,
  platform?: string,
) {
  const statement = db.prepare(`
    SELECT i.id, i.platform, i.title, i.rank, i.detail, i.hot_value, i.hot_label,
           i.url, i.cover_url, i.last_seen_at
    FROM trend_platform_state s
    CROSS JOIN trend_items i
      ON i.platform = s.platform AND i.last_seen_at = s.latest_seen_at
    WHERE s.latest_seen_at >= ?
      AND i.rank <= ?
      ${platform ? 'AND s.platform = ?' : ''}
    ORDER BY i.platform ASC, i.rank ASC
  `)
  const bound = platform ? statement.bind(cutoff, limit, platform) : statement.bind(cutoff, limit)
  const result = await bound.all<TrendRow>()
  return result.results
}
