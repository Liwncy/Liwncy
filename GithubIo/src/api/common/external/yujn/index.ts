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
    // 判断url是否包含type=
    let isJsonRequest = !url.includes('type=');
    // 1. 目标跨域接口地址（确保可直接访问，先在浏览器地址栏测试）
    const targetApiUrl = Api.BaseUrl + url + (isJsonRequest ? Api.MoType : '');
    // 2. 关键：对目标URL进行 URI 编码（解决特殊字符（?/&）导致的请求异常）
    const encodedTargetUrl = encodeURIComponent(targetApiUrl);
    // 3. 拼接 AllOrigins 代理地址（格式固定：https://api.allorigins.win/get?url=编码后的目标URL）
    const proxyUrl = import.meta.env.VITE_CORS_PROXY_URL + `?url=${encodedTargetUrl}`;
    // 4. 发送请求 请求文件流直接返回跨域url
    if (!isJsonRequest) {
        return new Promise((resolve, reject) => {
            resolve({code: 200, url: proxyUrl + '&time=' + new Date().getTime()})
        });
    }
    return request.request('GET', proxyUrl, {params: param})
}