interface Articles {
	maindir: string;
	subdir: string;
	title: string;
	content: string;
}

export const articles: Articles[] = [
	{
		maindir: 'entry',
		subdir: 'link1',
		title: 'Link1 Title',
		content:
			'<p>This is a "Link1" content.</p><section class="news"><h2 class="news_title">text</h2><div class="news_content"><ul class="content_list"><li class="news_date"><span>text</span><span>text</span></li><li class="news_text">text</li></ul><a class="news_more">text</a></div></section>'
	},

	{
		maindir: 'entry',
		subdir: 'link2',
		title: 'Link2 Title',
		content: '<p>This is a "Link2" content.</p>'
	}
];
