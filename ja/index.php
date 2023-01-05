<?php include $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/ja/info.php" ?>

<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!-- info -->
  <title><?= $titleTxt; ?></title>
  <meta name="description" content="<?= $descTxt; ?>">
  <meta name="keywords" content="モンスターハンター フロンティア 公式オンラインマニュアル, mhf, monster hunter frontier, オンラインゲーム">
  <!-- favicon -->
  <link rel="icon" type="image/png" href="<?= $img_path . "common/favicon.ico"; ?>">
  <!-- mobile -->
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="format-detection" content="telephone=no">
  <link rel="apple-touch-icon-precomposed" href="<?= $img_path . "common/favicon_sp.png"; ?>">
  <!-- alternate -->
  <!-- <link rel="alternate" href="http://.com/en/" hreflang="en">
  <link rel="alternate" href="http://.com/ja/" hreflang="ja"> -->
  <!-- css -->
  <link href="<?= $css_path . "style.css"; ?>" rel="stylesheet" type="text/css">
  <!-- font -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Sans:wght@400;700;900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@400;700;900&display=swap');
  </style>

</head>

<body>
  <div class="wrapper">
    <header>
      <!-- header -->
      <?php include $_SERVER['DOCUMENT_ROOT'] . $inc_path . "ja/header.php" ?>
    </header>

    <div class="top_images">
      <img class="bg" src="" alt="トップ画像">
    </div>

    <main class="main_inner">
      <nav class="side_menu">
        <!-- menu -->
        <?php include $_SERVER['DOCUMENT_ROOT'] . $inc_path . "ja/menu.php" ?>
      </nav>

      <article class="contents">
        <!-- article -->
        <?php include "./top.php" ?>
      </article>
    </main>

    <div class="pagetop">▲</div>

    <footer>
      <!-- footer -->
      <?php include $_SERVER['DOCUMENT_ROOT'] . $inc_path . "ja/footer.php" ?>
    </footer>
  </div>
  <!-- js -->
  <script src="<?= $js_path . "jquery-3.6.1.min.js"; ?>"></script>
  <script src="<?= $js_path . "import.js"; ?>"></script>
  <script src="<?= $js_path . "main.js"; ?>"></script>
  <script src="<?= $js_path . "js.cookie.min.js"; ?>"></script>
</body>

</html>