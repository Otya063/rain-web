import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
    plugins: [sveltekit()],
    server: {
        host: true,
        fs: {
            allow: ['..'],
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
};

export default config;
