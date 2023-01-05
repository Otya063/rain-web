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
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
    </style>
</head>

<body>
    <!-- 英語 -->
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
                <h1>403 Forbidden</h1>
                <p>
                    You don't have the permission to access this directory or page.<br>Please check the update history and contact administrators if you can see the description of this page.
            </section>
        </main>
    </div>
    <footer>
        <div class="footer_bar_contents">
            <div class="footer_logo">
                <figure>
                    <img src="/manual/assets/img/common/rain_footer_tempologo.jpg" alt="rain_tempologo">
                </figure>
            </div>
            <div class="footer_text">
                <p>
                    Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries.<br>This project is supported by a lot of volunteers, and no revenue of any sort is generated.
                </p>
            </div>
        </div>
    </footer>
</body>

</html>