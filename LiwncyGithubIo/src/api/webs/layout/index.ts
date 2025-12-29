import type {ApiResult} from '@/types/global'
import {requestA} from '@/utils/request';

//获取顶部菜单
export const getTopMenus = function (param: any = {}) {
    return requestA.get<ApiResult<any[]>>('/webs/layout/topMenu', {data: param})
}