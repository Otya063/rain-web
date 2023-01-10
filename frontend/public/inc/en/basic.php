<?php
$url = $_SERVER["REQUEST_URI"];

//各パス
$manual_path = "/manual/en/";
$img_path = "/manual/assets/img/";
$css_path = "/manual/assets/css/";
$js_path = "/manual/assets/js/";
$inc_path = "/manual/assets/inc/";

// タイトル管理
$defaultTitle = "MHF-Z Online Manual";
$titleName = [
    $manual_path => $defaultTitle,
    $manual_path . "news/" => "Update History" . " | " . $defaultTitle,
    $manual_path . "entry/acccreate/" => "Account Creation Procedure" . " | " . $defaultTitle,
    $manual_path . "/entry/acclink/" => "Discord Account Linking" . " | " . $defaultTitle
];

// 概要管理
$descContents = [
    $manual_path => "Official online manual of Monster Hunter Frontier for Rain Server.",
    $manual_path . "entry/acccreate/" => "",
    $manual_path . "/entry/acclink/" => ""
];

$titleTxt = $titleName[$url] ?? $defaultTitle;
$descTxt = $descContents[$url];
