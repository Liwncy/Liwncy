import axios from 'axios'

const SIXTY_ORIGIN = 'https://60s.viki.moe'

const client = axios.create({
  baseURL: import.meta.env.DEV ? '/sixty-api' : SIXTY_ORIGIN,
  timeout: 15000,
})

/** 60s API https://docs.60s-api.viki.moe */
export async function fetch60sApi<T = unknown>(path: string, params: Record<string, unknown> = {}) {
  const res = await client.get<{ data: T }>(path, { params })
  return res.data
}
