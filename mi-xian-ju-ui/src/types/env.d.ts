/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_PUBLIC_PATH: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_DATA_BASE_URL: string
  readonly VITE_CORS_PROXY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
