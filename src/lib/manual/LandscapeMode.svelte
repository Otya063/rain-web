<script lang="ts">
    import { browser } from '$app/environment';
    import LL from '$i18n/i18n-svelte';

    // ランドスケープモード使用禁止
    const mobileDevices = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    let innerWidth: number = $state(0);
    let innerHeight: number = $state(0);
    let landscape = $derived(innerWidth > innerHeight && mobileDevices.test(navigator.userAgent));

    $effect(() => {
        if (browser) {
            document.body.classList.toggle('noscroll', landscape);
        }
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="landscape_mode" class:detected={landscape}>
    <span class="rotate_text">
        {$LL.landscapeMode()}
    </span>

    <img src="/img/common/landscape/rotate_device.webp" alt="rotate" class="rotate_device" />

    <div class="now_waiting">
        <img src="/img/common/landscape/now_waiting_N1.webp" alt="N" />
        <img src="/img/common/landscape/now_waiting_O.webp" alt="O" />
        <img src="/img/common/landscape/now_waiting_W1.webp" alt="W" />
        <img src="/img/common/landscape/now_waiting_W2.webp" alt="W" />
        <img src="/img/common/landscape/now_waiting_A.webp" alt="A" />
        <img src="/img/common/landscape/now_waiting_I1.webp" alt="I" />
        <img src="/img/common/landscape/now_waiting_T.webp" alt="T" />
        <img src="/img/common/landscape/now_waiting_I2.webp" alt="I" />
        <img src="/img/common/landscape/now_waiting_N2.webp" alt="N" />
        <img src="/img/common/landscape/now_waiting_G.webp" alt="G" />
    </div>
</div>
