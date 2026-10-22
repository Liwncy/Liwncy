export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  all<T>(): Promise<{ results: T[] }>
  run(): Promise<{ success: boolean }>
}

export interface AppDatabase {
  prepare(query: string): D1PreparedStatement
}

export interface WorkerFetcher {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>
}

export type AppEnv = {
  Bindings: {
    DB: AppDatabase
    ADMIN_TOKEN?: string
    CF_WORKER: WorkerFetcher
  }
}
