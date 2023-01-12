<script lang="ts">
    import { cached_lang } from "./lang/i18n";
    import { enTrans, jaTrans } from "./lang/translation";
    import Header from "./lib/Header.svelte";
    import Top from "./lib/Top.svelte";
    import Footer from "./lib/Footer.svelte";
    import Menu from "./lib/Menu.svelte";
    /*
  ------------------------------------------------------------
  ------------------------------------------------------------
        Initialize The Web Language and Translation
  ------------------------------------------------------------
  ------------------------------------------------------------
  */
    //take value of lang and subscribe it according to global state
    let language: string; //this is local state
    // chached lang is global state
    cached_lang.subscribe(e=>{
      //change local state same as global
      language = e
      //change html tag
      document.documentElement.lang = e
      //update the local cache
      localStorage.setItem("lang",e)
    });
    //short hand one liner trick
    $: translator = () => language == 'ja'? jaTrans.head : enTrans.head; 
    const jaClick = () => {
      //just update global state on click
      cached_lang.set("ja")
    };
    const enClick = () => {
      cached_lang.set("en")
    };
</script>

<!-- add header to html tag on server render -->
<svelte:head>
    <title>{translator().title}</title>
    <meta name="description" content={translator().desc} />
    <meta name="keywords" content={translator().desc} />
    <!-- favicon -->
    <link rel="icon" type="image/png" href="/img/common/favicon.ico" />
    <!-- mobile -->
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
    />
    <meta name="format-detection" content="telephone=no" />
    <link rel="apple-touch-icon-precomposed" href="/img/common/favicon_sp.png" />
    <!-- <link href="/css/style.css" rel="stylesheet" type="text/css"> -->
</svelte:head>
<body>
    <div class="wrapper">
        <header>
            <Header />
        </header>

        <div class="top_images">
            <img class="bg" src="" alt="トップ画像" />
        </div>

        <button on:click={jaClick}>Japanese</button>
        <button on:click={enClick}>English</button>

        <main class="main_inner">
            <nav class="side_menu">
                <Menu />
            </nav>

            <article class="contents">
                <Top />
            </article>
        </main>
        <div class="pagetop">▲</div>
        <footer>
            <Footer />
        </footer>
    </div>
</body>

