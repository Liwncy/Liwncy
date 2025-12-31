import {defineConfig} from "vite";
// import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "@layui/unplugin-vue-components/vite";
import {LayuiVueResolver} from '@layui/unplugin-vue-components/resolvers'
import {resolve} from "path";
import plugins from "./plugin/all-plugins";

const excludeComponents = ['LightIcon', 'DarkIcon']

export default defineConfig({
    // 打包相对路径
    base: '/',
    resolve: {
        alias: [
            {
                find: '@',
                replacement: resolve(__dirname, './src')
            },
            {
                find: '~',
                replacement: process.cwd()
            }
        ]
    },
    plugins: [
        AutoImport({
            resolvers: [
                LayuiVueResolver(),
            ],
        }),
        Components({
            resolvers: [
                LayuiVueResolver({
                    resolveIcons: true,
                    exclude: excludeComponents
                }),
            ],
        }),
        ...plugins,
        // vue(),
    ],
    server: {
        host: "0.0.0.0",
        port: 5678,
        proxy: {
            "/10tapi": {
                target: "http://liwncy.tttttttttt.top",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/10tapi/, ""),
            },
            '/api-yujn': {
                // 2. 目标接口地址（去掉具体接口路径，保留域名+根路径）
                target: 'https://api.yujn.cn',
                // 3. 开启跨域转换（关键配置）
                changeOrigin: true,
                // 4. 路径重写（将 /api-proxy 替换为空，拼接真实接口路径）
                rewrite: (path) => path.replace(/^\/api-yujn/, ''),
                // 可选：忽略HTTPS证书错误（若目标接口是自签名证书）
                // secure: false
            }
        },
    },
});