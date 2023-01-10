<!-- <form class="search" action="">
  <input type="search" name="keywords" placeholder="検索" value="">
  <button></button>
</form> -->
<ul class="categories">
  <li id="toppage" class="category">
    <button class="category_title" type="button"><span class="mark"></span>トップページ</button>
    <ul class="sub_categories">
      <dl class="sub_categories_list">
        <li id="home" class="sub_category" onclick="loadArticle()">トップページ</li>
        <li id="news" class="sub_category" onclick="loadArticle('news/')">更新履歴</li>
      </dl>
    </ul>
  </li>
  <li id="entry" class="category">
    <button class="category_title" type="button"><span class="mark"></span>会員登録</button>
    <ul class="sub_categories">
      <dl class="sub_categories_list">
        <li id="acccreate" class="sub_category" onclick="loadArticle('entry/', 'acccreate/')">アカウント作成手順</li>
        <li id="acclink" class="sub_category" onclick="loadArticle('entry/', 'acclink/')">Discordアカウント連携</li>
      </dl>
    </ul>
  </li>
  <li class="category">
    <button class="category_title" type="button"><span class="mark"></span>ゲームを始めるまで</button>
    <ul class="sub_categories">
      <dl class="sub_categories_list">
        <li class="sub_category">ゲームの始め方</li>
        <li class="sub_category">メニュー画面</li>
        <li class="sub_category">キャラクタークリエイション</li>
        <li class="sub_category">キャラクターの追加・削除</li>
        <li class="sub_category">ワールドを選ぼう</li>
        <li class="sub_category">チュートリアル</li>
        <li class="sub_category">ゲームの多重起動</li>
        <li class="sub_category">ゲームの終了</li>
      </dl>
    </ul>
  </li>
</ul>