import { Hono } from 'hono'
import type { AppEnv } from '../../env'
import { fetchWord, listWordMenus, WordError } from './words.service'

export const wordsController = new Hono<AppEnv>()

wordsController.get('/api/words/menus', async (c) => {
  return c.json({ groups: await listWordMenus(c.env.DB) })
})

wordsController.get('/api/words', async (c) => {
  return c.json(await fetchWord(c.env.DB, c.req.query('id') ?? ''))
})

wordsController.onError((error, c) => {
  if (error instanceof WordError) {
    return c.json({ message: error.message }, error.status as 400)
  }
  console.error(error)
  return c.json({ message: '这句没取到，再试下' }, 500)
})
