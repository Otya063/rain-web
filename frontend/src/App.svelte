<script lang="ts">
  import { lang } from "./lang/i18n";
  import {enTrans,jaTrans} from './lang/translation';
  import Header from './lib/Header.svelte';
  import Top from './lib/Top.svelte';
  import Footer from './lib/Footer.svelte';
  import Menu from "./lib/Menu.svelte";
    import { HtmlTag } from "svelte/internal";
  /*
  ------------------------------------------------------------
  ------------------------------------------------------------
        Initialize The Web Language and Translation
  ------------------------------------------------------------
  ------------------------------------------------------------
  */
  //take value of lang and subscribe it according to global state
  let language:string
  lang.subscribe(e=>language=e)
  //get header translation according to variable language
  let translator = () => {
    if (language == 'ja'){
      return jaTrans.head
    }
    return enTrans.head
  }
  //change html tag lang
  $: document.documentElement.lang = translator().lang
</script>
<!-- add header to html tag on server render -->
<svelte:head>
    <title>{translator().title}</title>
    <meta name="description" content="Online manual for En player">
    <meta name="keywords" content={translator().desc}>
    <!-- favicon -->
    <link rel="icon" type="image/png" href="/img/common/favicon.ico">
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="format-detection" content="telephone=no">
    <link rel="apple-touch-icon-precomposed" href="/img/common/favicon_sp.png">
    <!-- <link href="/css/style.css" rel="stylesheet" type="text/css"> -->
</svelte:head>
<body>
  <div class="wrapper">
    <header>
      <Header/>
    </header>

    <div class="top_images">
      <img class="bg" src="" alt="トップ画像">
    </div>

    <main class="main_inner">
      <nav class="side_menu">
        <Menu/>
      </nav>

      <article class="contents">
        <Top/>
      </article>
    </main>
    <div class="pagetop">▲</div>
    <footer>
      <Footer/>
    </footer>
  </div>
</body>

<!-- use sass as main stylesheet -->
<style lang="scss">
  @import '../public/sass/style';
</style>
