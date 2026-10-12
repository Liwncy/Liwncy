import { Hono } from 'hono'

export const healthController = new Hono()

healthController.get('/api/health', (c) => {
  return c.json({ ok: true, service: 'mi-xian-ju-api' })
})
