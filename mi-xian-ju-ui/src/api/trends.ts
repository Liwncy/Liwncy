export type TrendItem = {
  id: number
  rank: number
  title: string
  detail: string | null
  hotValue: number | null
  hotLabel: string | null
  url: string | null
  coverUrl: string | null
}

export type TrendBoard = {
  platform: string
  name: string
  updatedAt: number
  items: TrendItem[]
}

type TrendsResponse = {
  generatedAt: number
  boards: TrendBoard[]
  message?: string
}

export async function fetchTrends() {
  const response = await fetch('/api/trends')
  const body = (await response.json().catch(() => ({}))) as TrendsResponse
  if (!response.ok) {
    throw new Error(body.message || '热榜没读出来')
  }
  return body
}
