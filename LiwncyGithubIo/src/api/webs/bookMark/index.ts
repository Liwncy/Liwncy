import request from '@/utils/request';

//获取侧边栏菜单
export const getSideMenus = function (query: string[]) {
    return request.get('webs/bookMark/sideMenu', {
        suffixs: query
    })
}