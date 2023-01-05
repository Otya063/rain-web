<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/language_check.php"
?>

<!DOCTYPE html>
<html lang="<?= $lang; ?>">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="robots" content="noindex,nofollow">
    <!-- info -->
    <title><?= $e403_title . "｜Rain Server"; ?></title>
    <!-- favicon -->
    <link rel="icon" type="image/png" href="/manual/assets/img/common/rain_tempologo.png">
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <link rel="apple-touch-icon-precomposed" href="/manual/assets/img/common/rain_tempologo.png">
    <!-- css -->
    <link href="/manual/assets/css/style_errors.css" rel="stylesheet" type="text/css">
    <!-- font -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Sans:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap');
    </style>
</head>

<body>
    <!-- 日本語 -->
    <div class="wrapper">
        <header>
            <figure class="header_logo">
                <a onclick="location.href='/manual/';">
                    <img src="/manual/assets/img/common/rain_tempologo.png" alt="header_logo">
                    <img src="/manual/assets/img/common/rain_textlogo.webp" alt="header_logo">
                </a>
            </figure>
        </header>
        <main class="error_page">
            <section class="main">
                <figure class="kokecat">
                    <img src="/manual/assets/img/common/koke.jpg" width="239" height="190" alt="koke">
                </figure>
                <h1>アクセス権限がありません。</h1>
                <p>
                    指定されたURLまたはディレクトリへのアクセスが禁止されているため、表示できません。<br>更新履歴をご確認のうえ、本ページの存在が確認できる場合は、管理者までご連絡ください。
                </p>
            </section>
        </main>
        <footer>
            <div class="footer_bar_contents">
                <div class="footer_logo">
                    <figure>
                        <img src="/manual/assets/img/common/rain_footer_tempologo.jpg" alt="rain_tempologo">
                    </figure>
                </div>
                <div class="footer_text">
                    <p>
                        Rainサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。<br>当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生しません。
                    </p>
                </div>
            </div>
        </footer>
    </div>
</body>

</html>