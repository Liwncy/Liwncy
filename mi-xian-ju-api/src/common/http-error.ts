export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found', body?: Record<string, unknown>) {
    super(404, message, body)
    this.name = 'NotFoundError'
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', body?: Record<string, unknown>) {
    super(400, message, body)
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', body?: Record<string, unknown>) {
    super(401, message, body)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', body?: Record<string, unknown>) {
    super(403, message, body)
    this.name = 'ForbiddenError'
  }
}
