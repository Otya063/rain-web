<script lang="ts">
    import { cached_lang } from "../lang/i18n";
    import { jaTrans, enTrans } from "../lang/translation";
    import { onMount } from "svelte";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.header : enTrans.header);

    // reload page
    const reload = () => {
        window.location.reload();
    };

    // select for languages
    const langSelect = (lang: "ja" | "en") => {
        //just update global state on click, and reload current page
        reload();
        cached_lang.set(lang);
    };

    /* language selector operations (at least it works without any errors, but not sure if it's safe and correct code.)
    ====================================================*/
    // selected language decoration
    onMount(() => {
        const lang_code: string = document.documentElement.lang;
        const now_lang = <HTMLElement>document.getElementById(lang_code);
        now_lang.classList.add("selected");
    });

    // slide open
    const slideDown = (target: Element) => {
        if (target instanceof HTMLElement) {
            target.style.height = "auto";
            const h = target.offsetHeight;
            const tabHeight: string = h + "px";
            target.style.height = tabHeight;
            target.animate(
                {
                    height: ["0", tabHeight],
                },
                {
                    duration: 400,
                    easing: "ease",
                }
            );
        }
    };

    // slide close
    const slideUp = (target: Element) => {
        if (target instanceof HTMLElement) {
            const h = target.offsetHeight;
            const tabHeight: string = h + "px";
            target.style.height = tabHeight;
            target.animate(
                {
                    height: [tabHeight, "0"],
                },
                {
                    duration: 400,
                    easing: "ease",
                }
            );
            target.style.height = "0";
        }
    };

    // toggle language selection field
    const toggleLangSel = (e: Event) => {
        const target = e.currentTarget;
        const lj = document.querySelector<HTMLLIElement>(".lang_sel_judge");
        const la = document.querySelector<HTMLUListElement>(".language_selectArea");
        if (target instanceof Element) {
            target.classList.toggle("langArrow_open");
            lj.classList.toggle("open");
            if (lj.classList.contains("open")) {
                slideDown(la);
            } else {
                slideUp(la);
            }
        }
    };
</script>

<div class="header_inner">
    <picture class="header_platform">
        <source srcset="/img/common/platform_sp.webp" media="(max-width: 899px)" type="image/webp" />
        <img src="/img/common/platform_pc.webp" alt="pc" />
    </picture>
    <p class="header_logo">
        <a on:click={() => console.log("clicked")} />
    </p>
    <aside class="header_language">
        <ul>
            <li on:click={toggleLangSel} class="header_language_selector pointer">
                <p>
                    <label class="current_language">{translator().label}</label>
                </p>
            </li>
            <li class="lang_sel_judge">
                <ul class="language_selectArea">
                    <dl class="language_selectArea_list">
                        <li id="ja" on:click={(e) => langSelect("ja")} class="LANG language_names pointer">
                            <label class="language_mainName">日本語</label>
                            <label class="language_subName">{translator().ja_subName}</label>
                        </li>
                        <li id="en" on:click={(e) => langSelect("en")} class="LANG language_names pointer">
                            <label class="language_mainName">English</label>
                            <label class="language_subName">{translator().en_subName}</label>
                        </li>
                    </dl>
                </ul>
            </li>
        </ul>
    </aside>
</div>
