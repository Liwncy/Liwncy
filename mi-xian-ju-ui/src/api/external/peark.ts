import axios from 'axios'

const client = axios.create({
  baseURL: '/peark-api',
  timeout: 15000,
})

export const PEARK_API = {
  DAILY_HOT: '/api/dailyhot',
} as const

export async function fetchPearkApi<T = unknown>(path: string, params: Record<string, unknown> = {}) {
  const res = await client.get<{ data: T }>(path, { params })
  return res.data
}
