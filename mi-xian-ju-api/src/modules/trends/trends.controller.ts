import { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { listTrends, TrendError } from './trends.service'

export const trendsController = new Hono<AppEnv>()

trendsController.get('/api/trends', async (c) => {
  return c.json(
    await listTrends(c.env.DB, {
      platform: c.req.query('platform'),
      limit: c.req.query('limit'),
      maxAgeHours: c.req.query('maxAgeHours'),
    }),
  )
})

trendsController.onError((error, c) => {
  if (error instanceof TrendError) {
    return c.json({ message: error.message }, error.status as 400)
  }
  console.error(error)
  return c.json({ message: '热榜没读出来' }, 500)
})
