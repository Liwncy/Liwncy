import type { Context } from 'hono'
import { BadRequestError, UnauthorizedError } from '../../common/http-error'
import { ok } from '../../common/response'
import type { AppEnv } from '../../config/env'

function getBearerToken(c: Context<AppEnv>) {
  const authorization = c.req.header('authorization') ?? ''
  const [scheme, token] = authorization.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new UnauthorizedError('缺少登录凭证')
  }
  return token
}

export class AdminController {
  async login(c: Context<AppEnv>) {
    const input = (await c.req.json().catch(() => ({}))) as { username?: string; password?: string }
    const data = await c.get('services').admin.login(input)
    return c.json(ok(data))
  }

  async me(c: Context<AppEnv>) {
    const data = await c.get('services').admin.getCurrentUser(getBearerToken(c))
    return c.json(ok(data))
  }

  async config(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const data = await c.get('services').admin.listConfig()
    return c.json(ok(data))
  }

  async updateFunction(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少功能接口 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      code?: string
      name?: string
      method?: string
      description?: string
      paramsSchema?: unknown
      status?: string
      isPublic?: boolean
      defaultParams?: unknown
      responseType?: string
    }
    const data = await c.get('services').admin.updateFunction(id, input)
    return c.json(ok(data))
  }

  async deleteFunction(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少功能接口 ID')
    }
    const data = await c.get('services').admin.deleteFunction(id)
    return c.json(ok(data))
  }

  async createFunction(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      code?: string
      name?: string
      method?: string
      description?: string
      paramsSchema?: unknown
      defaultParams?: unknown
      responseType?: string
      isPublic?: boolean
      status?: string
    }
    const data = await c.get('services').admin.createFunction(input)
    return c.json(ok(data))
  }

  async debugFunction(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      code?: string
      method?: string
      params?: unknown
    }
    const data = await c.get('services').admin.debugFunctionInvoke(input)
    return c.json(ok(data))
  }

  async createChain(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      code?: string
      name?: string
      description?: string
      isDefault?: boolean
      sort?: unknown
      status?: string
    }
    const data = await c.get('services').admin.createChain(input)
    return c.json(ok(data))
  }

  async updateChain(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少执行链 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      code?: string
      name?: string
      description?: string
      isDefault?: boolean
      sort?: unknown
      status?: string
    }
    const data = await c.get('services').admin.updateChain(id, input)
    return c.json(ok(data))
  }

  async createChainStep(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      chainId?: string
      stepKey?: string
      type?: string
      name?: string
      config?: unknown
      sort?: unknown
      status?: string
    }
    const data = await c.get('services').admin.createChainStep(input)
    return c.json(ok(data))
  }

  async updateChainStep(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少执行链步骤 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      chainId?: string
      stepKey?: string
      type?: string
      name?: string
      config?: unknown
      sort?: unknown
      status?: string
    }
    const data = await c.get('services').admin.updateChainStep(id, input)
    return c.json(ok(data))
  }

  async deleteChainStep(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少执行链步骤 ID')
    }
    const data = await c.get('services').admin.deleteChainStep(id)
    return c.json(ok(data))
  }

  async createMenu(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
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
    }
    const data = await c.get('services').admin.createMenu(input)
    return c.json(ok(data))
  }

  async updateMenu(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少菜单 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
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
    }
    const data = await c.get('services').admin.updateMenu(id, input)
    return c.json(ok(data))
  }

  async importMenus(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      scope?: string
      module?: string
      replace?: boolean
    }
    const data = await c.get('services').admin.importMenus(input)
    return c.json(ok(data))
  }

  async updateFunctionAdapter(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少绑定 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      status?: string
      priority?: unknown
      weight?: unknown
      fallbackEnabled?: boolean
      defaultParams?: unknown
      fixedParams?: unknown
    }
    const data = await c.get('services').admin.updateFunctionAdapter(id, input)
    return c.json(ok(data))
  }

  async deleteFunctionAdapter(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少绑定 ID')
    }
    const data = await c.get('services').admin.deleteFunctionAdapter(id)
    return c.json(ok(data))
  }

  async createFunctionAdapter(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      status?: string
      priority?: unknown
      weight?: unknown
      fallbackEnabled?: boolean
      defaultParams?: unknown
      fixedParams?: unknown
    }
    const data = await c.get('services').admin.createFunctionAdapter(input)
    return c.json(ok(data))
  }

  async createSource(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      code?: string
      name?: string
      baseUrl?: string
      status?: string
      timeoutMs?: unknown
      rateLimit?: unknown
    }
    const data = await c.get('services').admin.createSource(input)
    return c.json(ok(data))
  }

  async updateSource(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少平台源 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      code?: string
      name?: string
      baseUrl?: string
      status?: string
      timeoutMs?: unknown
      rateLimit?: unknown
    }
    const data = await c.get('services').admin.updateSource(id, input)
    return c.json(ok(data))
  }

  async deleteSource(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少平台 ID')
    }
    const data = await c.get('services').admin.deleteSource(id)
    return c.json(ok(data))
  }

  async createAdapter(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
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
    }
    const data = await c.get('services').admin.createAdapter(input)
    return c.json(ok(data))
  }

  async updateAdapter(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少 Adapter ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
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
    }
    const data = await c.get('services').admin.updateAdapter(id, input)
    return c.json(ok(data))
  }

  async deleteAdapter(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少 Adapter ID')
    }
    const data = await c.get('services').admin.deleteAdapter(id)
    return c.json(ok(data))
  }

  async createFunctionParam(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
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
    }
    const data = await c.get('services').admin.createFunctionParam(input)
    return c.json(ok(data))
  }

  async updateFunctionParam(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少参数 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
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
    }
    const data = await c.get('services').admin.updateFunctionParam(id, input)
    return c.json(ok(data))
  }

  async deleteFunctionParam(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少参数 ID')
    }
    const data = await c.get('services').admin.deleteFunctionParam(id)
    return c.json(ok(data))
  }

  async createFunctionRoute(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      routeKey?: string
      name?: string
      match?: unknown
      defaultParams?: unknown
      sort?: unknown
      status?: string
    }
    const data = await c.get('services').admin.createFunctionRoute(input)
    return c.json(ok(data))
  }

  async updateFunctionRoute(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少 Route ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      routeKey?: string
      name?: string
      match?: unknown
      defaultParams?: unknown
      sort?: unknown
      status?: string
    }
    const data = await c.get('services').admin.updateFunctionRoute(id, input)
    return c.json(ok(data))
  }

  async deleteFunctionRoute(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少 Route ID')
    }
    const data = await c.get('services').admin.deleteFunctionRoute(id)
    return c.json(ok(data))
  }

  async createAdapterParamMap(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      publicParam?: string
      target?: string
      targetKey?: string
      template?: string | null
      defaultValue?: unknown
      status?: string
    }
    const data = await c.get('services').admin.createAdapterParamMap(input)
    return c.json(ok(data))
  }

  async updateAdapterParamMap(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少映射 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string
      adapterId?: string
      routeId?: string | null
      publicParam?: string
      target?: string
      targetKey?: string
      template?: string | null
      defaultValue?: unknown
      status?: string
    }
    const data = await c.get('services').admin.updateAdapterParamMap(id, input)
    return c.json(ok(data))
  }

  async deleteAdapterParamMap(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少参数映射 ID')
    }
    const data = await c.get('services').admin.deleteAdapterParamMap(id)
    return c.json(ok(data))
  }

  async createResponseMap(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string | null
      adapterId?: string
      dataPath?: string | null
      itemsPath?: string | null
      fields?: unknown
      status?: string
    }
    const data = await c.get('services').admin.createResponseMap(input)
    return c.json(ok(data))
  }

  async updateResponseMap(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少响应映射 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      functionId?: string | null
      adapterId?: string
      dataPath?: string | null
      itemsPath?: string | null
      fields?: unknown
      status?: string
    }
    const data = await c.get('services').admin.updateResponseMap(id, input)
    return c.json(ok(data))
  }

  async deleteResponseMap(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少响应映射 ID')
    }
    const data = await c.get('services').admin.deleteResponseMap(id)
    return c.json(ok(data))
  }
}

export const adminController = new AdminController()
