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
