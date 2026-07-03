import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'
import container from 'markdown-it-container'
import AutoImport from 'unplugin-auto-import/vite'
import Components from '@layui/unplugin-vue-components/vite'
import { LayuiVueResolver } from '@layui/unplugin-vue-components/resolvers'
import { resolve } from 'path'
import highlight from './plugin/highlight'
import preWrapper from './plugin/pre-wrapper'
import demo from './plugin/create-demo'
import createAnchor from './plugin/create-anchor'
import createDescribe from './plugin/create-describe'
import createQuote from './plugin/create-quote'
import createTable from './plugin/create-table'
import createTitle from './plugin/create-title'

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
        highlight,
      },
      markdownItSetup(md) {
        md.use(preWrapper)
          .use(container, 'demo', demo)
          .use(...createTable('table'))
          .use(...createQuote('quote'))
          .use(...createTitle('title'))
          .use(...createDescribe('describe'))
          .use(...createAnchor('anchor'))
      },
    }),
    AutoImport({
      resolvers: [LayuiVueResolver()],
    }),
    Components({
      resolvers: [
        LayuiVueResolver({
          resolveIcons: false,
        }),
      ],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5678,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/data': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/sixty-api': {
        target: 'https://60s.viki.moe',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sixty-api/, ''),
      },
      '/peark-api': {
        target: 'https://api.pearktrue.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/peark-api/, ''),
      },
      '/cf-worker': {
        target: 'https://lwcfworker.dpdns.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cf-worker/, ''),
      },
      '/yujn-api': {
        target: 'https://api.yujn.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yujn-api/, ''),
      },
    },
  },
})
