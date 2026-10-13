import { Hono } from 'hono'
import type { AppEnv } from '../../env'
import {
  BookmarkError,
  createCategory,
  createLink,
  editLink,
  listCatalog,
  removeCategory,
  removeLink,
  renameCategory,
} from './bookmark.service'

export const bookmarkController = new Hono<AppEnv>()

bookmarkController.get('/api/bookmarks', async (c) => {
  return c.json({ categories: await listCatalog(c.env.DB) })
})

bookmarkController.post('/api/bookmarks/categories', async (c) => {
  const body = await c.req.json<{ name?: string }>()
  return c.json({ categories: await createCategory(c.env.DB, body.name ?? '') })
})

bookmarkController.patch('/api/bookmarks/categories/:id', async (c) => {
  const body = await c.req.json<{ name?: string }>()
  return c.json({ categories: await renameCategory(c.env.DB, c.req.param('id'), body.name ?? '') })
})

bookmarkController.delete('/api/bookmarks/categories/:id', async (c) => {
  return c.json({ categories: await removeCategory(c.env.DB, c.req.param('id')) })
})

bookmarkController.post('/api/bookmarks/links', async (c) => {
  const body = await c.req.json<{
    categoryId?: string
    title?: string
    url?: string
    description?: string
    avatar?: string
  }>()
  return c.json({
    categories: await createLink(c.env.DB, {
      categoryId: body.categoryId ?? '',
      title: body.title ?? '',
      url: body.url ?? '',
      description: body.description,
      avatar: body.avatar,
    }),
  })
})

bookmarkController.patch('/api/bookmarks/links/:id', async (c) => {
  const body = await c.req.json<{
    categoryId?: string
    title?: string
    url?: string
    description?: string
    avatar?: string
  }>()
  return c.json({
    categories: await editLink(c.env.DB, c.req.param('id'), {
      categoryId: body.categoryId ?? '',
      title: body.title ?? '',
      url: body.url ?? '',
      description: body.description,
      avatar: body.avatar,
    }),
  })
})

bookmarkController.delete('/api/bookmarks/links/:id', async (c) => {
  return c.json({ categories: await removeLink(c.env.DB, c.req.param('id')) })
})

bookmarkController.onError((error, c) => {
  if (error instanceof BookmarkError) {
    return c.json({ message: error.message }, error.status as 400)
  }
  console.error(error)
  return c.json({ message: '书签保存失败' }, 500)
})
