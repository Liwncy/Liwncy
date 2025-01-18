import axios, {AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

type TAxiosOption = {
    timeout: number;
    baseURL: string;
}
// https://raw.githubusercontent.com/Liwncy/Liwncy.github.io/main/mockData/webs/index.json
const config: TAxiosOption = {
    timeout: 5000,
    baseURL: "https://raw.githubusercontent.com/Liwncy" + "/data"
}

class Http {
    service;

    constructor(config: TAxiosOption) {
        this.service = axios.create(config)

        /* 请求拦截 */
        this.service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            return config
        }, error => {
            return Promise.reject(error);
        })

        /* 响应拦截 */
        this.service.interceptors.response.use((response: AxiosResponse<any>) => {
            switch (response.status) {
                case 200:
                    return response.data;
                case 404:
                    return response.data;
                case 500:
                    return response.data;
                case 99998:
                    layer.confirm(
                        '会话超时, 请重新登录',
                        {
                            icon: 2, yes: function () {
                                router.push('/admin/login');
                                layer.closeAll()
                            }
                        });
                    return response.data;
                default:
                    break;
            }
        }, error => {
            return Promise.reject(error)
        })
    }

    /* GET 方法 */
    get<T>(url: string, suffix: string): Promise<any> {
        return this.service.get(url + "." + suffix)
    }

    // /* POST 方法 */
    // post<T>(url: string, params?: object, _object = {}): Promise<any> {
    //     return this.service.post(url, params, _object)
    // }
    // /* PUT 方法 */
    // put<T>(url: string, params?: object, _object = {}): Promise<any> {
    //     return this.service.put(url, params, _object)
    // }
    // /* DELETE 方法 */
    // delete<T>(url: string, params?: any, _object = {}): Promise<any> {
    //     return this.service.delete(url, { params, ..._object })
    // }
}

export default new Http(config)