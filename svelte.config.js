import adapter from '@sveltejs/adapter-cloudflare-workers';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter(),
        alias: {
            $i18n: 'src/i18n',
            $scss: 'static/sass',
            $utils: 'src/lib/utils',
            $types: 'src/lib/types',
            $lib: 'src/lib',
        },
    },
    compilerOptions: {
        preserveComments: true,
    },
};

export default config;
