<?php
$url = $_SERVER["REQUEST_URI"];
$defaultTitle = "MHF-Z Online Manual";
$titleName = [
    "/" => $defaultTitle,
    "/news/" => "更新履歴" . " | " . $defaultTitle,
    "/manual/en/entry/acccreate/" => "Account Creation Procedure" . " | " . $defaultTitle,
    "/manual/en/entry/acclink/" => "Discord Account Linking" . " | " . $defaultTitle
];

$titleTxt = $titleName[$url] ?? $defaultTitle;