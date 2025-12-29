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
        },
    },
});