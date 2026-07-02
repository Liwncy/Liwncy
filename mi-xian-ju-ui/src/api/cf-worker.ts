import axios from 'axios'

const CF_WORKER_ORIGIN = 'https://lwcfworker.dpdns.org'

const client = axios.create({
  baseURL: import.meta.env.DEV ? '/cf-worker' : CF_WORKER_ORIGIN,
  timeout: 30000,
})

export async function postCfWorker<T = string>(path: string, data: Record<string, unknown>) {
  const res = await client.post<{ data: T }>(path, data)
  return res.data
}
