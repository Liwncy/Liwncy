import { HttpError } from './http'

export function applyMapping(source: unknown, mapping: Record<string, string>) {
  let data: unknown = {}
  for (const [ours, theirs] of Object.entries(mapping)) {
    data = mergePath(data, pathParts(ours), readPath(source, theirs))
  }
  return data
}

export function pathParts(path: string) {
  if (path.split('[]').length - 1 > 1) throw new HttpError('路径里只能有一个 []', 400)
  let normalized = path.replaceAll('[]', '.[]')
  if (normalized.startsWith('.')) normalized = normalized.slice(1)
  const parts = normalized.split('.')
  if (parts.length === 0 || parts.some((part) => part === '')) throw new HttpError('映射路径不对', 400)
  return parts
}

function readPath(value: unknown, path: string) {
  return readParts(value, pathParts(path))
}

function readParts(value: unknown, parts: string[]): unknown {
  if (parts.length === 0) return value
  const [head, ...rest] = parts
  if (head === '[]') {
    if (!Array.isArray(value)) throw new HttpError('路径没取到', 400)
    return value.map((item) => readParts(item, rest))
  }
  if (!value || typeof value !== 'object' || Array.isArray(value) || !(head in value)) {
    throw new HttpError('路径没取到', 400)
  }
  return readParts((value as Record<string, unknown>)[head], rest)
}

function mergePath(base: unknown, parts: string[], value: unknown): unknown {
  if (parts.length === 0) return value
  const [head, ...rest] = parts
  if (head === '[]') {
    const items = Array.isArray(value) ? value : [value]
    const rows = Array.isArray(base) ? [...base] : []
    items.forEach((item, index) => {
      rows[index] = mergePath(rows[index], rest, item)
    })
    return rows
  }
  const record =
    base && typeof base === 'object' && !Array.isArray(base) ? { ...(base as Record<string, unknown>) } : {}
  record[head] = mergePath(record[head], rest, value)
  return record
}
