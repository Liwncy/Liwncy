export type BookmarkLink = {
  id: string
  title: string
  url: string
  description: string
}

export type BookmarkCategory = {
  id: string
  name: string
  links: BookmarkLink[]
}

type CatalogResponse = {
  categories: BookmarkCategory[]
}

type ErrorResponse = {
  message?: string
}

export async function fetchBookmarks() {
  return requestCatalog('/api/bookmarks')
}

export async function createCategory(name: string) {
  return requestCatalog('/api/bookmarks/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function renameCategory(id: string, name: string) {
  return requestCatalog(`/api/bookmarks/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
}

export async function deleteCategory(id: string) {
  return requestCatalog(`/api/bookmarks/categories/${id}`, { method: 'DELETE' })
}

export async function createLink(input: {
  categoryId: string
  title: string
  url: string
  description: string
}) {
  return requestCatalog('/api/bookmarks/links', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateLink(
  id: string,
  input: { categoryId: string; title: string; url: string; description: string },
) {
  return requestCatalog(`/api/bookmarks/links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteLink(id: string) {
  return requestCatalog(`/api/bookmarks/links/${id}`, { method: 'DELETE' })
}

async function requestCatalog(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
  const body = (await response.json().catch(() => ({}))) as CatalogResponse & ErrorResponse
  if (!response.ok) {
    throw new Error(body.message || '书签请求失败')
  }
  return body.categories
}

export function linkHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
