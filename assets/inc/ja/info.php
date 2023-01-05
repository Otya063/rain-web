<?php
$url = $_SERVER["REQUEST_URI"];
$manual_path = "/manual/ja/";
$img_path = "/manual/assets/img/";
$css_path = "/manual/assets/css/";
$js_path = "/manual/assets/js/";
$inc_path = "/manual/assets/inc/";

// タイトル管理
$defaultTitle = "MHF-Z オンラインマニュアル";
$titleName = [
    $manual_path => $defaultTitle,
    $manual_path . "news/" => "更新履歴" . " | " . $defaultTitle,
    $manual_path . "entry/acccreate/" => "アカウント作成手順" . " | " . $defaultTitle,
    $manual_path . "/entry/acclink/" => "Discordアカウント連携" . " | " . $defaultTitle
];

// 概要管理
$descContents = [
    $manual_path => "Rain Server版モンスターハンターフロンティアの公式オンラインマニュアル",
    $manual_path . "entry/acccreate/" => "Rainサーバーにおけるアカウントの作成手順をご紹介します。"
];

$titleTxt = $titleName[$url] ?? $defaultTitle;
$descTxt = $descContents[$url];
