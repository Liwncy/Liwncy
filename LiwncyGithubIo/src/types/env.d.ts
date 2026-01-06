declare module '*.vue' {
    import {DefineComponent} from 'vue';
    const Component: DefineComponent<{}, {}, any>;
    export default Component;
}

// 环境变量
interface ImportMetaEnv {
    VITE_APP_TITLE: string;
    VITE_PORT: number;
    VITE_PUBLIC_PATH: string;
    VITE_APP_NAME: string;
    VITE_API_URL: string;
    VITE_API_A_URL: string;
    VITE_API_B_URL: string;
    VITE_API_C_URL: string;
    VITE_API_D_URL: string;
    VITE_CORS_PROXY_URL: string;
    VITE_CLIENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    // readonly glob: any;
}
