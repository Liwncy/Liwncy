import request from '@/utils/request';
import axios from "axios";
import {outsideStore} from "@/store/outside";

//获取侧边栏菜单
export const getSideMenus = function (query: string[]) {
    return request.get('webs/bookMark/sideMenu', {
        suffixs: query
    })
}

//获取WeTab侧边栏菜单
export const getWeTabSidMenus = async function () {
    let returnRes: any = [];
    await axios.get("https://api.wetab.link/api/user-sync/restore", {
        headers: {
            "I-App": 'hitab',
            "I-Version": '1.9.42',
            "I-Platform": 'chrome',
            "I-Branch": 'zh',
            "I-Lang": 'zh-CN',
            // @ts-ignore
            "Authorization": "Bearer " + outsideStore().weTabInfo.token
        },
        params: {
            keys: "store-icon"
        }
    }).then(res => {
        // console.log(res)
        if (res.data.code === 4002) {
            outsideStore().loadWeTabInfo();
        }
        if (res.data.code === 0) {
            returnRes = res.data.data['store-icon'].icons.map((item: any) => {
                return {
                    id: item.id,
                    name: item.name,
                    icon: item.iconClass,
                    books: item.children.map((child: any) => {
                        return {
                            id: child.id,
                            title: child.name,
                            avatar: child.bgImage,
                            links: child.target,
                            description: child.name
                        }
                    })
                }
            })
        }
    })
    return {code: 200, data: returnRes};
}