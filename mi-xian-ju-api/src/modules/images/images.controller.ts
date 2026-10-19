import { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { fetchImage, ImageError, listImageMenus } from './images.service'

export const imagesController = new Hono<AppEnv>()

imagesController.get('/api/images/menus', async (c) => {
  return c.json({ groups: await listImageMenus(c.env.DB) })
})

imagesController.get('/api/images', async (c) => {
  return c.json(await fetchImage(c.env.DB, c.req.query('id') ?? ''))
})

imagesController.onError((error, c) => {
  if (error instanceof ImageError) {
    return c.json({ message: error.message }, error.status as 400)
  }
  console.error(error)
  return c.json({ message: '这张没取到，再试下' }, 500)
})
