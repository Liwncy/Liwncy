import { BadRequestError, UnauthorizedError } from '../../common/http-error'
import { generateToken, hashPassword, hashToken, verifyPassword } from '../../common/crypto'
import type { Bindings } from '../../config/env'
import { D1PlatformRepository } from '../../repository/d1-platform.repository'

const SESSION_DAYS = 7
const STATUS_VALUES = new Set(['enabled', 'disabled'])

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export class AdminService {
  constructor(
    private readonly platform: D1PlatformRepository,
    private readonly env: Bindings,
  ) {}

  async login(input: { username?: string; password?: string }) {
    const username = input.username?.trim() || this.env.ADMIN_USERNAME || 'admin'
    const password = input.password ?? ''
    if (!password) {
      throw new BadRequestError('请输入密码')
    }

    await this.bootstrapAdminIfNeeded(username, password)

    const user = await this.platform.findUserByUsername(username)
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new UnauthorizedError('用户名或密码错误')
    }

    const token = await generateToken()
    const expiresAt = addDays(new Date(), SESSION_DAYS).toISOString()

    await this.platform.createSession({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: await hashToken(token),
      expiresAt,
    })
    await this.platform.updateUserLastLogin(user.id)

    return {
      token,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
      },
    }
  }

  async getCurrentUser(token: string) {
    const session = await this.platform.findSessionByTokenHash(await hashToken(token))
    if (!session) {
      throw new UnauthorizedError('登录已过期')
    }

    const user = await this.platform.findUserById(session.user_id)
    if (!user) {
      throw new UnauthorizedError('用户不存在或已停用')
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    }
  }

  async listConfig() {
    const [functions, sources, adapters, functionAdapters] = await Promise.all([
      this.platform.listFunctions(),
      this.platform.listSources(),
      this.platform.listAdapters(),
      this.platform.listFunctionAdapters(),
    ])

    return { functions, sources, adapters, functionAdapters }
  }

  async updateFunction(
    id: string,
    input: {
      status?: string
      isPublic?: boolean
      defaultParams?: unknown
    },
  ) {
    const status = this.normalizeStatus(input.status)
    const defaultParams = this.normalizeJsonObject(input.defaultParams, '默认参数')

    await this.platform.updateFunction(id, {
      status,
      isPublic: input.isPublic,
      defaultParams,
    })

    return this.listConfig()
  }

  async updateFunctionAdapter(
    id: string,
    input: {
      status?: string
      priority?: unknown
      fallbackEnabled?: boolean
      defaultParams?: unknown
      fixedParams?: unknown
    },
  ) {
    const status = this.normalizeStatus(input.status)
    const priority = this.normalizePriority(input.priority)
    const defaultParams = this.normalizeJsonObject(input.defaultParams, '默认参数')
    const fixedParams = this.normalizeJsonObject(input.fixedParams, '固定参数')

    await this.platform.updateFunctionAdapter(id, {
      status,
      priority,
      fallbackEnabled: input.fallbackEnabled,
      defaultParams,
      fixedParams,
    })

    return this.listConfig()
  }

  private async bootstrapAdminIfNeeded(username: string, password: string) {
    const count = await this.platform.countUsers()
    if (count > 0) return

    if (!this.env.ADMIN_PASSWORD || password !== this.env.ADMIN_PASSWORD) {
      throw new UnauthorizedError('首次登录前请先配置 ADMIN_PASSWORD')
    }

    await this.platform.createAdminUser({
      id: crypto.randomUUID(),
      username,
      passwordHash: await hashPassword(password),
      displayName: '管理员',
    })
  }

  private normalizeStatus(status: string | undefined) {
    if (status === undefined) return undefined
    if (!STATUS_VALUES.has(status)) {
      throw new BadRequestError('状态只能是 enabled 或 disabled')
    }
    return status as 'enabled' | 'disabled'
  }

  private normalizePriority(priority: unknown) {
    if (priority === undefined) return undefined
    const value = Number(priority)
    if (!Number.isInteger(value) || value < 0) {
      throw new BadRequestError('优先级必须是非负整数')
    }
    return value
  }

  private normalizeJsonObject(value: unknown, label: string) {
    if (value === undefined) return undefined
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
    throw new BadRequestError(`${label}必须是 JSON 对象`)
  }
}
