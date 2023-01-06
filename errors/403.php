<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/manual/assets/inc/language_check.php"
?>

  <?php
  if (isset($_COOKIE["lang"])) {
    if ($_COOKIE["lang"] === "ja") {
      // クッキー設定日本語
      $lang = "ja";
      $e403_title = "アクセス権限がありません。 | Rain Server";
      $e403_h1 = "アクセス権限がありません。";
      $e403_p = "指定されたURLまたはディレクトリへのアクセスが禁止されているため、表示できません。<br>更新履歴をご確認のうえ、本ページの存在が確認できる場合は、管理者までご連絡ください。";
      $e403_footer_p = "Rainサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。<br>当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生しません。";
      $e403_font = "<style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Sans:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap');
    </style>";
      require_once "./403_content.php";
    } else {
      // クッキー設定英語
      $lang = "en";
      $e403_title = "403 Forbidden | Rain Server";
      $e403_h1 = "403 Forbidden";
      $e403_p = "You don't have the permission to access this directory or page.<br>Please check the update history and contact administrators if you can see the description of this page.";
      $e403_footer_p = "Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries.<br>This project is supported by a lot of volunteers, and no revenue of any sort is generated.";
      $e403_font = "<style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
    </style>";
      require_once "./403_content.php";
    }
  } else {
    if ($result === 'ja') {
      // ブラウザー言語日本語
      $lang = "ja";
      $e403_title = "アクセス権限がありません。 | Rain Server";
      $e403_h1 = "アクセス権限がありません。";
      $e403_p = "指定されたURLまたはディレクトリへのアクセスが禁止されているため、表示できません。<br>更新履歴をご確認のうえ、本ページの存在が確認できる場合は、管理者までご連絡ください。";
      $e403_footer_p = "Rainサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。<br>当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生しません。";
      $e403_font = "<style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Sans:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap');
    </style>";
      require_once "./403_content.php";
    } else {
      // ブラウザー言語英語
      $lang = "en";
      $e403_title = "403 Forbidden | Rain Server";
      $e403_h1 = "403 Forbidden";
      $e403_p = "You don't have the permission to access this directory or page.<br>Please check the update history and contact administrators if you can see the description of this page.";
      $e403_footer_p = "Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries.<br>This project is supported by a lot of volunteers, and no revenue of any sort is generated.";
      $e403_font = "<style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
    </style>";
      require_once "./403_content.php";
    }
  }
