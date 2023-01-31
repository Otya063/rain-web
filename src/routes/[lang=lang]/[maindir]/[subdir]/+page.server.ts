import { articles } from '$lib/articles/article_data';
import type { PageServerLoad } from './$types';

// We have imported the `PageServerLoad` type from the relative `./$types` folder that
// is hidden in the generated `.svelte-kit` folder. Those generated types
// contain a `PageServerLoad` type with a `params` object that matches our route.
// You need to run the dev server or `svelte-kit sync` to generate them.
export const load: PageServerLoad = async ({ params }) => {
  const article = articles.find(
    (article) =>
      article.lang === params.lang &&
      article.maindir === params.maindir &&
      article.subdir === params.subdir
  );

  return {
    article,
  };
};
