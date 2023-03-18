import "../../../../../../../chunks/index.js";
const discord = {
  ja: '<div class="table_contents" data-title="コンテンツ"><ul><li><a class="scroll" data-target="signup_discord">公式Discordにて会員登録</a></ul></div><div class="article_memo" data-title="COMMENT"><p class="inner_text">「モンスターハンター フロンティア オンライン」をプレイするためには、Rainサーバーへの会員登録が必要となります。登録画面にて設定した「ユーザー名」及び「パスワード」をゲームランチャーへ入力してログインすることで、ゲームをプレイすることができます。ここでは、公式Discord内での会員登録手順について説明します。</div><section id="signup_discord"><h2>公式Discordにて会員登録</h2><ul><li class="center_box"><p class="center_box_text">（1）「bot-commands」チャンネル内にあるインターフェイスより、Registerボタンを押します。<p class="center_box_img"><img src="/img/ja/articles/signup/discord/discord_1.png" alt="discord_1"><li class="center_box"><p class="center_box_text">（2）以下のようなウィンドウが表示されたら、「Username」及び「Password」欄にそれぞれ自身の設定したい値を入力して、送信ボタンを押してください。<br>送信が完了すると、「account successfully created」というメッセージが表示されます。<p class="center_box_img"><img src="/img/ja/articles/signup/discord/discord_2_1.png" alt="discord_2_1"><p class="center_box_img"><img src="/img/ja/articles/signup/discord/discord_2_2.png" alt="discord_2_2"><li class="center_box"><p class="center_box_text">（3）/card コマンド使用後、空のキャラクターが表示されます。<br>Useボタンを押して、使用キャラクターを確定させると、「successfully switch main character」というメッセージが表示されます。<br>これにて会員登録は完了となります。<p class="center_box_img"><img src="/img/ja/articles/signup/discord/discord_3_1.png" alt="discord_3_1"><p class="center_box_img"><img src="/img/ja/articles/signup/discord/discord_3_2.png" alt="discord_3_2"></ul></section>',
  en: '<div class="table_contents" data-title="Contents"><ul><li><a class="scroll" data-target="signup_discord">Sign Up in the Official Discord</a></ul></div><div class="article_memo" data-title="COMMENT"><p class="inner_text">In order to play "Monster Hunter Frontier Online," you need to sign up for the Rain Server first. You can play the game by entering the "Username" and "Password," which you set on the registration screen, into the game launcher and logging in. This section describes sign-up procedure in the official Discord.</div><section id="signup_discord"><h2>Sign Up in the Official Discord</h2><ul><li class="center_box"><p class="center_box_text">（1）On the interface in the "bot-commands" channel, press "Register" button.<p class="center_box_img"><img src="/img/en/articles/signup/discord/discord_1.png" alt="discord_1"><li class="center_box"><p class="center_box_text">（2）When the following window appears, enter the values you want to set in the "Username" and "Password" fields respectively, then press "Submit" button.<br>When submitting is completed, you can see the message "account successfully created."<p class="center_box_img"><img src="/img/en/articles/signup/discord/discord_2_1.png" alt="discord_2_1"><p class="center_box_img"><img src="/img/en/articles/signup/discord/discord_2_2.png" alt="discord_2_2"><li class="center_box"><p class="center_box_text">（3）After using /card, slash command, an empty character is displayed.<br>When you press "Use" button to confirm the character to be used, you can see the message "successfully switch main character."<br>Signing up for Rain is now completed.<p class="center_box_img"><img src="/img/en/articles/signup/discord/discord_3_1.png" alt="discord_3_1"><p class="center_box_img"><img src="/img/en/articles/signup/discord/discord_3_2.png" alt="discord_3_2"></ul></section>'
};
const start = {
  ja: "<p>これはゲームの始め方コンテンツです。</p>",
  en: '<p>This is a "Start" content.</p>'
};
const default_title_ja = "MHF オンラインマニュアル";
const default_title_en = "MHF Online Manual";
const articles = [
  {
    // 会員登録手順（Discord）
    lang: "ja",
    maindir: "signup",
    subdir: "discord",
    head_title: `会員登録手順（Discord）| ${default_title_ja}`,
    title: "会員登録手順（Discord）",
    content: discord.ja
  },
  {
    // Sign-up Procedure (Discord)
    lang: "en",
    maindir: "signup",
    subdir: "discord",
    head_title: `Sign-up Procedure (Discord) | ${default_title_en}`,
    title: "Sign-up Procedure (Discord)",
    content: discord.en
  },
  /*     {
          // 会員登録手順（メンバーサイト）
          lang: 'ja',
          maindir: 'signup',
          subdir: 'membersite',
          head_title: `会員登録手順（メンバーサイト）| ${default_title_ja}`,
          title: '会員登録手順（メンバーサイト）',
          content: membersite.ja,
      }, */
  /*     {
          // Sign-up Procedure (Member Site)
          lang: 'en',
          maindir: 'signup',
          subdir: 'membersite',
          head_title: `Sign-up Procedure (Member Site) | ${default_title_en}`,
          title: 'Sign-up Procedure (Member Site)',
          content: membersite.en,
      }, */
  {
    // ゲームの始め方（日本語）
    lang: "ja",
    maindir: "begin",
    subdir: "start",
    head_title: `ゲームの始め方 | ${default_title_ja}`,
    title: "ゲームの始め方",
    content: start.ja
  },
  {
    // How to Start the Game
    lang: "en",
    maindir: "begin",
    subdir: "start",
    head_title: `How to Start the Game | ${default_title_en}`,
    title: "How to Start the Game",
    content: start.en
  }
];
const load = async ({ params }) => {
  const article = articles.find((article2) => article2.lang === params.lang && article2.maindir === params.maindir && article2.subdir === params.subdir);
  return {
    article
  };
};
export {
  load
};
