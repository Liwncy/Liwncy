import request1 from '@/utils/request-github-data';
import type { ApiResult } from '@/types/global'
import type { SysMenu, SysMenuSaveParam, SysMenuUpdateParam } from '@/types/menu'
import {request} from '@/utils/request';

//获取顶部菜单
export const getTopMenus = function (param: SysMenu = {}) {
    return request1.get('webs/layout/topMenu')
    // return request.post<ApiResult<SysMenu[]>>('/system/menu/tree', { data: param })
}