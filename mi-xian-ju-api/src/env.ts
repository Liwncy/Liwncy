export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  all<T>(): Promise<{ results: T[] }>
  run(): Promise<{ success: boolean }>
}

export interface BookmarkDatabase {
  prepare(query: string): D1PreparedStatement
}

export type AppEnv = {
  Bindings: {
    DB: BookmarkDatabase
  }
}
