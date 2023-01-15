<script lang="ts">
    import { cached_lang } from "../lang/i18n";
    import { jaTrans, enTrans } from "../lang/translation";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.footer : enTrans.footer);
</script>

<section class="footer_link">
    <ul class="footer_link_list">
        <li>
            <a href="" class="footer_list_items">
                <figure class="footer_list_img">
                    <img src="/img/common/footer/rain_officialsite_icon.webp" alt="Rainサーバー公式サイト" />
                </figure>
                <p class="footer_list_title">
                    {translator().off_site}
                </p>
            </a>
        </li>
        <li>
            <a href="https://discord.gg/TcpkpUpeGw" class="footer_list_items">
                <figure class="footer_list_img">
                    <img src="/img/common/footer/rain_discord_icon.webp" alt="Rainサーバー公式Discord" />
                </figure>
                <p class="footer_list_title">
                    {translator().off_discord}
                </p>
            </a>
        </li>
        <li>
            <a href="https://discord.gg/Wpc7Cus9rb" class="footer_list_items">
                <figure class="footer_list_img">
                    <img src="/img/common/footer/pewpewdojo_server_icon.webp" alt="PewPewDojo公式Discord" />
                </figure>
                <p class="footer_list_title">
                    {translator().pewpew}
                </p>
            </a>
        </li>
    </ul>
    <div class="footer_text">
        <p class="footer_text_disclaimer">
            {translator().disclaimer}
        </p>
    </div>
</section>
