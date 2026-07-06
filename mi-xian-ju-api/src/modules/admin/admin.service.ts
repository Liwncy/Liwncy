import { BadRequestError, UnauthorizedError } from '../../common/http-error'
import { generateToken, hashPassword, hashToken, verifyPassword } from '../../common/crypto'
import type { Bindings } from '../../config/env'
import { D1PlatformRepository } from '../../repository/d1-platform.repository'
import { FunctionsService } from '../functions/functions.service'

const SESSION_DAYS = 7
const STATUS_VALUES = new Set(['enabled', 'disabled'])
const ADAPTER_TYPES = new Set(['builtin', 'http_custom'])
const BODY_TYPES = new Set(['none', 'json', 'form', 'text'])
const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
const PARAM_SOURCES = new Set(['query', 'body', 'any'])
const PARAM_TYPES = new Set(['string', 'number', 'boolean', 'json'])
const PARAM_MAP_TARGETS = new Set(['param', 'query', 'header', 'body'])
const MENU_SCOPES = new Set(['top', 'side'])

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export class AdminService {
  constructor(
    private readonly platform: D1PlatformRepository,
    private readonly env: Bindings,
    private readonly functions: FunctionsService,
  ) {}

  async login(input: { username?: string; password?: string }) {
    const username = input.username?.trim() || this.env.ADMIN_USERNAME || 'admin'
    const password = input.password ?? ''
    if (!password) {
      throw new BadRequestError('请输入密码')
    }

    await this.bootstrapAdminIfNeeded(username, password)

    const user = await this.platform.findUserByUsername(username)
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new UnauthorizedError('用户名或密码错误')
    }

    const token = await generateToken()
    const expiresAt = addDays(new Date(), SESSION_DAYS).toISOString()

    await this.platform.createSession({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: await hashToken(token),
      expiresAt,
    })
    await this.platform.updateUserLastLogin(user.id)

    return {
      token,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
      },
    }
  }

  async getCurrentUser(token: string) {
    const session = await this.platform.findSessionByTokenHash(await hashToken(token))
    if (!session) {
      throw new UnauthorizedError('登录已过期')
    }

    const user = await this.platform.findUserById(session.user_id)
    if (!user) {
      throw new UnauthorizedError('用户不存在或已停用')
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    }
  }

  async listConfig() {
    const [
      functions,
      sources,
      adapters,
      functionAdapters,
      functionParams,
      functionRoutes,
      adapterParamMaps,
      responseMaps,
      menus,
    ] = await Promise.all([
      this.platform.listFunctions(),
      this.platform.listSources(),
      this.platform.listAdapters(),
      this.platform.listFunctionAdapters(),
      this.platform.listFunctionParamSummaries(),
      this.platform.listFunctionRouteSummaries(),
      this.platform.listAdapterParamMapSummaries(),
      this.platform.listResponseMapSummaries(),
      this.platform.listMenus(),
    ])

    return { functions, sources, adapters, functionAdapters, functionParams, functionRoutes, adapterParamMaps, responseMaps, menus }
  }

  async debugFunctionInvoke(input: { code?: string; method?: string; params?: unknown }) {
    const code = this.normalizeCode(input.code, '接口编码')
    const method = this.normalizeMethod(input.method)
    const params = this.normalizeJsonObject(input.params ?? {}, '调试参数') ?? {}

    return this.functions.debugInvoke(code, method, params)
  }

  async createMenu(input: {
    id?: string
    parentId?: string | null
    scope?: string
    module?: string
    title?: string
    subtitle?: string | null
    icon?: string | null
    path?: string | null
    i18nKey?: string | null
    sort?: unknown
    status?: string
    payload?: unknown
  }) {
    await this.platform.createMenu({
      id: this.normalizeRequiredString(input.id, '菜单 ID'),
      parentId: this.normalizeNullableString(input.parentId),
      scope: this.normalizeMenuScope(input.scope),
      module: this.normalizeRequiredString(input.module, '模块'),
      title: this.normalizeRequiredString(input.title, '菜单标题'),
      subtitle: this.normalizeNullableString(input.subtitle),
      icon: this.normalizeNullableString(input.icon),
      path: this.normalizeNullableString(input.path),
      i18nKey: this.normalizeNullableString(input.i18nKey),
      sort: this.normalizePriority(input.sort) ?? 100,
      status: this.normalizeStatus(input.status) ?? 'enabled',
      payload: this.normalizeJsonObject(input.payload ?? {}, '菜单 Payload') ?? {},
    })

    return this.listConfig()
  }

  async updateMenu(
    id: string,
    input: {
      parentId?: string | null
      scope?: string
      module?: string
      title?: string
      subtitle?: string | null
      icon?: string | null
      path?: string | null
      i18nKey?: string | null
      sort?: unknown
      status?: string
      payload?: unknown
    },
  ) {
    await this.platform.updateMenu(id, {
      parentId: this.normalizeNullableString(input.parentId),
      parentIdTouched: input.parentId !== undefined,
      scope: input.scope === undefined ? undefined : this.normalizeMenuScope(input.scope),
      module: input.module === undefined ? undefined : this.normalizeRequiredString(input.module, '模块'),
      title: input.title === undefined ? undefined : this.normalizeRequiredString(input.title, '菜单标题'),
      subtitle: this.normalizeNullableString(input.subtitle),
      subtitleTouched: input.subtitle !== undefined,
      icon: this.normalizeNullableString(input.icon),
      iconTouched: input.icon !== undefined,
      path: this.normalizeNullableString(input.path),
      pathTouched: input.path !== undefined,
      i18nKey: this.normalizeNullableString(input.i18nKey),
      i18nKeyTouched: input.i18nKey !== undefined,
      sort: this.normalizePriority(input.sort),
      status: this.normalizeStatus(input.status),
      payload: this.normalizeJsonObject(input.payload, '菜单 Payload'),
    })

    return this.listConfig()
  }

  async updateFunction(
    id: string,
    input: {
      code?: string
      name?: string
      method?: string
      description?: string
      paramsSchema?: unknown
      status?: string
      isPublic?: boolean
      defaultParams?: unknown
      responseType?: string
    },
  ) {
    const status = this.normalizeStatus(input.status)
    const paramsSchema = input.paramsSchema === null ? null : this.normalizeJsonObject(input.paramsSchema, '参数 Schema')
    const defaultParams = this.normalizeJsonObject(input.defaultParams, '默认参数')

    await this.platform.updateFunction(id, {
      code: input.code === undefined ? undefined : this.normalizeCode(input.code, '接口编码'),
      name: input.name === undefined ? undefined : this.normalizeRequiredString(input.name, '接口名称'),
      method: input.method === undefined ? undefined : this.normalizeMethod(input.method),
      description: input.description?.trim(),
      paramsSchema,
      status,
      isPublic: input.isPublic,
      defaultParams,
      responseType: input.responseType === undefined ? undefined : this.normalizeRequiredString(input.responseType, '响应类型'),
    })

    return this.listConfig()
  }

  async createFunction(input: {
    code?: string
    name?: string
    method?: string
    description?: string
    paramsSchema?: unknown
    defaultParams?: unknown
    responseType?: string
    isPublic?: boolean
    status?: string
  }) {
    await this.platform.createFunction({
      id: `fn_${crypto.randomUUID()}`,
      code: this.normalizeCode(input.code, '接口编码'),
      name: this.normalizeRequiredString(input.name, '接口名称'),
      method: this.normalizeMethod(input.method),
      description: input.description?.trim() ?? '',
      paramsSchema: input.paramsSchema === null ? null : this.normalizeJsonObject(input.paramsSchema, '参数 Schema'),
      defaultParams: this.normalizeJsonObject(input.defaultParams ?? {}, '默认参数') ?? {},
      responseType: this.normalizeRequiredString(input.responseType ?? 'raw', '响应类型'),
      isPublic: input.isPublic ?? true,
      status: this.normalizeStatus(input.status) ?? 'enabled',
    })

    return this.listConfig()
  }

  async updateFunctionAdapter(
    id: string,
    input: {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      status?: string
      priority?: unknown
      weight?: unknown
      fallbackEnabled?: boolean
      defaultParams?: unknown
      fixedParams?: unknown
    },
  ) {
    const status = this.normalizeStatus(input.status)
    const priority = this.normalizePriority(input.priority)
    const weight = this.normalizeWeight(input.weight)
    const defaultParams = this.normalizeJsonObject(input.defaultParams, '默认参数')
    const fixedParams = this.normalizeJsonObject(input.fixedParams, '固定参数')

    await this.platform.updateFunctionAdapter(id, {
      functionId: input.functionId === undefined ? undefined : this.normalizeRequiredString(input.functionId, '功能接口'),
      adapterId: input.adapterId === undefined ? undefined : this.normalizeRequiredString(input.adapterId, 'Adapter'),
      routeId: input.routeId === undefined ? undefined : this.normalizeNullableString(input.routeId),
      routeIdTouched: input.routeId !== undefined,
      status,
      priority,
      weight,
      fallbackEnabled: input.fallbackEnabled,
      defaultParams,
      fixedParams,
    })

    return this.listConfig()
  }

  async createFunctionAdapter(input: {
    functionId?: string
    adapterId?: string
    routeId?: string | null
    status?: string
    priority?: unknown
    weight?: unknown
    fallbackEnabled?: boolean
    defaultParams?: unknown
    fixedParams?: unknown
  }) {
    await this.platform.createFunctionAdapter({
      id: `fa_${crypto.randomUUID()}`,
      functionId: this.normalizeRequiredString(input.functionId, '功能接口'),
      adapterId: this.normalizeRequiredString(input.adapterId, 'Adapter'),
      routeId: this.normalizeNullableString(input.routeId),
      status: this.normalizeStatus(input.status) ?? 'enabled',
      priority: this.normalizePriority(input.priority) ?? 100,
      weight: this.normalizeWeight(input.weight) ?? 1,
      fallbackEnabled: input.fallbackEnabled ?? true,
      defaultParams: this.normalizeJsonObject(input.defaultParams ?? {}, '默认参数') ?? {},
      fixedParams: this.normalizeJsonObject(input.fixedParams ?? {}, '固定参数') ?? {},
    })

    return this.listConfig()
  }

  async createSource(input: {
    code?: string
    name?: string
    baseUrl?: string
    status?: string
    timeoutMs?: unknown
    rateLimit?: unknown
  }) {
    await this.platform.createSource({
      id: `src_${crypto.randomUUID()}`,
      code: this.normalizeCode(input.code, '平台编码'),
      name: this.normalizeRequiredString(input.name, '平台名称'),
      baseUrl: this.normalizeRequiredString(input.baseUrl, 'Base URL'),
      status: this.normalizeStatus(input.status) ?? 'enabled',
      timeoutMs: this.normalizeTimeout(input.timeoutMs) ?? 20000,
      rateLimit: this.normalizeJsonObject(input.rateLimit, '限流配置'),
    })

    return this.listConfig()
  }

  async updateSource(
    id: string,
    input: {
      code?: string
      name?: string
      baseUrl?: string
      status?: string
      timeoutMs?: unknown
      rateLimit?: unknown
    },
  ) {
    await this.platform.updateSource(id, {
      code: input.code === undefined ? undefined : this.normalizeCode(input.code, '平台编码'),
      name: input.name === undefined ? undefined : this.normalizeRequiredString(input.name, '平台名称'),
      baseUrl: input.baseUrl === undefined ? undefined : this.normalizeRequiredString(input.baseUrl, 'Base URL'),
      status: this.normalizeStatus(input.status),
      timeoutMs: this.normalizeTimeout(input.timeoutMs, true),
      rateLimit: this.normalizeJsonObject(input.rateLimit, '限流配置'),
    })

    return this.listConfig()
  }

  async createAdapter(input: {
    sourceId?: string
    code?: string
    name?: string
    type?: string
    builtinKey?: string | null
    method?: string
    urlTemplate?: string | null
    headers?: unknown
    queryTemplate?: unknown
    bodyTemplate?: string | null
    bodyType?: string
    timeoutMs?: unknown
    status?: string
  }) {
    await this.platform.createAdapter({
      id: `adp_${crypto.randomUUID()}`,
      sourceId: this.normalizeRequiredString(input.sourceId, '平台源'),
      code: this.normalizeCode(input.code, 'Adapter 编码'),
      name: this.normalizeRequiredString(input.name, 'Adapter 名称'),
      type: this.normalizeAdapterType(input.type),
      builtinKey: this.normalizeNullableString(input.builtinKey),
      method: this.normalizeMethod(input.method),
      urlTemplate: this.normalizeNullableString(input.urlTemplate),
      headers: this.normalizeJsonObject(input.headers, '请求头'),
      queryTemplate: this.normalizeJsonObject(input.queryTemplate, 'Query 模板'),
      bodyTemplate: this.normalizeNullableString(input.bodyTemplate),
      bodyType: this.normalizeBodyType(input.bodyType),
      timeoutMs: this.normalizeTimeout(input.timeoutMs) ?? 20000,
      status: this.normalizeStatus(input.status) ?? 'enabled',
    })

    return this.listConfig()
  }

  async updateAdapter(
    id: string,
    input: {
      sourceId?: string
      code?: string
      name?: string
      type?: string
      builtinKey?: string | null
      method?: string
      urlTemplate?: string | null
      headers?: unknown
      queryTemplate?: unknown
      bodyTemplate?: string | null
      bodyType?: string
      timeoutMs?: unknown
      status?: string
    },
  ) {
    await this.platform.updateAdapter(id, {
      sourceId: input.sourceId === undefined ? undefined : this.normalizeRequiredString(input.sourceId, '平台源'),
      code: input.code === undefined ? undefined : this.normalizeCode(input.code, 'Adapter 编码'),
      name: input.name === undefined ? undefined : this.normalizeRequiredString(input.name, 'Adapter 名称'),
      type: input.type === undefined ? undefined : this.normalizeAdapterType(input.type),
      builtinKey: input.builtinKey === undefined ? undefined : this.normalizeNullableString(input.builtinKey),
      method: input.method === undefined ? undefined : this.normalizeMethod(input.method),
      urlTemplate: input.urlTemplate === undefined ? undefined : this.normalizeNullableString(input.urlTemplate),
      headers: this.normalizeJsonObject(input.headers, '请求头'),
      queryTemplate: this.normalizeJsonObject(input.queryTemplate, 'Query 模板'),
      bodyTemplate: input.bodyTemplate === undefined ? undefined : this.normalizeNullableString(input.bodyTemplate),
      bodyType: input.bodyType === undefined ? undefined : this.normalizeBodyType(input.bodyType),
      timeoutMs: this.normalizeTimeout(input.timeoutMs, true),
      status: this.normalizeStatus(input.status),
    })

    return this.listConfig()
  }

  async createFunctionParam(input: {
    functionId?: string
    paramKey?: string
    label?: string
    source?: string
    type?: string
    required?: boolean
    defaultValue?: unknown
    allowValues?: unknown
    description?: string
    sort?: unknown
    status?: string
  }) {
    await this.platform.createFunctionParam({
      id: `fp_${crypto.randomUUID()}`,
      functionId: this.normalizeRequiredString(input.functionId, '功能接口'),
      paramKey: this.normalizeIdentifier(input.paramKey, '参数 Key'),
      label: this.normalizeRequiredString(input.label, '参数名称'),
      source: this.normalizeParamSource(input.source),
      type: this.normalizeParamType(input.type),
      required: Boolean(input.required),
      defaultValue: input.defaultValue,
      allowValues: this.normalizeJsonArray(input.allowValues, '可选值'),
      description: input.description?.trim() ?? '',
      sort: this.normalizePriority(input.sort) ?? 100,
      status: this.normalizeStatus(input.status) ?? 'enabled',
    })

    return this.listConfig()
  }

  async updateFunctionParam(
    id: string,
    input: {
      functionId?: string
      paramKey?: string
      label?: string
      source?: string
      type?: string
      required?: boolean
      defaultValue?: unknown
      allowValues?: unknown
      description?: string
      sort?: unknown
      status?: string
    },
  ) {
    await this.platform.updateFunctionParam(id, {
      functionId: input.functionId === undefined ? undefined : this.normalizeRequiredString(input.functionId, '功能接口'),
      paramKey: input.paramKey === undefined ? undefined : this.normalizeIdentifier(input.paramKey, '参数 Key'),
      label: input.label === undefined ? undefined : this.normalizeRequiredString(input.label, '参数名称'),
      source: input.source === undefined ? undefined : this.normalizeParamSource(input.source),
      type: input.type === undefined ? undefined : this.normalizeParamType(input.type),
      required: input.required,
      defaultValue: input.defaultValue,
      allowValues: this.normalizeJsonArray(input.allowValues, '可选值'),
      description: input.description?.trim(),
      sort: this.normalizePriority(input.sort),
      status: this.normalizeStatus(input.status),
    })

    return this.listConfig()
  }

  async createFunctionRoute(input: {
    functionId?: string
    routeKey?: string
    name?: string
    match?: unknown
    defaultParams?: unknown
    sort?: unknown
    status?: string
  }) {
    await this.platform.createFunctionRoute({
      id: `fr_${crypto.randomUUID()}`,
      functionId: this.normalizeRequiredString(input.functionId, '功能接口'),
      routeKey: this.normalizeCode(input.routeKey, 'Route Key'),
      name: this.normalizeRequiredString(input.name, 'Route 名称'),
      match: this.normalizeJsonObject(input.match ?? {}, '匹配条件') ?? {},
      defaultParams: this.normalizeJsonObject(input.defaultParams, '默认参数'),
      sort: this.normalizePriority(input.sort) ?? 100,
      status: this.normalizeStatus(input.status) ?? 'enabled',
    })

    return this.listConfig()
  }

  async updateFunctionRoute(
    id: string,
    input: {
      functionId?: string
      routeKey?: string
      name?: string
      match?: unknown
      defaultParams?: unknown
      sort?: unknown
      status?: string
    },
  ) {
    await this.platform.updateFunctionRoute(id, {
      functionId: input.functionId === undefined ? undefined : this.normalizeRequiredString(input.functionId, '功能接口'),
      routeKey: input.routeKey === undefined ? undefined : this.normalizeCode(input.routeKey, 'Route Key'),
      name: input.name === undefined ? undefined : this.normalizeRequiredString(input.name, 'Route 名称'),
      match: this.normalizeJsonObject(input.match, '匹配条件'),
      defaultParams: this.normalizeJsonObject(input.defaultParams, '默认参数'),
      sort: this.normalizePriority(input.sort),
      status: this.normalizeStatus(input.status),
    })

    return this.listConfig()
  }

  async createAdapterParamMap(input: {
    functionId?: string
    adapterId?: string
    routeId?: string | null
    publicParam?: string
    target?: string
    targetKey?: string
    template?: string | null
    defaultValue?: unknown
    status?: string
  }) {
    await this.platform.createAdapterParamMap({
      id: `apm_${crypto.randomUUID()}`,
      functionId: this.normalizeRequiredString(input.functionId, '功能接口'),
      adapterId: this.normalizeRequiredString(input.adapterId, 'Adapter'),
      routeId: this.normalizeNullableString(input.routeId),
      publicParam: this.normalizeIdentifier(input.publicParam, '公开参数'),
      target: this.normalizeParamMapTarget(input.target),
      targetKey: this.normalizeRequiredString(input.targetKey, '目标 Key'),
      template: this.normalizeNullableString(input.template),
      defaultValue: input.defaultValue,
      status: this.normalizeStatus(input.status) ?? 'enabled',
    })

    return this.listConfig()
  }

  async updateAdapterParamMap(
    id: string,
    input: {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      publicParam?: string
      target?: string
      targetKey?: string
      template?: string | null
      defaultValue?: unknown
      status?: string
    },
  ) {
    await this.platform.updateAdapterParamMap(id, {
      functionId: input.functionId === undefined ? undefined : this.normalizeRequiredString(input.functionId, '功能接口'),
      adapterId: input.adapterId === undefined ? undefined : this.normalizeRequiredString(input.adapterId, 'Adapter'),
      routeId: input.routeId === undefined ? undefined : this.normalizeNullableString(input.routeId),
      routeIdTouched: input.routeId !== undefined,
      publicParam: input.publicParam === undefined ? undefined : this.normalizeIdentifier(input.publicParam, '公开参数'),
      target: input.target === undefined ? undefined : this.normalizeParamMapTarget(input.target),
      targetKey: input.targetKey === undefined ? undefined : this.normalizeRequiredString(input.targetKey, '目标 Key'),
      template: input.template === undefined ? undefined : this.normalizeNullableString(input.template),
      defaultValue: input.defaultValue,
      status: this.normalizeStatus(input.status),
    })

    return this.listConfig()
  }

  async createResponseMap(input: {
    functionId?: string | null
    adapterId?: string
    dataPath?: string | null
    itemsPath?: string | null
    fields?: unknown
    status?: string
  }) {
    await this.platform.createResponseMap({
      id: `rm_${crypto.randomUUID()}`,
      functionId: this.normalizeNullableString(input.functionId),
      adapterId: this.normalizeRequiredString(input.adapterId, 'Adapter'),
      dataPath: this.normalizeNullableString(input.dataPath),
      itemsPath: this.normalizeNullableString(input.itemsPath),
      fields: this.normalizeJsonObject(input.fields ?? {}, '字段映射') ?? {},
      status: this.normalizeStatus(input.status) ?? 'enabled',
    })

    return this.listConfig()
  }

  async updateResponseMap(
    id: string,
    input: {
      functionId?: string | null
      adapterId?: string
      dataPath?: string | null
      itemsPath?: string | null
      fields?: unknown
      status?: string
    },
  ) {
    await this.platform.updateResponseMap(id, {
      functionId: input.functionId === undefined ? undefined : this.normalizeNullableString(input.functionId),
      functionIdTouched: input.functionId !== undefined,
      adapterId: input.adapterId === undefined ? undefined : this.normalizeRequiredString(input.adapterId, 'Adapter'),
      dataPath: input.dataPath === undefined ? undefined : this.normalizeNullableString(input.dataPath),
      itemsPath: input.itemsPath === undefined ? undefined : this.normalizeNullableString(input.itemsPath),
      fields: this.normalizeJsonObject(input.fields, '字段映射'),
      status: this.normalizeStatus(input.status),
    })

    return this.listConfig()
  }

  private async bootstrapAdminIfNeeded(username: string, password: string) {
    const count = await this.platform.countUsers()
    if (count > 0) return

    if (!this.env.ADMIN_PASSWORD || password !== this.env.ADMIN_PASSWORD) {
      throw new UnauthorizedError('首次登录前请先配置 ADMIN_PASSWORD')
    }

    await this.platform.createAdminUser({
      id: crypto.randomUUID(),
      username,
      passwordHash: await hashPassword(password),
      displayName: '管理员',
    })
  }

  private normalizeStatus(status: string | undefined) {
    if (status === undefined) return undefined
    if (!STATUS_VALUES.has(status)) {
      throw new BadRequestError('状态只能是 enabled 或 disabled')
    }
    return status as 'enabled' | 'disabled'
  }

  private normalizeAdapterType(type: string | undefined) {
    if (!type || !ADAPTER_TYPES.has(type)) {
      throw new BadRequestError('Adapter 类型只能是 builtin 或 http_custom')
    }
    return type as 'builtin' | 'http_custom'
  }

  private normalizeBodyType(type: string | undefined) {
    if (type === undefined) return 'none'
    if (!BODY_TYPES.has(type)) {
      throw new BadRequestError('Body 类型只能是 none、json、form 或 text')
    }
    return type as 'none' | 'json' | 'form' | 'text'
  }

  private normalizeParamSource(source: string | undefined) {
    if (source === undefined) return 'any'
    if (!PARAM_SOURCES.has(source)) {
      throw new BadRequestError('参数来源只能是 query、body 或 any')
    }
    return source as 'query' | 'body' | 'any'
  }

  private normalizeParamType(type: string | undefined) {
    if (type === undefined) return 'string'
    if (!PARAM_TYPES.has(type)) {
      throw new BadRequestError('参数类型只能是 string、number、boolean 或 json')
    }
    return type as 'string' | 'number' | 'boolean' | 'json'
  }

  private normalizeParamMapTarget(target: string | undefined) {
    if (!target || !PARAM_MAP_TARGETS.has(target)) {
      throw new BadRequestError('映射目标只能是 param、query、header 或 body')
    }
    return target as 'param' | 'query' | 'header' | 'body'
  }

  private normalizeMenuScope(scope: string | undefined) {
    const value = (scope || 'side').trim()
    if (!MENU_SCOPES.has(value)) {
      throw new BadRequestError('菜单范围只能是 top 或 side')
    }
    return value as 'top' | 'side'
  }

  private normalizeMethod(method: string | undefined) {
    const value = (method || 'GET').trim().toUpperCase()
    if (!HTTP_METHODS.has(value)) {
      throw new BadRequestError('请求方法不支持')
    }
    return value
  }

  private normalizeCode(value: string | undefined, label: string) {
    const normalized = this.normalizeRequiredString(value, label)
    if (!/^[a-z][a-z0-9-]*$/.test(normalized)) {
      throw new BadRequestError(`${label}只能使用小写字母、数字和中划线，并以字母开头`)
    }
    return normalized
  }

  private normalizeIdentifier(value: string | undefined, label: string) {
    const normalized = this.normalizeRequiredString(value, label)
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(normalized)) {
      throw new BadRequestError(`${label}只能使用字母、数字和下划线，并以字母或下划线开头`)
    }
    return normalized
  }

  private normalizeRequiredString(value: string | undefined, label: string) {
    const normalized = value?.trim()
    if (!normalized) {
      throw new BadRequestError(`${label}不能为空`)
    }
    return normalized
  }

  private normalizeNullableString(value: string | null | undefined) {
    if (value === undefined) return undefined
    const normalized = value?.trim()
    return normalized || null
  }

  private normalizePriority(priority: unknown) {
    if (priority === undefined) return undefined
    const value = Number(priority)
    if (!Number.isInteger(value) || value < 0) {
      throw new BadRequestError('优先级必须是非负整数')
    }
    return value
  }

  private normalizeWeight(weight: unknown) {
    if (weight === undefined) return undefined
    const value = Number(weight)
    if (!Number.isInteger(value) || value <= 0) {
      throw new BadRequestError('权重必须是正整数')
    }
    return value
  }

  private normalizeTimeout(timeout: unknown, optional = false) {
    if (timeout === undefined) {
      return optional ? undefined : 20000
    }
    const value = Number(timeout)
    if (!Number.isInteger(value) || value <= 0) {
      throw new BadRequestError('超时时间必须是正整数')
    }
    return value
  }

  private normalizeJsonObject(value: unknown, label: string) {
    if (value === undefined) return undefined
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
    throw new BadRequestError(`${label}必须是 JSON 对象`)
  }

  private normalizeJsonArray(value: unknown, label: string) {
    if (value === undefined) return undefined
    if (Array.isArray(value)) return value
    throw new BadRequestError(`${label}必须是 JSON 数组`)
  }
}
