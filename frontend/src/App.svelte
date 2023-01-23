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

    // right-click restriction
    document.documentElement.oncontextmenu = () => {
        return false;
    };

    // pinch-to-zoom restriction
    document.documentElement.addEventListener(
        "touchstart",
        (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        },
        { passive: false }
    );

    // scroll to top of page
    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    // bottom_navigation for mobile operation
    window.addEventListener("scroll", () => {
        const bn = document.querySelector(".bottom_navigations") as HTMLElement;
        let scrollY: number = window.scrollY;
            if (scrollY >= 200) {
                //classにactive付与
                bn.classList.add("hide");
            } else {
                //classからactive削除
                bn.classList.remove("hide");
            }
        
    });
</script>

<svelte:head>
    <title>{translator().title}</title>
    <meta name="description" content={translator().desc} />
    <meta name="keywords" content={translator().keywords} />
    <!-- favicon -->
    <link rel="icon" type="image/png" href="/img/common/favicon.ico" />
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="apple-touch-icon-precomposed" href="/img/common/favicon_sp.png" />
    <!-- font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
    {#if language === "ja"}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap" rel="stylesheet" />
    {:else}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
    {/if}
</svelte:head>
<body>
    <div class="wrapper">
        <header>
            <Header />
        </header>

        <div class="top_images">
            <picture>
                <source srcset="/img/common/bg{randNum}_sp.webp" media="(max-width: 899px)" type="image/webp" />
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

        <div on:click={scrollTop} class="pagetop" />

        <nav class="bottom_navigations">
            <!-- bottom navigation for mobile -->
            <BottomMenu />
        </nav>

        <footer>
            <Footer />
        </footer>
    </div>
</body>
