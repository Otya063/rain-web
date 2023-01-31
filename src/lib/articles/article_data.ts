interface Articles {
  lang: string;
  maindir: string;
  subdir: string;
  title: string;
  content: string;
}

export const articles: Articles[] = [
  // アカウント作成手順
  {
    lang: 'ja',
    maindir: 'entry',
    subdir: 'acccreate',
    title: 'アカウント作成手順',
    content:
      '<p>これはアカウント作成手順コンテンツです。</p><section class="news"><h2 class="news_title">text</h2><div class="news_content"><ul class="content_list"><li class="news_date"><span>text</span><span>text</span></li><li class="news_text">text</li></ul><a class="news_more">text</a></div></section>',
  },
  {
    lang: 'en',
    maindir: 'entry',
    subdir: 'acccreate',
    title: 'Acccreate',
    content:
      '<p>This is a "Acccreate" content.</p><section class="news"><h2 class="news_title">text</h2><div class="news_content"><ul class="content_list"><li class="news_date"><span>text</span><span>text</span></li><li class="news_text">text</li></ul><a class="news_more">text</a></div></section>',
  },

  // アカウント連携手順
  {
    lang: 'ja',
    maindir: 'entry',
    subdir: 'acclink',
    title: 'アカウント連携手順',
    content: '<p>これはアカウント連携手順コンテンツです。</p>',
  },
  {
    lang: 'en',
    maindir: 'entry',
    subdir: 'acclink',
    title: 'Acclink',
    content: '<p>This is a "Acclink" content.</p>',
  },
];
