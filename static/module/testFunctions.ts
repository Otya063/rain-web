export const loadArticle = (path1: string = '', path2: string = '') => {
	event!.stopPropagation();
	let href_path = `${path1}/${path2}`;
	location.pathname = href_path;
};
