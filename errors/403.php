<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/language_check.php"
?>

  <?php
  if (isset($_COOKIE["lang"])) {
    if ($_COOKIE["lang"] === "ja") {
      /* 日本語 */
      $lang = "ja";
      $e403_title = "アクセス権限がありません。";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/ja/403_contents.php";
    } else {
      $lang = "en";
      $e403_title = "403 Forbidden";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/403_contents.php";
    }
  } else {
    if ($result === 'ja') {
      $lang = "ja";
      $e403_title = "アクセス権限がありません。";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/ja/403_contents.php";
    } else {
      $lang = "en";
      $e403_title = "403 Forbidden";
      require $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/en/403_contents.php";
    }
  }
