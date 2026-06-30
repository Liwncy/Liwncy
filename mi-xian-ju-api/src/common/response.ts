/** 与 mi-xian-ju-ui 前端 ApiResult 对齐 */
export type ApiResult<T = unknown> = {
  code: number
  success: boolean
  msg?: string
  message?: string
  data?: T
  error?: string
}

export function ok<T>(data: T, msg = '操作成功'): ApiResult<T> {
  return { code: 200, success: true, msg, data }
}

export function fail(code: number, msg: string): ApiResult {
  return { code, success: false, msg }
}
