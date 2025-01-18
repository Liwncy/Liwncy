import request from '@/utils/request';

//获取侧边栏菜单
export const getSidMenus = function () {
    return request.get('webs/hotBans/sideMenu',"json")
}