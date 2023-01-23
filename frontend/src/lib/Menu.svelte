<script lang="ts">
    import { cached_lang } from "../lang/i18n";
    import { jaTrans, enTrans } from "../lang/translation";
    import { onMount } from "svelte";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.side_menu : enTrans.side_menu);

    /* side_menu operations (at least it works without any errors, but not sure if it's safe and correct code.)
    ====================================================*/
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

    // toggle side_menu
    window.onload = () => {
        let menuNow: number = null; // memorize the clicked tab by index number
        const menuBtns = document.querySelectorAll<HTMLUListElement>(".category");
        menuBtns.forEach((menuBtn, index) => {
            menuBtn.addEventListener("click", (e: Event) => {
                const target = e.currentTarget;
                if (target instanceof Element) {
                    menuNow = index;
                    target.classList.toggle("open");
                    const content = target.children[1] as HTMLLIElement;
                    if (target.classList.contains("open")) {
                        slideDown(content);
                    } else {
                        slideUp(content);
                    }
                }

                // automatically close already opened menu tab
                menuBtns.forEach((menuBtn, index) => {
                    if (menuNow !== index) {
                        menuBtn.classList.remove("open");
                        const openedTab = menuBtn.children[1] as HTMLLIElement;
                        slideUp(openedTab);
                    }
                });
            });
        });
    };

    // automatic operation of side_menu decoration based on the viewed article
    onMount(() => {
        const path_name: string = location.pathname; // path of current page
        const path_value: string[] = path_name.split("/"); // split path by "/"
        const mcpath: string = path_value[0]; // main_category_path
        const scpath: string = path_value[1]; // sub_category_path
        let mc_value: string; // getById for main_category
        let sc_value: string; // getById for sub_category

        if (mcpath === "") {
            // for top article
            mc_value = "toppage";
            sc_value = "home";
        } else if (scpath === "news") {
            // for news article
            mc_value = "toppage";
            sc_value = "news";
        } else {
            // for each article
            mc_value = mcpath;
            sc_value = scpath;
        }

        const mc = document.getElementById(mc_value) as HTMLLIElement;
        mc.classList.add("open");
        const content = mc.children[1] as HTMLUListElement;
        content.style.height = "auto";
        const sc = document.getElementById(sc_value) as HTMLLIElement;
        sc.classList.add("selected");
    });
</script>

<p class="logo">
    <a on:click={() => console.log("clicked")} />
</p>
<ul class="categories">
    <li id="toppage" class="category">
        <button class="category_title" type="button"><span class="mark" />{translator().category_toppage["title"]}</button>
        <ul class="sub_categories">
            <dl class="sub_categories_list">
                <li id="home" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_toppage["home"]}
                </li>
                <li id="news" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_toppage["news"]}
                </li>
            </dl>
        </ul>
    </li>
    <li id="entry" class="category">
        <button class="category_title" type="button"><span class="mark" />{translator().category_entry["title"]}</button>
        <ul class="sub_categories">
            <dl class="sub_categories_list">
                <li id="acccreate" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_entry["acccreate"]}
                </li>
                <li id="acclink" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_entry["acclink"]}
                </li>
            </dl>
        </ul>
    </li>
    <li id="begin" class="category">
        <button class="category_title" type="button"><span class="mark" />{translator().category_begin["title"]}</button>
        <ul class="sub_categories">
            <dl class="sub_categories_list">
                <li id="start" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["start"]}
                </li>
                <li id="menu" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["menu"]}
                </li>
                <li id="character" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["character"]}
                </li>
                <li id="adddelete" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["adddelete"]}
                </li>
                <li id="world" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["world"]}
                </li>
                <li id="tutorial" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["tutorial"]}
                </li>
                <li id="multiple" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["multiple"]}
                </li>
                <li id="quit" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_begin["quit"]}
                </li>
            </dl>
        </ul>
    </li>
    <li id="server" class="category">
        <button class="category_title" type="button"><span class="mark" />{translator().category_server["title"]}</button>
        <ul class="sub_categories">
            <dl class="sub_categories_list">
                <li id="bounty" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_server["bounty"]}
                </li>
                <li id="gacha" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_server["gacha"]}
                </li>
                <li id="market" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_server["market"]}
                </li>
                <li id="command" class="sub_category" on:click={() => console.log("clicked")}>
                    {translator().category_server["command"]}
                </li>
            </dl>
        </ul>
    </li>
</ul>
