import axios, { AxiosResponse } from 'axios';

const PREFIX = import.meta.env.VITE_CORS_PROXY_URL + "?url=https://file.upfile.live/";
const URL = import.meta.env.VITE_CORS_PROXY_URL + "?url=https://upfile.live/api/file/getUploadLink/";

interface GetUploadLinkResponse {
  data: {
    upload_url: string;
    file_key: string;
  };
}

/**
 * 浏览器环境文件上传
 * @param file HTML5 File对象
 * @returns 上传成功返回文件访问URL，失败返回null
 */
export async function uploadFile(file: File): Promise<string | null> {
  try {
    // 1. 获取上传链接
    const postData = {
      vipCode: "",
      file_name: file.name
    };

    const response: AxiosResponse<GetUploadLinkResponse> = await axios.post(URL, postData);
    const obj = response.data.data;
    const uploadUrl = obj.upload_url;
    const fileKey = obj.file_key;

    // 2. 上传文件
    const uploadResponse: AxiosResponse = await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      }
    });

    // 3. 处理响应
    if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
      const finalUrl = PREFIX + fileKey;
      console.log(`文件上传成功, url: ${finalUrl}`);
      return finalUrl;
    } else {
      console.error(`文件上传失败, error: ${uploadResponse.data}`);
      return null;
    }
  } catch (error) {
    console.error(`文件上传异常: ${(error as Error).message}`, error);
    return null;
  }
}

// 示例调用（配合<input type="file">）
// const fileInput = document.querySelector('input[type="file"]');
// fileInput?.addEventListener('change', async (e) => {
//   const file = (e.target as HTMLInputElement).files?.[0];
//   if (file) {
//     const url = await uploadFile(file);
//     console.log('上传结果:', url);
//   }
// });