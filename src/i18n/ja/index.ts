import type { Translation } from '../i18n-types';

const ja: Translation = {
  test: 'テストテキスト',

  // ヘッダー言語設定
  header: {
    now_lang: '日本語',
    lang_sel: {
      ja: {
        main_name: '日本語',
        sub_name: '日本語',
      },
      en: {
        main_name: 'English',
        sub_name: '英語',
      },
    },
  },

  // サイドメニュー
  side_menu: {
    entry: {
      title: '会員登録',
      contents: {
        acccreate: 'アカウント作成手順',
        acclink: 'アカウント連携手順',
      },
    },
    begin: {
      title: 'ゲームを始めるまで',
      contents: {
        start: 'ゲームの始め方',
        menu: 'メニュー画面',
        character: 'キャラクタークリエイション',
        adddelete: 'キャラクターの追加・削除',
        world: 'ワールドを選ぼう',
        tutorial: 'チュートリアル',
        multiple: 'ゲームの多重起動',
        quit: 'ゲームの終了',
      },
    },
    server: {
      title: 'Discord内各種機能',
      contents: {
        bounty: 'バウンティシステム',
        gacha: 'ガチャシステム',
        market: 'マーケットプレイス',
        command: 'スラッシュコマンド',
      },
    },
  },

  // 動的ルート対象外記事
  articles: {
    description:
      'Rain Server版モンスターハンターフロンティアの公式オンラインマニュアル',
    keywords:
      'モンスターハンター フロンティア 公式オンラインマニュアル, mhf, monster hunter frontier, オンラインゲーム',
    home: {
      head_title: 'MHF オンラインマニュアル',
      title: 'トップページ',
      news_title: '更新履歴',
      news_date: '2023年1月1日',
      news_ver: 'Ver.1.0',
      news_text:
        'オンラインマニュアルを開設いたしました。<br>旧公式オンラインマニュアルとの詳しい相違点及び更新内容は「詳細を見る」よりご確認いただけます。',
      news_more: '▶詳細を見る',
      featured_title: '注目のコンテンツ',
      featured_first: 'Rainサーバーは初めてですが、<br />まずは何をすれば？',
      featured_utahime:
        'メゼポルタへ迫る脅威を退けよ！<br />｢歌姫狩衛戦・真説｣の詳細はこちら',
      featured_lavi: '｢ラヴィエンテ 猛狂期｣に<br />挑みたい！',
      featured_tenrou:
        '天穿つ謎の巨塔を調査せよ！<br />｢天廊遠征録｣の詳細はこちら',
      featured_road: '終わりなき狩りの道<br />｢狩煉道｣とは？',
      featured_return:
        '久しぶりに復帰した<br />ハンターさんへ<br />｢復帰区｣をご紹介！',
    },
  },
};

export default ja;
