/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DIRECT_URL: string;
    readonly VITE_DATABASE_URL: string;
    readonly VITE_ALLOW_METHODS: string;
    readonly VITE_ALLOW_HEADERS: string;
    readonly VITE_R2_ACCESS_KEY: string;
    readonly VITE_R2_SECRET_KEY: string;
    readonly VITE_R2_ACCOUNT_ID: string;
    readonly VITE_R2_BNR_BUCKETNAME: string;
    readonly VITE_R2_BNR_UNIQUE_URL: string;
    readonly VITE_MAIN_DOMAIN: string;
    readonly VITE_AUTH_DOMAIN: string;
    readonly VITE_ADMIN_CREDENTIALS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
