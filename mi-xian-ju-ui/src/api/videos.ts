export type VideoSource = {
  id: string
  title: string
}

export type VideoGroup = {
  id: string
  title: string
  items: VideoSource[]
}

export type VideoResult = {
  title: string
  url: string
}

type ErrorResponse = {
  message?: string
}

export async function fetchVideoMenus() {
  const response = await fetch('/api/videos/menus')
  const body = (await response.json().catch(() => ({}))) as { groups?: VideoGroup[] } & ErrorResponse
  if (!response.ok) throw new Error(body.message || '视频源没读出来')
  return body.groups ?? []
}

export async function fetchVideo(id: string) {
  const response = await fetch(`/api/videos?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
  const body = (await response.json().catch(() => ({}))) as VideoResult & ErrorResponse
  if (!response.ok || !body.url) throw new Error(body.message || '这支没取到，再试下')
  return body
}
