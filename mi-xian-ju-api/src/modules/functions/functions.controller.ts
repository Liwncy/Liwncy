import type { Context } from 'hono'
import { BadRequestError } from '../../common/http-error'
import { ok } from '../../common/response'
import type { AppEnv } from '../../config/env'

async function readParams(c: Context<AppEnv>) {
  const queryParams = Object.fromEntries(new URL(c.req.url).searchParams.entries())
  if (c.req.method === 'GET') {
    return queryParams
  }

  const contentType = c.req.header('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return queryParams
  }

  const body = (await c.req.json().catch(() => ({}))) as unknown
  return {
    ...queryParams,
    ...(body && typeof body === 'object' && !Array.isArray(body) ? body : {}),
  }
}

export class FunctionsController {
  async invoke(c: Context<AppEnv>) {
    const code = c.req.param('code')
    if (!code) {
      throw new BadRequestError('缺少接口编码')
    }
    const params = await readParams(c)
    const data = await c.get('services').functions.invoke(code, c.req.method, params)
    return c.json(ok(data))
  }
}

export const functionsController = new FunctionsController()
