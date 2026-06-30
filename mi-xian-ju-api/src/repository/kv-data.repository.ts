/** KV 数据访问层（类似 Repository / Mapper） */
export class KvDataRepository {
  constructor(private readonly kv: KVNamespace) {}

  async getRaw(key: string): Promise<string | null> {
    return this.kv.get(key)
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.getRaw(key)
    if (raw === null) {
      return null
    }
    return JSON.parse(raw) as T
  }
}
