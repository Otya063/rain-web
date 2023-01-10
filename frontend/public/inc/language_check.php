<?php
/* ブラウザー言語取得 */
$language = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
if (preg_match('/ja/i', $language[0])) { //優先言語日本語の時
    $result = 'ja'; //値jaをresultに格納

} else { //優先言語日本語以外の時
    $result = 'en'; //値enをresultに格納
}
