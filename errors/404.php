<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/language_check.php"
?>

  <?php
  if (isset($_COOKIE["lang"])) {
    if ($_COOKIE["lang"] === "ja") {
      /* 日本語 */
      $lang = "ja";
      $e404_title = "お探しのページが存在しません。";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/ja/404_contents.php";
    } else {
      $lang = "en";
      $e404_title = "404 Not Found";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/404_contents.php";
    }
  } else {
    if ($result === 'ja') {
      $lang = "ja";
      $e404_title = "お探しのページが存在しません。";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/ja/404_contents.php";
    } else {
      $lang = "en";
      $e404_title = "404 Not Found";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/404_contents.php";
    }
  }
