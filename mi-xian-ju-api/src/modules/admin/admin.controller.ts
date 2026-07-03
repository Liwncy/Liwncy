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
      status?: string
      isPublic?: boolean
      defaultParams?: unknown
    }
    const data = await c.get('services').admin.updateFunction(id, input)
    return c.json(ok(data))
  }

  async updateFunctionAdapter(c: Context<AppEnv>) {
    await c.get('services').admin.getCurrentUser(getBearerToken(c))
    const id = c.req.param('id')
    if (!id) {
      throw new BadRequestError('缺少绑定 ID')
    }
    const input = (await c.req.json().catch(() => ({}))) as {
      status?: string
      priority?: unknown
      fallbackEnabled?: boolean
      defaultParams?: unknown
      fixedParams?: unknown
    }
    const data = await c.get('services').admin.updateFunctionAdapter(id, input)
    return c.json(ok(data))
  }
}

export const adminController = new AdminController()
