import { BadRequestError, HttpError, NotFoundError } from '../../common/http-error'
import type {
  ApiAdapterParamMapRow,
  ApiFunctionAdapterConfig,
  ApiFunctionParamRow,
  ApiFunctionRouteRow,
  ApiResponseMapRow,
} from '../../common/platform.types'
import { D1PlatformRepository } from '../../repository/d1-platform.repository'

type JsonObject = Record<string, unknown>

type FunctionResult = {
  code: string
  name: string
  responseType: string
  data: unknown
}

type AdapterAttemptTrace = {
  bindingId: string
  adapterId: string
  adapterCode: string
  adapterName: string
  sourceCode: string
  sourceName: string
  priority: number
  fallbackEnabled: boolean
  method: string
  url?: string
  requestParams?: JsonObject
  queryParams?: JsonObject
  bodyParams?: JsonObject
  responseStatus?: number
  durationMs: number
  success: boolean
  error?: string
  rawResponse?: unknown
  mappedResponse?: unknown
  normalizedResponse?: unknown
}

export type FunctionDebugResult = {
  code: string
  name: string
  method: string
  responseType: string
  inputParams: JsonObject
  publicParams: JsonObject
  route: {
    id: string
    routeKey: string
    name: string
    match: JsonObject
    defaultParams: JsonObject
  } | null
  adapters: Array<{
    bindingId: string
    adapterCode: string
    adapterName: string
    sourceCode: string
    priority: number
    fallbackEnabled: boolean
  }>
  attempts: AdapterAttemptTrace[]
  durationMs: number
  result?: FunctionResult
  errors: string[]
}

class AdapterAttemptError extends Error {
  constructor(
    message: string,
    readonly trace: AdapterAttemptTrace,
  ) {
    super(message)
    this.name = 'AdapterAttemptError'
  }
}

function parseJsonObject(value: string | null): JsonObject {
  if (!value) return {}
  const parsed = JSON.parse(value) as unknown
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as JsonObject) : {}
}

function parseJsonValue(value: string | null): unknown {
  if (!value) return undefined
  return JSON.parse(value) as unknown
}

function parseJsonArray(value: string | null): unknown[] {
  if (!value) return []
  const parsed = JSON.parse(value) as unknown
  return Array.isArray(parsed) ? parsed : []
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

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getByPath(value: unknown, path: string | null): unknown {
  if (!path) return value
  return path.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object') {
      return (current as JsonObject)[part]
    }
    return undefined
  }, value)
}

function mapFields(value: unknown, fields: JsonObject) {
  if (!isRecord(value)) return value
  if (Object.keys(fields).length === 0) return value

  return Object.fromEntries(
    Object.entries(fields).map(([targetKey, sourcePath]) => [
      targetKey,
      typeof sourcePath === 'string' ? getByPath(value, sourcePath) : sourcePath,
    ]),
  )
}

function applyResponseMap(raw: unknown, responseMap: ApiResponseMapRow | null) {
  if (!responseMap) return raw

  const base = getByPath(raw, responseMap.data_path)
  const fields = parseJsonObject(responseMap.fields_json)
  const items = responseMap.items_path ? getByPath(base, responseMap.items_path) : undefined

  if (Array.isArray(items)) {
    return { items: items.map((item) => mapFields(item, fields)) }
  }
  if (items !== undefined) {
    return { items: [mapFields(items, fields)] }
  }

  return mapFields(base, fields)
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
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) {
    return (value.find((item) => typeof item === 'string') as string | undefined)?.trim() ?? ''
  }
  if (value && typeof value === 'object') {
    const obj = value as JsonObject
    const candidate = obj.url ?? obj.data ?? obj.img ?? obj.image ?? obj.pic
    if (typeof candidate === 'string') return candidate.trim()
    if (Array.isArray(candidate)) {
      return (candidate.find((item) => typeof item === 'string') as string | undefined)?.trim() ?? ''
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
    const trace = await this.invokeWithTrace(code, method, inputParams, false)
    if (trace.result) return trace.result
    throw new HttpError(502, `接口 ${code} 调用失败`, { errors: trace.errors })
  }

  async debugInvoke(code: string, method: string, inputParams: JsonObject): Promise<FunctionDebugResult> {
    return this.invokeWithTrace(code, method, inputParams, true)
  }

  private async invokeWithTrace(
    code: string,
    method: string,
    inputParams: JsonObject,
    includePayloads: boolean,
  ): Promise<FunctionDebugResult> {
    const startedAt = Date.now()
    const apiFunction = await this.platform.findFunctionByCode(code)
    if (!apiFunction || !apiFunction.is_public) {
      throw new NotFoundError(`接口不存在或未启用：${code}`)
    }

    if (apiFunction.method.toUpperCase() !== method.toUpperCase()) {
      throw new BadRequestError(`接口 ${code} 不支持 ${method} 请求`)
    }

    const paramRules = await this.platform.listFunctionParams(apiFunction.id)
    const publicParams = this.normalizePublicParams(paramRules, inputParams)
    const route = this.matchRoute(await this.platform.listFunctionRoutes(apiFunction.id), publicParams)
    const debug: FunctionDebugResult = {
      code: apiFunction.code,
      name: apiFunction.name,
      method: apiFunction.method,
      responseType: apiFunction.response_type,
      inputParams,
      publicParams,
      route: route
        ? {
            id: route.id,
            routeKey: route.route_key,
            name: route.name,
            match: parseJsonObject(route.match_json),
            defaultParams: parseJsonObject(route.default_params_json),
          }
        : null,
      adapters: [],
      attempts: [],
      durationMs: 0,
      errors: [],
    }

    if (!route) {
      throw new NotFoundError(`接口 ${code} 没有匹配的参数场景`)
    }

    const configs = await this.platform.listAdapterConfigs(apiFunction.id, route.id)
    debug.adapters = configs.map((config) => ({
      bindingId: config.binding.id,
      adapterCode: config.adapter.code,
      adapterName: config.adapter.name,
      sourceCode: config.source.code,
      priority: config.binding.priority,
      fallbackEnabled: Boolean(config.binding.fallback_enabled),
    }))

    if (configs.length === 0) {
      throw new NotFoundError(`接口 ${code} 场景 ${route.route_key} 暂无可用 adapter`)
    }

    for (const config of configs) {
      try {
        const paramMaps = await this.platform.listParamMaps(apiFunction.id, config.adapter.id, route.id)
        const { raw, trace } = await this.callAdapterWithTrace(
          config,
          paramMaps,
          publicParams,
          parseJsonObject(route.default_params_json),
        )
        const mapped = applyResponseMap(raw, config.responseMap)
        const normalized = normalizeResponse(apiFunction.response_type, mapped)
        const result = {
          code: apiFunction.code,
          name: apiFunction.name,
          responseType: apiFunction.response_type,
          data: normalized,
        }
        debug.attempts.push({
          ...trace,
          success: true,
          ...(includePayloads
            ? {
                rawResponse: raw,
                mappedResponse: mapped,
                normalizedResponse: normalized,
              }
            : {}),
        })
        debug.result = result
        debug.durationMs = Date.now() - startedAt
        return debug
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        debug.errors.push(message)
        if (err instanceof AdapterAttemptError) {
          debug.attempts.push(err.trace)
        } else if (!debug.attempts.some((attempt) => attempt.bindingId === config.binding.id)) {
          debug.attempts.push(this.createFailedAttemptTrace(config, message))
        }
        if (!config.binding.fallback_enabled) break
      }
    }

    debug.durationMs = Date.now() - startedAt
    return debug
  }

  private normalizePublicParams(paramRules: ApiFunctionParamRow[], inputParams: JsonObject) {
    const normalized: JsonObject = {}

    for (const rule of paramRules) {
      const rawValue = inputParams[rule.param_key] ?? parseJsonValue(rule.default_value_json)
      if ((rawValue === undefined || rawValue === '') && rule.required) {
        throw new BadRequestError(`缺少必填参数：${rule.param_key}`)
      }
      if (rawValue === undefined || rawValue === '') continue

      const value = this.castParam(rule, rawValue)
      const allowValues = parseJsonArray(rule.allow_values_json)
      if (allowValues.length > 0 && !allowValues.includes(value)) {
        throw new BadRequestError(`参数 ${rule.param_key} 不在允许范围内`)
      }
      normalized[rule.param_key] = value
    }

    return normalized
  }

  private castParam(rule: ApiFunctionParamRow, value: unknown) {
    if (rule.type === 'number') {
      const numberValue = Number(value)
      if (!Number.isFinite(numberValue)) {
        throw new BadRequestError(`参数 ${rule.param_key} 必须是数字`)
      }
      return numberValue
    }

    if (rule.type === 'boolean') {
      if (typeof value === 'boolean') return value
      if (value === 'true' || value === '1') return true
      if (value === 'false' || value === '0') return false
      throw new BadRequestError(`参数 ${rule.param_key} 必须是布尔值`)
    }

    if (rule.type === 'json') {
      if (isRecord(value) || Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as unknown
        } catch {
          throw new BadRequestError(`参数 ${rule.param_key} 必须是 JSON`)
        }
      }
      throw new BadRequestError(`参数 ${rule.param_key} 必须是 JSON`)
    }

    return String(value)
  }

  private matchRoute(routes: ApiFunctionRouteRow[], publicParams: JsonObject) {
    const matched = routes
      .map((route) => ({
        route,
        match: parseJsonObject(route.match_json),
      }))
      .filter(({ match }) =>
        Object.entries(match).every(([key, expected]) => String(publicParams[key]) === String(expected)),
      )
      .sort((left, right) => Object.keys(right.match).length - Object.keys(left.match).length)

    return matched[0]?.route ?? null
  }

  private applyParamMaps(paramMaps: ApiAdapterParamMapRow[], publicParams: JsonObject) {
    const adapterParams: JsonObject = {}
    const queryParams: JsonObject = {}
    const headerParams: JsonObject = {}
    const bodyParams: JsonObject = {}

    for (const map of paramMaps) {
      const rawValue = publicParams[map.public_param] ?? parseJsonValue(map.default_value_json)
      if (rawValue === undefined || rawValue === null || rawValue === '') continue
      const rendered = map.template ? renderTemplate(map.template, { ...publicParams, [map.public_param]: rawValue }) : rawValue

      if (map.target === 'query') queryParams[map.target_key] = rendered
      else if (map.target === 'header') headerParams[map.target_key] = rendered
      else if (map.target === 'body') bodyParams[map.target_key] = rendered
      else adapterParams[map.target_key] = rendered
    }

    return { adapterParams, queryParams, headerParams, bodyParams }
  }

  private buildAdapterRequest(
    config: ApiFunctionAdapterConfig,
    paramMaps: ApiAdapterParamMapRow[],
    publicParams: JsonObject,
    routeDefaultParams: JsonObject,
  ) {
    if (config.adapter.type !== 'http_custom') {
      throw new BadRequestError(`暂不支持 adapter 类型：${config.adapter.type}`)
    }
    if (!config.adapter.url_template) {
      throw new BadRequestError(`adapter ${config.adapter.code} 缺少 URL 模板`)
    }

    const mapped = this.applyParamMaps(paramMaps, publicParams)
    const params = {
      baseUrl: config.source.base_url,
      ...publicParams,
      ...routeDefaultParams,
      ...mapped.adapterParams,
      ...parseJsonObject(config.binding.default_params_json),
      ...parseJsonObject(config.binding.fixed_params_json),
    }

    const query = {
      ...parseJsonObject(config.adapter.query_template_json),
      ...mapped.queryParams,
    }

    const url = appendQuery(renderTemplate(config.adapter.url_template, params), query)
    const init: RequestInit = {
      method: config.adapter.method,
      headers: toStringRecord({
        ...parseJsonObject(config.adapter.headers_json),
        ...mapped.headerParams,
      }),
    }

    if (config.adapter.method !== 'GET' && config.adapter.body_template) {
      init.body = renderTemplate(config.adapter.body_template, params)
    } else if (config.adapter.method !== 'GET' && config.adapter.body_type === 'json') {
      init.headers = { ...init.headers, 'Content-Type': 'application/json' }
      init.body = JSON.stringify(mapped.bodyParams)
    } else if (config.adapter.method !== 'GET' && config.adapter.body_type === 'form') {
      init.headers = { ...init.headers, 'Content-Type': 'application/x-www-form-urlencoded' }
      init.body = new URLSearchParams(toStringRecord(mapped.bodyParams)).toString()
    } else if (config.adapter.method !== 'GET' && config.adapter.body_type === 'text') {
      init.body = Object.values(mapped.bodyParams).map((item) => String(item)).join('\n')
    }

    return { mapped, params, query, url, init }
  }

  private createBaseAttemptTrace(config: ApiFunctionAdapterConfig): Omit<AdapterAttemptTrace, 'durationMs' | 'success'> {
    return {
      bindingId: config.binding.id,
      adapterId: config.adapter.id,
      adapterCode: config.adapter.code,
      adapterName: config.adapter.name,
      sourceCode: config.source.code,
      sourceName: config.source.name,
      priority: config.binding.priority,
      fallbackEnabled: Boolean(config.binding.fallback_enabled),
      method: config.adapter.method,
    }
  }

  private createFailedAttemptTrace(config: ApiFunctionAdapterConfig, error: string): AdapterAttemptTrace {
    return {
      ...this.createBaseAttemptTrace(config),
      durationMs: 0,
      success: false,
      error,
    }
  }

  private async callAdapterWithTrace(
    config: ApiFunctionAdapterConfig,
    paramMaps: ApiAdapterParamMapRow[],
    publicParams: JsonObject,
    routeDefaultParams: JsonObject,
  ): Promise<{ raw: unknown; trace: AdapterAttemptTrace }> {
    const startedAt = Date.now()
    const request = this.buildAdapterRequest(config, paramMaps, publicParams, routeDefaultParams)
    const trace = {
      ...this.createBaseAttemptTrace(config),
      url: request.url,
      requestParams: request.params,
      queryParams: request.query,
      bodyParams: request.mapped.bodyParams,
      durationMs: 0,
      success: false,
    }

    const response = await fetch(request.url, request.init)
    trace.responseStatus = response.status
    trace.durationMs = Date.now() - startedAt

    if (!response.ok) {
      trace.error = `adapter ${config.adapter.code} 返回 ${response.status}`
      throw new AdapterAttemptError(trace.error, trace)
    }

    const contentType = response.headers.get('content-type') ?? ''
    const raw = contentType.includes('application/json') ? await response.json() : await response.text()
    return { raw, trace }
  }
}
