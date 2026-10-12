import type { BookmarkDatabase } from '../../env'

export type CategoryRow = {
  id: string
  name: string
  sort_order: number
}

export type LinkRow = {
  id: string
  category_id: string
  title: string
  url: string
  description: string
  sort_order: number
}

export async function listCategoryRows(db: BookmarkDatabase) {
  const result = await db
    .prepare('SELECT id, name, sort_order FROM bookmark_categories ORDER BY sort_order, name')
    .all<CategoryRow>()
  return result.results
}

export async function listLinkRows(db: BookmarkDatabase) {
  const result = await db
    .prepare(
      'SELECT id, category_id, title, url, description, sort_order FROM bookmark_links ORDER BY sort_order, title',
    )
    .all<LinkRow>()
  return result.results
}

export async function nextCategorySort(db: BookmarkDatabase) {
  const result = await db
    .prepare('SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM bookmark_categories')
    .all<{ max_sort: number }>()
  return (result.results[0]?.max_sort ?? 0) + 1
}

export async function nextLinkSort(db: BookmarkDatabase, categoryId: string) {
  const result = await db
    .prepare('SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM bookmark_links WHERE category_id = ?')
    .bind(categoryId)
    .all<{ max_sort: number }>()
  return (result.results[0]?.max_sort ?? 0) + 1
}

export async function insertCategory(db: BookmarkDatabase, id: string, name: string, sortOrder: number) {
  await db
    .prepare('INSERT INTO bookmark_categories (id, name, sort_order) VALUES (?, ?, ?)')
    .bind(id, name, sortOrder)
    .run()
}

export async function updateCategoryName(db: BookmarkDatabase, id: string, name: string) {
  await db.prepare('UPDATE bookmark_categories SET name = ? WHERE id = ?').bind(name, id).run()
}

export async function deleteCategoryRow(db: BookmarkDatabase, id: string) {
  await db.prepare('DELETE FROM bookmark_links WHERE category_id = ?').bind(id).run()
  await db.prepare('DELETE FROM bookmark_categories WHERE id = ?').bind(id).run()
}

export async function insertLink(
  db: BookmarkDatabase,
  link: { id: string; categoryId: string; title: string; url: string; description: string; sortOrder: number },
) {
  await db
    .prepare(
      'INSERT INTO bookmark_links (id, category_id, title, url, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(link.id, link.categoryId, link.title, link.url, link.description, link.sortOrder)
    .run()
}

export async function updateLinkRow(
  db: BookmarkDatabase,
  link: { id: string; categoryId: string; title: string; url: string; description: string },
) {
  await db
    .prepare('UPDATE bookmark_links SET category_id = ?, title = ?, url = ?, description = ? WHERE id = ?')
    .bind(link.categoryId, link.title, link.url, link.description, link.id)
    .run()
}

export async function deleteLinkRow(db: BookmarkDatabase, id: string) {
  await db.prepare('DELETE FROM bookmark_links WHERE id = ?').bind(id).run()
}

export async function categoryExists(db: BookmarkDatabase, id: string) {
  const result = await db.prepare('SELECT id FROM bookmark_categories WHERE id = ?').bind(id).all<{ id: string }>()
  return result.results.length > 0
}
