/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DATABASE_URL: string;
    readonly VITE_ORIGIN: string;
    readonly VITE_METHODS: string[];
    readonly VITE_HEADERS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
