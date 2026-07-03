import { BadRequestError, HttpError, NotFoundError } from '../../common/http-error'
import type { ApiFunctionAdapterConfig, ApiFunctionRow } from '../../common/platform.types'
import { D1PlatformRepository } from '../../repository/d1-platform.repository'

type JsonObject = Record<string, unknown>

type FunctionResult = {
  code: string
  name: string
  responseType: string
  data: unknown
}

function parseJsonObject(value: string | null): JsonObject {
  if (!value) return {}
  const parsed = JSON.parse(value) as unknown
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as JsonObject) : {}
}

function toStringRecord(value: JsonObject): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null)
      .map(([key, item]) => [key, String(item)]),
  )
}

function renderTemplate(template: string, params: JsonObject) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const value = key.split('.').reduce<unknown>((current, part) => {
      if (current && typeof current === 'object') {
        return (current as JsonObject)[part]
      }
      return undefined
    }, params)

    return value == null ? '' : String(value)
  })
}

function appendQuery(url: string, query: JsonObject) {
  const target = new URL(url)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      target.searchParams.set(key, String(value))
    }
  }
  return target.toString()
}

function extractYujnPayload(data: unknown): unknown {
  if (data == null) return data
  if (typeof data === 'string') {
    const trimmed = data.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return extractYujnPayload(JSON.parse(trimmed) as unknown)
      } catch {
        return data
      }
    }
    return data
  }
  if (Array.isArray(data)) return data
  if (typeof data === 'object') {
    const obj = data as JsonObject
    if ('contents' in obj && typeof obj.contents === 'string') {
      try {
        return JSON.parse(obj.contents) as unknown
      } catch {
        return obj.contents
      }
    }
    return obj.data ?? obj.url ?? obj.img ?? obj.image_url ?? obj.msg ?? obj.echo ?? obj.pyq ?? obj
  }
  return data
}

function normalizeTextLines(payload: unknown) {
  const value = extractYujnPayload(payload)
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }
  if (value && typeof value === 'object') {
    return Object.values(value as JsonObject)
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .filter(Boolean)
  }
  return value == null ? [] : [String(value)]
}

function normalizeUrl(payload: unknown) {
  const value = extractYujnPayload(payload)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string') ?? ''
  }
  if (value && typeof value === 'object') {
    const obj = value as JsonObject
    const candidate = obj.url ?? obj.data ?? obj.img ?? obj.image ?? obj.pic
    if (typeof candidate === 'string') return candidate
    if (Array.isArray(candidate)) {
      return candidate.find((item) => typeof item === 'string') ?? ''
    }
  }
  return ''
}

function normalizeResponse(responseType: string, raw: unknown) {
  if (responseType === 'text-lines') {
    return { items: normalizeTextLines(raw) }
  }
  if (responseType === 'image-url') {
    const url = normalizeUrl(raw)
    return { url, items: url ? [url] : [] }
  }
  if (responseType === 'video-url') {
    return { url: normalizeUrl(raw) }
  }
  return raw
}

export class FunctionsService {
  constructor(private readonly platform: D1PlatformRepository) {}

  async invoke(code: string, method: string, inputParams: JsonObject): Promise<FunctionResult> {
    const apiFunction = await this.platform.findFunctionByCode(code)
    if (!apiFunction || !apiFunction.is_public) {
      throw new NotFoundError(`接口不存在或未启用：${code}`)
    }

    if (apiFunction.method.toUpperCase() !== method.toUpperCase()) {
      throw new BadRequestError(`接口 ${code} 不支持 ${method} 请求`)
    }

    const configs = await this.platform.listAdapterConfigs(apiFunction.id)
    if (configs.length === 0) {
      throw new NotFoundError(`接口 ${code} 暂无可用 adapter`)
    }

    const errors: string[] = []
    for (const config of configs) {
      try {
        const raw = await this.callAdapter(apiFunction, config, inputParams)
        return {
          code: apiFunction.code,
          name: apiFunction.name,
          responseType: apiFunction.response_type,
          data: normalizeResponse(apiFunction.response_type, raw),
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err))
        if (!config.binding.fallback_enabled) break
      }
    }

    throw new HttpError(502, `接口 ${code} 调用失败`, { errors })
  }

  private async callAdapter(apiFunction: ApiFunctionRow, config: ApiFunctionAdapterConfig, inputParams: JsonObject) {
    if (config.adapter.type !== 'http_custom') {
      throw new BadRequestError(`暂不支持 adapter 类型：${config.adapter.type}`)
    }
    if (!config.adapter.url_template) {
      throw new BadRequestError(`adapter ${config.adapter.code} 缺少 URL 模板`)
    }

    const params = {
      baseUrl: config.source.base_url,
      ...parseJsonObject(apiFunction.default_params_json),
      ...parseJsonObject(config.binding.default_params_json),
      ...inputParams,
      ...parseJsonObject(config.binding.fixed_params_json),
    }

    const query = {
      ...parseJsonObject(config.adapter.query_template_json),
      ...Object.fromEntries(Object.entries(params).filter(([key]) => key !== 'baseUrl' && key !== 'path')),
    }

    const url = appendQuery(renderTemplate(config.adapter.url_template, params), query)
    const init: RequestInit = {
      method: config.adapter.method,
      headers: toStringRecord(parseJsonObject(config.adapter.headers_json)),
    }

    if (config.adapter.method !== 'GET' && config.adapter.body_template) {
      init.body = renderTemplate(config.adapter.body_template, params)
    }

    const response = await fetch(url, init)
    if (!response.ok) {
      throw new HttpError(response.status, `adapter ${config.adapter.code} 返回 ${response.status}`)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      return response.json()
    }
    return response.text()
  }
}
