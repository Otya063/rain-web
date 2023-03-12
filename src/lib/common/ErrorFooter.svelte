<script lang="ts">
    import LL from '$i18n/i18n-svelte';
</script>

<section class="error_footer">
    <img class="footer_logo" src="/img/common/rain_textlogo.webp" alt="rain_textlogo" />
    <p class="footer_text">{@html $LL.E404['footer_text']()}</p>
</section>
