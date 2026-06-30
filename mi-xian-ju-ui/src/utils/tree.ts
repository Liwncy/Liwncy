/** 从树形菜单节点收集指定字段（如 books） */
export function getAllNodeFieldArr<T>(
  list: Array<Record<string, unknown>>,
  result: T[][],
  field: string,
): T[][] {
  for (const item of list) {
    const value = item[field]
    if (value) {
      result.push(value as T[])
    } else if (Array.isArray(item.children)) {
      getAllNodeFieldArr(item.children as Array<Record<string, unknown>>, result, field)
    }
  }
  return result
}
