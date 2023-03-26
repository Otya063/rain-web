<script lang="ts">
    import LL, { locale } from '$i18n/i18n-svelte';
</script>

<h1>{$LL.articles['signup'].discord['title']()}</h1>

<div class="table_contents" data-title={$LL.articles['signup'].discord['data_title']()}>
    <ul>
        <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="scroll" data-target="signup_discord">{$LL.articles['signup'].discord['table_contents']()}</a>
        </li>
    </ul>
</div>

<div class="article_memo" data-title="COMMENT">
    <p class="inner_text">{@html $LL.articles['signup'].discord['article_memo']()}</p>
</div>

<section id="signup_discord">
    <h2>{$LL.articles['signup'].discord['subtitle']()}</h2>

    <ul>
        <li class="center_box">
            <p class="center_box_text">（1）{@html $LL.articles['signup'].discord['center_box1']()}</p>
            <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/discord_1.png" alt="discord_1" /></p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（2）{@html $LL.articles['signup'].discord['center_box2']()}</p>
            <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/discord_2_1.png" alt="discord_2_1" /></p>
            <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/discord_2_2.png" alt="discord_2_2" /></p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（3）{@html $LL.articles['signup'].discord['center_box3']()}</p>
            <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/discord_3_1.png" alt="discord_3_1" /></p>
            <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/discord_3_2.png" alt="discord_3_2" /></p>
        </li>
    </ul>
</section>
