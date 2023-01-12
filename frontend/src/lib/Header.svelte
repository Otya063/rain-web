<script lang="ts">
import { cached_lang } from "../lang/i18n";
import { jaTrans,enTrans } from "../lang/translation";

let language:string
cached_lang.subscribe(e=>language = e)
$: translator = () => language == 'ja'? jaTrans.header:enTrans.header

</script>

<div class="header_inner">
    <p class="header_platform">
        <img src="/img/common/platform_pc.webp" alt="閲覧プラットフォーム">
    </p>
    <p class="header_logo">
        <a on:click={()=>console.log("clicked")}></a>
    </p>
    <aside class="header_language">
        <ul>
            <li class="header_language_selector pointer">
                <p>
                    <label class="current_language">{translator().label}</label>
                </p>
            </li>
            <li class="lang_sel_judge">
                <ul class="language_selectArea">
                    <dl class="language_selectArea_list">
                        <li id="ja" class="LANG language_names pointer">
                            <label class="language_mainName">日本語</label>
                            <label class="language_subName">Japanese</label>
                        </li>
                        <li id="en" class="LANG language_names pointer">
                            <label class="language_mainName">English</label>
                            <label class="language_subName">English</label>
                        </li>
                    </dl>
                </ul>
            </li>
        </ul>
    </aside>
</div>
