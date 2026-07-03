import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../config/env'
import { HttpError } from '../common/http-error'
import { fail } from '../common/response'

/** 全局异常处理（类似 @ControllerAdvice） */
export const errorHandlerMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof HttpError) {
      return c.json(fail(err.status, err.message), err.status as 400 | 401 | 403 | 404 | 500 | 502)
    }
    console.error(err)
    return c.json(fail(500, 'Internal Server Error'), 500)
  }
}
