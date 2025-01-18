import axios, {AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

type TAxiosOption = {
    timeout: number;
    baseURL: string;
}
// https://raw.githubusercontent.com/Liwncy/Liwncy/main/data/webs/hotBans/sideMenu.json
const config: TAxiosOption = {
    timeout: 5000,
    baseURL: "https://raw.githubusercontent.com/Liwncy" + "/Liwncy" + "/main" + "/data"
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
                    return {
                        code: response.status,
                        data: response.data,
                        message: "成功"
                    };
                case 404:
                    return {
                        code: response.status,
                        data: response.data,
                        message: "数据资源未找到!"
                    };
                case 500:
                    return {
                        code: response.status,
                        data: response.data,
                        message: "服务器内部错误!"
                    };
                default:
                    break;
            }
        }, error => {
            return Promise.reject(error)
        })
    }

    /* GET 方法 */
    get<T>(url: string, suffix: string): Promise<any> {
        return this.service.get(url + "." + suffix + "?t=" + Math.random())
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