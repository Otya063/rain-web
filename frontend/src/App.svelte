<script lang="ts">
    import { cached_lang } from "./lang/i18n";
    import { enTrans, jaTrans } from "./lang/translation";
    import Header from "./lib/Header.svelte";
    import Top from "./lib/Top.svelte";
    import Footer from "./lib/Footer.svelte";
    import Menu from "./lib/Menu.svelte";
    import BottomMenu from "./lib/BottomMenu.svelte";

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
    cached_lang.subscribe((e) => {
        //change local state same as global
        language = e;
        //change html tag
        document.documentElement.lang = e;
        //update the local cache
        localStorage.setItem("lang", e);
    });

    //short hand one liner trick
    $: translator = () => (language == "ja" ? jaTrans.head : enTrans.head);

    // random numbers for selecting background images (1 ≦ randNum ≦ 4)
    let randNum: number = Math.floor(Math.random() * 4) + 1;
</script>

<!-- add header to html tag on server render -->
<svelte:head>
    <title>{translator().title}</title>
    <meta name="description" content={translator().desc} />
    <meta name="keywords" content={translator().keywords} />
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
            <picture>
                <source
                    srcset="/img/common/bg{randNum}_sp.webp"
                    media="(max-width: 899px)"
                    type="image/webp"
                />
                <img class="top_img" src="/img/common/bg{randNum}.webp" alt="top_pc" />
            </picture>
        </div>

        <div class="bg">
            <main class="main_inner">
                <nav class="side_menu">
                    <Menu />
                </nav>

                <article class="contents">
                    <Top />
                </article>
            </main>
        </div>

        <div class="pagetop" />

        <nav class="bottom_navigations">
            <!-- bottom navigation for mobile -->
            <BottomMenu />
        </nav>

        <footer>
            <Footer />
        </footer>
    </div>
</body>
