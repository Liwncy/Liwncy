export type ImageSource = {
  id: string
  title: string
}

export type ImageGroup = {
  id: string
  title: string
  items: ImageSource[]
}

export type ImageResult = {
  title: string
  urls: string[]
}

type ErrorResponse = {
  message?: string
}

export async function fetchImageMenus() {
  const response = await fetch('/api/images/menus')
  const body = (await response.json().catch(() => ({}))) as { groups?: ImageGroup[] } & ErrorResponse
  if (!response.ok) throw new Error(body.message || '图源没读出来')
  return body.groups ?? []
}

export async function fetchImage(id: string) {
  const response = await fetch(`/api/images?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
  const body = (await response.json().catch(() => ({}))) as ImageResult & ErrorResponse
  if (!response.ok || !body.urls?.length) throw new Error(body.message || '这张没取到，再试下')
  return body
}
