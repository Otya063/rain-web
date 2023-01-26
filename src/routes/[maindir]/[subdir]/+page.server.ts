import { articles } from './article_data';

export const load = async ({ params }) => {
	const article = articles.find(
		(article) => article.maindir === params.maindir && article.subdir === params.subdir
	);

	return {
		article
	};
};

export const prerender = true;
