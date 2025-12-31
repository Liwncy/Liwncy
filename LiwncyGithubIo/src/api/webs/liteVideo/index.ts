import {request} from '@/utils/request';
import type {ApiResult} from "@/types/global";

// 获取侧边栏菜单
export const getSideMenus = function (param: any = {}) {
    return request.get<ApiResult<any[]>>('/webs/liteVideo/sideMenu', {params: param})
}