import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { layer } from '@layui/layer-vue'
import { API_BASE_URL } from '@/config/setting'

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.msg ?? error.message ?? '请求失败'
    layer.msg(msg, { icon: 2 })
    return Promise.reject(error)
  },
)

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return http.get(url, config)
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return http.post(url, data, config)
}

export default http
