export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export function ok(data: unknown, extra?: Record<string, unknown>) {
  return { code: 0, msg: '', data, ...extra }
}
