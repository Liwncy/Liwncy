import {request} from '@/utils/request';

/**
 * 60sAPI 数据请求
 * https://docs.60s-api.viki.moe/5831581m0
 */

enum Api {
    BaseUrl = 'https://60s.viki.moe',
    Get = 'get',
    Post = 'post',
    Put = 'put',
    Delete = 'delete'
}

// 60sGet请求
export const requestGet60sApi = function (url: string, param: any = {}) {
    return request.request('GET', Api.BaseUrl + url, {params: param})
}