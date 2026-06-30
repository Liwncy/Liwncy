import { KvDataRepository } from '../../repository/kv-data.repository'
import { BadRequestError, NotFoundError } from '../../common/http-error'

/** 兼容 GitHub Raw /data/* 路径的业务层 */
export class DataService {
  constructor(private readonly kv: KvDataRepository) {}

  /**
   * 解析 /data/{path...}/{variant} 并读取 KV
   * 示例：common/menu/getRouters/index
   */
  async getByPath(fullPath: string): Promise<unknown> {
    if (!fullPath) {
      throw new BadRequestError('missing path')
    }

    const segments = fullPath.split('/')
    const variant = segments.pop()
    if (!variant) {
      throw new BadRequestError('missing variant')
    }

    const key = `${segments.join('/')}/${variant}`
    const raw = await this.kv.getRaw(key)

    if (raw === null) {
      throw new NotFoundError('not found', { key })
    }

    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
}
