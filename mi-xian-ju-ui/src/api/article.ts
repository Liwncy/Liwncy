import axios from 'axios'
import type { Article } from '@/types/article'

const client = axios.create({
  baseURL: '/data',
  timeout: 10000,
})

export async function fetchArticles() {
  const res = await client.get<Article[]>('/webs/betterRead/index')
  return res.data
}
