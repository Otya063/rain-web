import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: vercel(),
    alias: {
      $i18n: 'src/i18n',
      $lib: 'src/lib',
      $lang: 'src/lang',
    },
  },
};

export default config;
