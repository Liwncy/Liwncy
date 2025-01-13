import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "@layui/unplugin-vue-components/vite";
import { LayuiVueResolver } from '@layui/unplugin-vue-components/resolvers'
import { resolve } from "path";
import plugins from "./src/plugin/all-plugins";

const excludeComponents = ['LightIcon','DarkIcon']

export default defineConfig({
  // 打包相对路径
  base: '/',
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src')
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
});