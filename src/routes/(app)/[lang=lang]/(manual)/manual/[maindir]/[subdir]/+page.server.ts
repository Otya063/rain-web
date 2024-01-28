import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { articles } from '$lib/manual/articles/articleData';

export const load: PageServerLoad = async ({ params }) => {
    const { lang, maindir, subdir } = params;
    const article = articles.find((article) => article.lang === lang && article.maindir === maindir && article.subdir === subdir);

    if (!article) {
        throw error(404);
    }

    return { article };
};
