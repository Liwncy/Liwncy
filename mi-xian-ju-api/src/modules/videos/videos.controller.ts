import { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { fetchVideo, listVideoMenus, VideoError } from './videos.service'

export const videosController = new Hono<AppEnv>()

videosController.get('/api/videos/menus', async (c) => {
  return c.json({ groups: await listVideoMenus(c.env.DB) })
})

videosController.get('/api/videos', async (c) => {
  return c.json(await fetchVideo(c.env.DB, c.req.query('id') ?? ''))
})

videosController.onError((error, c) => {
  if (error instanceof VideoError) {
    return c.json({ message: error.message }, error.status as 400)
  }
  console.error(error)
  return c.json({ message: '这支没取到，再试下' }, 500)
})
