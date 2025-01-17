import Http from '@/api/http';

//获取侧边栏菜单
export const getSidMenus = function () {
    return Http.get('webs/hotBans/getSidMenus')
}