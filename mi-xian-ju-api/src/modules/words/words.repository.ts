import type { AppDatabase } from '../../env'

export type WordMenuRow = {
  id: string
  parent_id: string | null
  title: string
  sort: number
  payload_json: string
}

export async function listLiteWordMenus(db: AppDatabase) {
  const result = await db
    .prepare(
      `SELECT id, parent_id, title, sort, payload_json
       FROM api_menus
       WHERE scope = 'side' AND module = 'liteWord' AND status = 'enabled'
       ORDER BY sort, id`,
    )
    .all<WordMenuRow>()
  return result.results
}

export async function findYujnBaseUrl(db: AppDatabase) {
  const result = await db
    .prepare(`SELECT base_url FROM api_sources WHERE id = 'src_yujn'`)
    .all<{ base_url: string }>()
  return result.results[0]?.base_url ?? 'https://api.yujn.cn'
}
