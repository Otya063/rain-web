<script lang="ts">
    import LL, { locale } from '$i18n/i18n-svelte';
</script>

<section class="footer_link">
    <ul class="footer_link_list">
        {#each Object.entries($LL.footer) as [img_src, { title, href, alt }]}
            <li>
                <a href={href({ lang: $locale })} class="footer_list_items">
                    <figure class="footer_list_img">
                        <img src="/img/common/footer/{img_src}_icon.webp" alt={alt()} />
                    </figure>
                    <p class="footer_list_title">
                        {@html title()}
                    </p>
                </a>
            </li>
        {/each}
    </ul>
    <div class="footer_note">
        <p>
            {@html $LL.disclaimer()}
        </p>
    </div>
</section>
