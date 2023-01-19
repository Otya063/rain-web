<script lang="ts">
    import { cached_lang } from "../lang/i18n";
    import { jaTrans, enTrans } from "../lang/translation";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.bottom_menu : enTrans.bottom_menu);
</script>

<ul>
    <!-- アイコン1つ目-->
    <li class="openbtn">
        <span class="mini-text">{translator().toppage}</span>
    </li>

    <!-- アイコン2つ目-->
    <li class="openbtn">
        <span class="mini-text">{translator().lang_sel}</span>
    </li>

    <!-- アイコン3つ目 Bookmark -->
    <li class="openbtn">
        <span class="mini-text">{translator().menu}</span>
    </li>
</ul>
