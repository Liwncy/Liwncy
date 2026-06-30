import type { BookItem } from '@/types/bookmark'
import type { MenuNode } from '@/types/menu'
import { getMenuBooks } from '@/utils/normalize-menu'

const DEFAULT_AVATAR =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" rx="8" fill="%23f8f9fa" stroke="%23e9ecef" stroke-width="1"/%3E%3Cg fill="%2316a085"%3E%3Cpath d="M12 16h24v20H12z"/%3E%3Cpath d="M16 8v8h16V8z"/%3E%3C/g%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white"%3E书%3C/text%3E%3C/svg%3E'

function generateDefaultAvatar(title?: string) {
  let firstChar = '书'
  if (title && title.length > 0) {
    firstChar = title.charAt(0)
  }
  let encodedChar = '书'
  try {
    encodedChar = encodeURIComponent(firstChar)
  } catch {
    /* keep default */
  }
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" rx="8" fill="%23f8f9fa" stroke="%23e9ecef" stroke-width="1"/%3E%3Cg fill="%2316a085"%3E%3Cpath d="M12 16h24v20H12z"/%3E%3Cpath d="M16 8v8h16V8z"/%3E%3C/g%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white"%3E${encodedChar}%3C/text%3E%3C/svg%3E`
}

function processBooks(books?: BookItem[]): BookItem[] {
  if (!Array.isArray(books)) return []
  return books.map((book) => ({
    ...book,
    avatar: book.avatar || generateDefaultAvatar(book.title),
  }))
}

function mapChild(item: MenuNode): MenuNode {
  return {
    ...item,
    payload: item.payload
      ? { ...item.payload, books: processBooks(getMenuBooks<BookItem>(item)) }
      : undefined,
  }
}

/** 将 API 返回的书签菜单转为侧栏结构（含「全部」总览项） */
export function buildBookMarkMenus(data: MenuNode[]): {
  menus: MenuNode[]
  allBooks: BookItem[]
} {
  const menus: MenuNode[] = []
  const firstItem = data[0]
  const firstBooks = getMenuBooks<BookItem>(firstItem)

  if (firstBooks.length) {
    menus.push({
      id: 'bookmark-groups',
      title: '书签分类',
      children: data.map((item) => mapChild(item)),
    })
  } else if (firstItem?.children?.length) {
    data.forEach((item) => {
      menus.push({
        id: item.id,
        title: item.title,
        children: (item.children ?? []).map((child) => mapChild(child)),
      })
    })
  } else {
    menus.push({
      id: 'bookmark-flat',
      title: '书签分类',
      children: data.map((item) => mapChild(item)),
    })
  }

  const allBooks: BookItem[] = []
  menus.forEach((menu) => {
    const menuBooks = getMenuBooks<BookItem>(menu)
    if (menuBooks.length) {
      allBooks.push(...menuBooks)
    } else {
      menu.children?.forEach((child) => {
        allBooks.push(...getMenuBooks<BookItem>(child))
      })
    }
  })

  menus.unshift({
    id: 'overview',
    title: '书签总览',
    children: [{ id: 'all', title: '全部', payload: { books: allBooks } }],
  })

  return { menus, allBooks }
}

export { DEFAULT_AVATAR, processBooks }
