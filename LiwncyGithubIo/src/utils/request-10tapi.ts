import axios, {AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {Result} from "@/types/result";
import {encryptBase64, decryptBase64, encryptWithAes, decryptWithAes, encryptMd5} from "@/utils/crypto";
import errorCode from "@/utils/errorCode";
import {HttpStatus} from "@/enums/RespEnum";
import CryptoJS from "crypto-js";

type TAxiosOption = {
    timeout: number;
    baseURL: string;
}

export const globalHeaders = () => {
    return {
        Authorization: 'Bearer ' + getToken()
    };
};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

// 创建 axios 实例
const service = axios.create({
    baseURL: "",
    timeout: 80000
});

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        // 是否需要防止数据重复提交
        const isRepeatSubmit = config.headers?.repeatSubmit === false;
        // 是否需要加密
        const isEncrypt = config.headers?.isEncrypt === 'true';

        // get请求映射params参数
        if (config.method === 'get' && config.params) {
            let url = config.url + '?' + tansParams(config.params);
            url = url.slice(0, -1);
            config.params = {};
            config.url = url;
        }

        if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {

        }

        // FormData数据去请求头Content-Type
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (res: AxiosResponse) => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || HttpStatus.SUCCESS;
        // 获取错误信息
        const msg = errorCode[code] || res.data.msg || errorCode['default'];
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
    (error: any) => {
        return Promise.reject(error);
    }
);

// 导出 axios 实例
export default service;