import { get } from '@/api/http'
import type { ApiResult } from '@/types/global'
import type { MenuNode } from '@/types/menu'

export function fetchBookMarks(dataSource = '0') {
  return get<ApiResult<MenuNode[]>>('/webs/bookMark/getBookMarks', {
    params: { dataSource },
  })
}
