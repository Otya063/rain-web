<script lang="ts">
    import { page } from '$app/stores';

    $effect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-CWPFX8PL6Y', {
                page_title: document.title,
                page_path: $page.url.pathname,
            });
        }
    });
</script>

<svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-CWPFX8PL6Y"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());

        gtag('config', 'G-CWPFX8PL6Y');
    </script>
</svelte:head>
