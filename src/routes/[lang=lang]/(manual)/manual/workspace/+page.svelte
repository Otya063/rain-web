<script lang="ts">
    import Menu from '$lib/common/Menu.svelte';
</script>

<svelte:head>
    <title>Workspace</title>
</svelte:head>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu slidable_on_mobile">
            <!-- side_menu -->
            <Menu />
        </nav>

        <article class="contents">
            <!-- article -->
            <h1>会員登録（Discord）</h1>
            <div class="table_contents" data-title="コンテンツ">
                <ul>
                    <li><a class="scroll" data-target="command_create">Rainサーバー公式Discordにて作成</a></li>
                </ul>
            </div>
            <div class="article_memo" data-title="COMMENT">
                <p class="inner_text">
                    まずゲームをプレイするためには、アカウントを手動で作成する必要があります。ランチャーにて入力する「ユーザー名」及び「パスワード」を入力してログインすれば自動的に作成されるサーバーもありますが、Rainサーバーではチート使用者及び身元不明の不審なプレイヤーの流入抑制を理由として、自動作成機能は無効となっています。
                </p>
            </div>
            <section id="command_create">
                <h2>Rainサーバー公式Discordにて作成</h2>
                <ul>
                    <li class="itemset">
                        <p>
                            (1) /create入力後、スペース入力又はコマンド一覧より選択することで「username」及び「password」の入力欄が出現します。<br
                            />入力する値は任意で構いませんが、必ず忘れないようにしましょう。
                        </p>
                        <p><img src="/img/ja/articles/entry/acccreate/acccreate_1.png" alt="" /></p>
                    </li>
                    <li class="itemset">
                        <p>(2) 入力後、以下のようなメッセージが表示されれば仮作成は完了です。</p>
                        <p><img src="/img/ja/articles/entry/acccreate/acccreate_2.png" alt="" /></p>
                    </li>
                    <li class="itemset">
                        <p>(3) ランチャーを起動後、先程入力したユーザー名及びパスワードを入力し、ログインを押します。</p>
                        <p><img src="/img/ja/articles/entry/acccreate/acccreate_3.png" alt="" /></p>
                    </li>
                    <li class="itemset">
                        <p>
                            (4) 何も情報が表示されませんが、これで正常です。<br />［キャラクター追加権の購入］＞［今すぐ購入］＞［再ログイン］と進むと、<span style="color:#00f">狩人申請可能</span
                            >が表示されます。
                        </p>
                        <p><img src="/img/ja/articles/entry/acccreate/acccreate_4_1.png" alt="" /></p>
                        <p><img src="/img/ja/articles/entry/acccreate/acccreate_4_2.png" alt="" /></p>
                    </li>
                    <li class="itemset">
                        <p>(5) ゲーム起動後は表示される指示に従って、キャラクタークリエイションを進めてください。</p>
                        <p><img src="/img/ja/articles/entry/acccreate/acccreate_5.png" alt="" /></p>
                    </li>
                    <li class="itemset">
                        <p>(6) 無事にメゼポルタ広場へ移動出来れば、アカウント作成完了です。</p>
                        <p><img src="/img/ja/articles/entry/acccreate/acccreate_6.png" alt="" /></p>
                    </li>
                </ul>
            </section>
        </article>
    </main>
</div>
