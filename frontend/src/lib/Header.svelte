<script lang="ts">
    import { cached_lang } from "../lang/i18n";
    import { jaTrans, enTrans } from "../lang/translation";
    import { onMount } from "svelte";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.header : enTrans.header);

    // select for languages
    const langSelect = (lang: "ja" | "en", e: Event) => {
        //just update global state on click
        cached_lang.set(lang);
        // change the target of selected language decoration and close language selection tab
        const target = e.currentTarget;
        if (target instanceof HTMLElement) {
            if (!target.classList.contains("selected")) {
                // need more simplified codes
                const hasClass: HTMLLIElement = document.querySelector(".selected");
                hasClass.classList.remove("selected");
                target.classList.add("selected");
                const la_parent: HTMLUListElement = target.closest(".language_selectArea");
                const lj_parent: HTMLLIElement = target.closest(".lang_sel_judge");
                const ls: HTMLLIElement = document.querySelector(".header_language_selector");
                lj_parent.classList.remove("open");
                ls.classList.remove("langArrow_open");
                slideUp(la_parent);
            } else {
                // need more simplified codes
                const la_parent: HTMLUListElement = target.closest(".language_selectArea");
                const lj_parent: HTMLLIElement = target.closest(".lang_sel_judge");
                const ls: HTMLLIElement = document.querySelector(".header_language_selector");
                lj_parent.classList.remove("open");
                ls.classList.remove("langArrow_open");
                slideUp(la_parent);
            }
        }
    };

    /* language selector operations (at least it works without any errors, but not sure if it's safe and correct code.)
    ====================================================*/
    // selected language decoration
    onMount(() => {
        const lang_code: string = document.documentElement.lang;
        const now_lang: HTMLElement = document.getElementById(lang_code);
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
        const lj: HTMLLIElement = document.querySelector(".lang_sel_judge");
        const la: HTMLUListElement = document.querySelector(".language_selectArea");
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
        <source
            srcset="/img/common/platform_sp.webp"
            media="(max-width: 899px)"
            type="image/webp"
        />
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
                        <li
                            id="ja"
                            on:click={(e) => langSelect("ja", e)}
                            class="LANG language_names pointer"
                        >
                            <label class="language_mainName">日本語</label>
                            <label class="language_subName">{translator().ja_subName}</label>
                        </li>
                        <li
                            id="en"
                            on:click={(e) => langSelect("en", e)}
                            class="LANG language_names pointer"
                        >
                            <label class="language_mainName">English</label>
                            <label class="language_subName">{translator().en_subName}</label>
                        </li>
                    </dl>
                </ul>
            </li>
        </ul>
    </aside>
</div>
