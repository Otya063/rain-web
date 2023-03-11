import adapter from '@sveltejs/adapter-cloudflare-workers';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter(),
        alias: {
            $lib: 'src/lib',
            $i18n: 'src/i18n',
            $ts: 'static/js',
            $scss: 'static/sass',
        },
    },
};

export default config;
