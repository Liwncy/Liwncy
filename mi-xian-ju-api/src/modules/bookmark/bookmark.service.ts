import type { BookmarkDatabase } from '../../env'
import {
  categoryExists,
  deleteCategoryRow,
  deleteLinkRow,
  insertCategory,
  insertLink,
  listCategoryRows,
  listLinkRows,
  nextCategorySort,
  nextLinkSort,
  updateCategoryName,
  updateLinkRow,
} from './bookmark.repository'

export type BookmarkLink = {
  id: string
  title: string
  url: string
  description: string
  avatar: string
}

export type BookmarkCategory = {
  id: string
  name: string
  links: BookmarkLink[]
}

export class BookmarkError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export async function listCatalog(db: BookmarkDatabase): Promise<BookmarkCategory[]> {
  const [categories, links] = await Promise.all([listCategoryRows(db), listLinkRows(db)])
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    links: links
      .filter((link) => link.category_id === category.id)
      .map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        avatar: link.avatar,
      })),
  }))
}

export async function createCategory(db: BookmarkDatabase, name: string) {
  const trimmed = requireText(name, '请填写分类名称')
  const id = crypto.randomUUID()
  await insertCategory(db, id, trimmed, await nextCategorySort(db))
  return listCatalog(db)
}

export async function renameCategory(db: BookmarkDatabase, id: string, name: string) {
  await requireCategory(db, id)
  await updateCategoryName(db, id, requireText(name, '请填写分类名称'))
  return listCatalog(db)
}

export async function removeCategory(db: BookmarkDatabase, id: string) {
  await requireCategory(db, id)
  await deleteCategoryRow(db, id)
  return listCatalog(db)
}

export async function createLink(
  db: BookmarkDatabase,
  input: { categoryId: string; title: string; url: string; description?: string; avatar?: string },
) {
  await requireCategory(db, input.categoryId)
  const id = crypto.randomUUID()
  await insertLink(db, {
    id,
    categoryId: input.categoryId,
    title: requireText(input.title, '请填写标题'),
    url: requireHttpUrl(input.url),
    description: input.description?.trim() ?? '',
    avatar: optionalHttpUrl(input.avatar),
    sortOrder: await nextLinkSort(db, input.categoryId),
  })
  return listCatalog(db)
}

export async function editLink(
  db: BookmarkDatabase,
  id: string,
  input: { categoryId: string; title: string; url: string; description?: string; avatar?: string },
) {
  await requireCategory(db, input.categoryId)
  await updateLinkRow(db, {
    id,
    categoryId: input.categoryId,
    title: requireText(input.title, '请填写标题'),
    url: requireHttpUrl(input.url),
    description: input.description?.trim() ?? '',
    avatar: optionalHttpUrl(input.avatar),
  })
  return listCatalog(db)
}

export async function removeLink(db: BookmarkDatabase, id: string) {
  await deleteLinkRow(db, id)
  return listCatalog(db)
}

function requireText(value: string | undefined, message: string) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    throw new BookmarkError(message, 400)
  }
  return trimmed
}

function requireHttpUrl(value: string | undefined) {
  return parseHttpUrl(value, '请填写链接', '链接需要是 http 或 https 地址')
}

function optionalHttpUrl(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  return parseHttpUrl(trimmed, '请填写链接', '图标需要是 http 或 https 地址')
}

function parseHttpUrl(value: string | undefined, emptyMessage: string, invalidMessage: string) {
  const trimmed = requireText(value, emptyMessage)
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new BookmarkError(invalidMessage, 400)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BookmarkError(invalidMessage, 400)
  }
  return trimmed
}

async function requireCategory(db: BookmarkDatabase, id: string) {
  if (!id || !(await categoryExists(db, id))) {
    throw new BookmarkError('分类不存在', 404)
  }
}
