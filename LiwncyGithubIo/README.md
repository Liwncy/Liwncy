### 🌈 项目概述

* 前端
* 自己玩玩
* 哈哈哈

### 开始使用

```

切换环境

nvm install 16.0.0

nvm use 16.0.0

安装依赖

npm install -g pnpm

pnpm install

启动项目

npm run dev

打包项目

npm run build

```

## 预览截图

## 必要信息

### 加密过程(别自己忘啦)
* 接口api请求:MD5(方法名+"_"+admin_pwd)
* 参数请求路径 Md5 加密
* 请求携带(解密用) 加密请求路径Base64
* 数据加密 Base64(Base64(数据)和<参数请求路径 Md5 加密>找地方随便扔)