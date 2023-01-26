import { articles } from './article_data';

export const load = async ({ params }) => {
	const article = articles.find(
		(article) => article.subdir === params.subdir && article.maindir === params.maindir
	);

	return {
		article
	};
};
