import { articles } from '$lib/articles/article_data';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ComponentType } from 'svelte';

// We have imported the `PageServerLoad` type from the relative `./$types` folder that
// is hidden in the generated `.svelte-kit` folder. Those generated types
// contain a `PageServerLoad` type with a `params` object that matches our route.
// You need to run the dev server or `svelte-kit sync` to generate them.
export const load: PageServerLoad = async ({ params }) => {
    //let Component: ComponentType;
    const { lang, maindir, subdir } = params;
    //Component = (await import('../../../../../../lib/articles/article_components/ja_signup_discord.svelte')).default;
    const article = articles.find((article) => article.lang === lang && article.maindir === maindir && article.subdir === subdir);

    if (!article) throw error(404);

    return {
        article,
        //Component,
    };
};
