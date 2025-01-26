import request from '@/utils/request';

//获取WeTab登录信息
export const getWeTabLoginInfo = function () {
    return request.get('common/secret/c0283f599b3f9818', {
        isEncrypt: true
    })
}