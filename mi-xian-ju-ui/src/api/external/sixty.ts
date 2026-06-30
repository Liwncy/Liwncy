import axios from 'axios'

const client = axios.create({
  baseURL: '/sixty-api',
  timeout: 15000,
})

/** 60s API https://docs.60s-api.viki.moe */
export async function fetch60sApi<T = unknown>(path: string, params: Record<string, unknown> = {}) {
  const res = await client.get<{ data: T }>(path, { params })
  return res.data
}
