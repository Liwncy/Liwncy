import {requestC} from '@/utils/request';

/**
 * 遇见API 数据请求
 * https://api.yujn.cn/
 */

enum Api {
    // BaseUrl = 'https://api.yujn.cn',
    BaseUrl = '/api-yujn',
    MoType = "?type=json",
    Get = 'get',
    Post = 'post',
    Put = 'put',
    Delete = 'delete'
}

// 遇见Get请求
export const requestGetYujnApi = function (url: string, param: any = {}) {
    return requestC.request('GET', url + Api.MoType, {params: param })
}