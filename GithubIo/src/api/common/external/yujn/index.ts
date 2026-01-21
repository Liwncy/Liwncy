import {request} from '@/utils/request';

/**
 * 遇见API 数据请求
 * https://api.yujn.cn/
 */

enum Api {
    // 我的跨域代理
    BaseUrl = 'https://api.yujn.cn',
    // BaseUrl = '/api-yujn',
    MoType = "?type=json",
    Get = 'get',
    Post = 'post',
    Put = 'put',
    Delete = 'delete'
}

// 遇见Get请求
export const requestGetYujnApi = function (url: string, param: any = {}) {
    // 1. 目标跨域接口地址（确保可直接访问，先在浏览器地址栏测试）
    const targetApiUrl = Api.BaseUrl + url + Api.MoType;
    // 2. 关键：对目标URL进行 URI 编码（解决特殊字符（?/&）导致的请求异常）
    const encodedTargetUrl = encodeURIComponent(targetApiUrl);
    // 3. 拼接 AllOrigins 代理地址（格式固定：https://api.allorigins.win/get?url=编码后的目标URL）
    const proxyUrl =  import.meta.env.VITE_CORS_PROXY_URL + `?url=${encodedTargetUrl}`;
    return request.request('GET', proxyUrl, {params: param })
}