import axios, {AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {Result} from "@/types/result";
import {decryptBase64, decryptWithAes, encryptBase64, encryptMd5} from "@/utils/crypto";
import errorCode from "@/utils/errorCode";
import {HttpStatus} from "@/enums/RespEnum";
import CryptoJS from "crypto-js";

// 扩展 axios 配置类型，添加自定义属性
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    suffixs?: string[];
    isEncrypt?: boolean;
    encryptKey?: string;
}

type TAxiosOption = {
    timeout: number;
    baseURL: string;
}

const config: TAxiosOption = {
    timeout: 5000,
    baseURL: "https://raw.githubusercontent.com/Liwncy" + "/Liwncy" + "/main" + "/data"
}

class Http {
    service;

    constructor(config: TAxiosOption) {
        this.service = axios.create(config)

        /* 请求拦截 */
        this.service.interceptors.request.use((config: CustomAxiosRequestConfig) => {
            let url_suffix = config.suffixs ? ("index_" + config.suffixs.join("_")) : "index";
            if (config.isEncrypt === true) {
                // 请求路径 Md5 密钥
                url_suffix = encryptMd5(url_suffix);
                config.encryptKey = encryptBase64(CryptoJS.enc.Utf8.parse(url_suffix));
            }
            let t = Date.now().toString().substring(0, 7);
            config.url = config.url + "/" + url_suffix + "?t=" + t;
            return config
        }, error => {
            return Promise.reject(error);
        })

        /* 响应拦截 */
        this.service.interceptors.response.use(
            (res: AxiosResponse<any, CustomAxiosRequestConfig>) => {
                console.log("res.config", res.config)
                const customAxiosRequestConfig = res.config as CustomAxiosRequestConfig;
                if (customAxiosRequestConfig.isEncrypt === true) {
                    // 加密的 AES 秘钥
                    const keyStr = customAxiosRequestConfig.encryptKey;
                    // 解密
                    if (keyStr != null && keyStr != '') {
                        const data = res.data;
                        // base64 解码 得到请求头的 AES 秘钥
                        const aesKey = decryptBase64(keyStr).toString(CryptoJS.enc.Utf8);
                        // aesKey 解码 data
                        const decryptData = decryptWithAes(decryptWithAes(data, aesKey).replaceAll(aesKey, ''), aesKey);
                        // 将结果 (得到的是 JSON 字符串) 转为 JSON
                        res.data = JSON.parse(decryptData);
                    }
                }
                // 未设置状态码则默认成功状态
                const code = res.status || 200;
                // 获取错误信息
                const msg = errorCode[code] || res.data || errorCode['default'];
                // 二进制数据则直接返回
                if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
                    return res.data;
                }
                if (code === 401) {
                    return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
                } else if (code === HttpStatus.SERVER_ERROR) {
                    return Promise.reject(new Error(msg));
                } else if (code === HttpStatus.WARN) {
                    return Promise.reject(new Error(msg));
                } else if (code !== HttpStatus.SUCCESS) {
                    return Promise.reject('error');
                } else {
                    let result: Result = {
                        code: 200,
                        msg: "操作成功",
                        data: res.data,
                        success: true
                    }
                    return Promise.resolve(result);
                }
            },
            error => {
                return Promise.reject(error)
            }
        )
    }

    /* 获取Github数据方法 */
    get<T>(url: string, config = {}): Promise<any> {
        return this.service.get(url, {...config});
    }

    /* GET 方法 */
    getJm<T>(url: string, suffix?: string): Promise<any> {
        return this.service.get(url + (suffix ? ("." + suffix) : "") + "?t=" + Date.now().toString().substring(0, 7))
    }
}

export default new Http(config)
