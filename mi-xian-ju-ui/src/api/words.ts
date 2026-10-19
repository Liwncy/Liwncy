export type WordSource = {
  id: string
  title: string
}

export type WordGroup = {
  id: string
  title: string
  items: WordSource[]
}

export type WordResult = {
  title: string
  lines: string[]
}

type ErrorResponse = {
  message?: string
}

export async function fetchWordMenus() {
  const response = await fetch('/api/words/menus')
  const body = (await response.json().catch(() => ({}))) as { groups?: WordGroup[] } & ErrorResponse
  if (!response.ok) throw new Error(body.message || '文案没读出来')
  return body.groups ?? []
}

export async function fetchWord(id: string) {
  const response = await fetch(`/api/words?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
  const body = (await response.json().catch(() => ({}))) as WordResult & ErrorResponse
  if (!response.ok || !body.lines?.length) throw new Error(body.message || '这句没取到，再试下')
  return body
}
