import {request} from "@/utils/request";

/**
 * cloudflare 数据请求
 * 自己写的CfWorker
 * https://dash.cloudflare.com/
 */
enum Api {
    BaseUrl = 'https://lwcfworker.dpdns.org',
    Get = 'get',
    Post = 'post',
    Put = 'put',
    Delete = 'delete'
}

// CfGet请求
export const requestGetCfWorker = function (url: string, param: any = {}) {
    return request.request('GET', Api.BaseUrl + url, {params: param})
}

// CfPost请求
export const requestPostCfWorker = function (url: string, param: any = {}) {
    return request.request('POST', Api.BaseUrl + url, {data: param})
    // return request.request('POST', import.meta.env.VITE_CORS_PROXY_URL + `?url=${Api.BaseUrl+url}`, {data:param})
}