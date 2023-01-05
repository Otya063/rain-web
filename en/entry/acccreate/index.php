<?php include $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/title.php" ?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- info -->
    <title><?= $titleTxt; ?></title>
    <meta name="description" content="Rain Server版モンスターハンターフロンティアの公式オンラインマニュアル">
    <meta name="keywords" content="monster hunter frontier, official online manual, mhf, online game">
    <!-- favicon -->
    <link rel="icon" type="image/png" href="/manual/assets/img/common/favicon.ico">
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="format-detection" content="telephone=no">
    <link rel="apple-touch-icon-precomposed" href="/manual/assets/img/common/favicon_sp.png">
    <!-- alternate -->
    <!-- <link rel="alternate" href="http://.com/en/" hreflang="en">
  <link rel="alternate" href="http://.com/ja/" hreflang="ja"> -->
    <!-- css -->
    <link href="/manual/assets/css/style.css" rel="stylesheet" type="text/css">
    <!-- font -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@400;700;900&display=swap');
    </style>

</head>

<body>
    <div class="wrapper">
        <header>
            <!-- header -->
            <?php include $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/header.php" ?>
        </header>

        <main class="main_inner">
            <nav class="side_menu">
                <!-- menu -->
                <?php include $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/menu.php" ?>
            </nav>

            <article class="contents">
                <!-- article -->
                <?php include("./acccreate.php") ?>
            </article>
        </main>

        <div class="pagetop">▲</div>

        <footer>
            <!-- footer -->
            <?php include $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/footer.php" ?>
        </footer>
    </div>
    <!-- js -->
    <script src="/manual/assets/js/jquery-3.6.1.min.js"></script>
    <script src="/manual/assets/js/import.js"></script>
    <script src="/manual/assets/js/main.js"></script>
    <script src="/manual/assets/js/js.cookie.min.js"></script>
</body>

</html>