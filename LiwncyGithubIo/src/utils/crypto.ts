// @ts-ignore
import CryptoJS from 'crypto-js';

/**
 * 随机生成32位的字符串
 * @returns {string}
 */
export const generateRandomString = (num ?: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < (num || 32); i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/**
 * 随机生成aes 密钥
 * @returns {string}
 */
export const generateAesKey = () => {
    return CryptoJS.enc.Utf8.parse(generateRandomString());
};

/**
 * 加密Sha256
 * @returns {string}
 */
export const encryptSha256 = (str: CryptoJS.lib.WordArray) => {
    return CryptoJS.SHA256(str).toString();
};

/**
 * 加密Md5
 * @returns {string}
 */
export const encryptMd5 = (str: CryptoJS.lib.WordArray) => {
    return CryptoJS.MD5(str).toString().substring(8, 24).toLowerCase();
};

/**
 * 加密base64
 * @returns {string}
 */
export const encryptBase64 = (str: CryptoJS.lib.WordArray) => {
    return CryptoJS.enc.Base64.stringify(str);
};

/**
 * 解密base64
 */
export const decryptBase64 = (str: string) => {
    return CryptoJS.enc.Base64.parse(str);
};

//base64加密
function base64_encode(code){
    var str = CryptoJS.enc.Utf8.parse(code);
    return CryptoJS.enc.Base64.stringify(str);
}
//base64解密
function base64_decode(code){
    var words = CryptoJS.enc.Base64.parse(code);
    return words.toString(CryptoJS.enc.Utf8)
}

/**
 * 使用密钥对数据进行加密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export const encryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray) => {
    const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
};

/**
 * 使用密钥对数据进行解密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export const decryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray) => {
    const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};
