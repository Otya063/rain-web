<script lang="ts">
    import { cached_lang } from "../lang/i18n";
    import { jaTrans, enTrans } from "../lang/translation";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.header : enTrans.header);

    // select for languages
    const langSelect = (lang: "ja" | "en") => {
        //just update global state on click
        cached_lang.set(lang);
    };

    /* menu operations (at least it works, but not sure if it's safe codes.)
    ====================================================*/
    // selected language decoration
    window.onload = () => {
        let lang_code: string = document.documentElement.lang;
        let now_lang = document.getElementById(lang_code)!;
        now_lang.classList.add("selected"); // I don't know how to change this to reactive.
    };

    // slide open
    const slideDown = (target) => {
        target.style.height = "auto";
        let h = target.offsetHeight;
        target.style.height = h + "px";
        target.animate(
            {
                height: [0, h + "px"],
            },
            {
                duration: 400,
                easing: "ease",
            }
        );
    };

    // slide close
    const slideUp = (target) => {
        let h = target.offsetHeight;
        target.style.height = h + "px";
        target.animate(
            {
                height: [h + "px", 0],
            },
            {
                duration: 400,
                easing: "ease",
            }
        );
        target.style.height = 0;
    };

    // toggle language selection field
    const toggleLangSel = (e) => {
        const target: HTMLElement = e.currentTarget;
        const lj = document.querySelector<HTMLElement>(".lang_sel_judge");
        const la = document.querySelector<HTMLElement>(".language_selectArea");
        target.classList.toggle("langArrow_open");
        lj.classList.toggle("open");
        if (lj.classList.contains("open")) {
            slideDown(la);
        } else {
            slideUp(la);
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
                            on:click={() => langSelect("ja")}
                            id="ja"
                            class="LANG language_names pointer"
                        >
                            <label class="language_mainName">日本語</label>
                            <label class="language_subName">{translator().ja_subName}</label>
                        </li>
                        <li
                            on:click={() => langSelect("en")}
                            id="en"
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
