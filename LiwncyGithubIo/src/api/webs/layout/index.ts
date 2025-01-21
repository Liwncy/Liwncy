import request from '@/utils/request';

//获取顶部菜单
export const getTopMenus = function () {
    return request.get('webs/layout/topMenu')
}