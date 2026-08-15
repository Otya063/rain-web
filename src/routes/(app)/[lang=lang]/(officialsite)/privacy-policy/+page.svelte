<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { scrollToTop } from '$utils/client';
    import '$scss/style_policy.scss';
</script>

<div class="bg policy_bg">
    <main class="policy_main">
        <article class="policy_doc">
            <h1 class="policy_title">{$LL.privacyPolicy['label']()}</h1>
            <p class="policy_updated">{$LL.privacyPolicy['lastUpdated']()}</p>
            <p class="policy_intro">{@html $LL.privacyPolicy['intro']()}</p>

            <ol class="policy_toc">
                {#each Object.entries($LL.privacyPolicy['sections']) as [id, { title }]}
                    <li>
                        <a href="#{id}">{title()}</a>
                    </li>
                {/each}
            </ol>

            {#each Object.entries($LL.privacyPolicy['sections']) as [id, { title, body }]}
                <section class="policy_section" {id}>
                    <h2 class="policy_section_title">{title()}</h2>
                    <p class="policy_section_body">{@html body()}</p>
                </section>
            {/each}
        </article>
    </main>
</div>

<!-- PC用上まで戻るボタン -->
<button onclick={scrollToTop} id="scroll_to_top" aria-label="Scroll to Top"></button>

<svelte:head>
    <title>{$LL.privacyPolicy['label']()} | {$LL.serverTitle()}</title>
    <meta name="description" content={$LL.privacyPolicy['description']()} />
    <meta property="og:title" content="{$LL.privacyPolicy['label']()} | {$LL.serverTitle()}" />
    <meta property="og:description" content={$LL.privacyPolicy['description']()} />
</svelte:head>
