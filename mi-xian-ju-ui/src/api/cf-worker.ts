import axios from 'axios'

const client = axios.create({
  baseURL: '/cf-worker',
  timeout: 30000,
})

export async function postCfWorker<T = string>(path: string, data: Record<string, unknown>) {
  const res = await client.post<{ data: T }>(path, data)
  return res.data
}
