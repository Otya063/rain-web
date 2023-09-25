/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DATABASE_URL: string;
    readonly VITE_ALLOW_ORIGIN: string;
    readonly VITE_ALLOW_METHODS: string;
    readonly VITE_ALLOW_HEADERS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
