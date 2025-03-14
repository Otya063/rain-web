<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import _ from 'lodash';
    import { onMount } from 'svelte';
    import { scrollTop } from 'svelte-scrolling';
    import { tweened, type Tweened } from 'svelte/motion';
    import { slide, fade } from 'svelte/transition';
    import { Svroller } from 'svrollbar';
    import Main from '$lib/admin/Main.svelte';
    import Modals from '$lib/admin/Modals.svelte';
    import SideMenu from '$lib/admin/SideMenu.svelte';
    import {
        loadArticle,
        Timeout,
        msgClosed,
        errDetailMode,
        onSubmit,
        closeMsgDisplay,
        toggleMsgDetail,
        timeOut,
        adminTabValue,
        modalStates,
        preventHorizScrollOnDetailRow,
    } from '$utils/client';
    import '$scss/style_admin.scss';

    interface Props {
        data: PageData;
        form: ActionData;
    }
    let { data, form }: Props = $props();
    let loaded = $state(false);
    let infoAddMode = $state(false);
    let bnrAddMode = $state(false);
    let isMobile = $state(false);
    const width: Tweened<number> = tweened(100);
    let distAddMode = $state(false);

    onMount(() => {
        loaded = true;
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleSwipeHorizScroll);
        window.addEventListener('touchend', handleTouchEnd);

        const mobileDevices = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        isMobile = mobileDevices.test(navigator.userAgent);

        // クリーンアップ処理
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleSwipeHorizScroll);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    });

    // メッセージ表示タイマーバー
    $effect(() => {
        if (form?.success || form?.error) {
            width.set(100, { duration: 0 }); // 表示前に再度バー値をマックスにしておく
            width.set(0, { duration: 5000 });

            timeOut.set(
                new Timeout(() => {
                    msgClosed.set(true);
                }, 5000),
            );
        }
    });

    // メッセージ表示中にonsubmitが実行された場合、表示をリセット
    $effect(() => {
        if ($onSubmit && $timeOut && $timeOut.time !== 0) {
            msgClosed.set(true);
            $timeOut.stop();
        }
    });

    /* モバイル用ナビゲーションメニュー制御
    ========================================================= */
    let openMobileNav = $state(false);
    let menuYPosition = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 70; // メニューを起動するための最小スワイプ距離（ピクセル単位）

    /**
     * スワイプの開始位置を記録
     *
     * @param {TouchEvent} e タッチ開始イベント
     */
    const handleTouchStart = (e: TouchEvent): void => {
        // <swiper-container>内と編集エリア内でのタッチ開始の場合はスキップ
        if (
            (e.target && (e.target as HTMLElement).closest('swiper-container')) ||
            (e.target as HTMLElement).closest('.edit_area_box_wrapper') ||
            (e.target as HTMLElement).closest('.console_contents_table_wrapper')
        ) {
            return;
        }

        touchStartX = (e.changedTouches[0].screenX);
    };

    /**
     * スワイプの終了位置を記録し、右から左へのスワイプを検出してナビゲーションメニューを開く
     *
     * @param {TouchEvent} e タッチ終了イベント
     */
    const handleTouchEnd = (e: TouchEvent): void => {
        // <swiper-container>内と編集エリア内でのタッチ終了の場合はスキップ
        if (
            (e.target && (e.target as HTMLElement).closest('swiper-container')) ||
            (e.target as HTMLElement).closest('.edit_area_box_wrapper') ||
            (e.target as HTMLElement).closest('.console_contents_table_wrapper')
        ) {
            return;
        }

        touchEndX = (e.changedTouches[0].screenX);
        handleSwipeGesture();
    };

    /**
     * スワイプを検出し、メニューを制御
     */
    const handleSwipeGesture = (): void => {
        const swipeDistance = touchStartX - touchEndX;

        if (swipeDistance > swipeThreshold) {
            // 右から左へのスワイプならメニュー開く
            openMenu();
        } else if (swipeDistance < -swipeThreshold) {
            // 左から右へのスワイプならメニュー閉じる
            closeMobileMenu(false);
        }
    };

    /**
     * ナビゲーションメニューを開き、画面のスクロールを固定
     */
    const openMenu = (): void => {
        if (!openMobileNav) {
            // 現在のスクロール位置を保存
            menuYPosition = window.scrollY;

            // bodyをfixedし、現在のスクロール位置で動かないように
            document.body.style.position = 'fixed';
            document.body.style.top = `-${menuYPosition}px`;
            document.body.style.width = '100%';

            openMobileNav = true;
        }
    };

    /**
     * ナビゲーションメニューを閉じ、画面スクロールをページトップへ（モバイル限定）
     *
     * @param {booelan} btnClicked メニュー内のボタンをクリックしたかどうか
     */
    const closeMobileMenu = (btnClicked: boolean): void => {
        if (openMobileNav) {
            // bodyから各スタイルを削除
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            // スクロール位置を調節（メニュー内ボタンクリックならページトップへ、そうでないなら現在のスクロール位置から動かないように）
            btnClicked ? scrollTop() : window.scrollTo(0, menuYPosition);

            openMobileNav = false;
        }
    };

    /**
     * タッチイベントが特定の要素（.detail_row）の上で発生したかを判定し、
     * ストア変数`preventHorizScrollOnDetailRow`を更新して横スクロールの制御を行う
     *
     * @param {TouchEvent} e タッチイベント
     */
    const handleSwipeHorizScroll = (e: TouchEvent) => {
        if (isMobile && (e.target as HTMLElement).closest('.detail_row')) {
            preventHorizScrollOnDetailRow.set(true);
        } else {
            preventHorizScrollOnDetailRow.set(false);
        }
    };
</script>

{#if !loaded}
    <div transition:fade class="mount_overlay"></div>
{/if}

<header>
    <div class="header_inner">
        <label class="header_platform" for=""></label>
        <p class="header_logo">
            <button class="header_logo_button" aria-label="Back to Home" onclick={(e) => loadArticle(e, data.url, 'en', 'root')}></button>
        </p>
    </div>
</header>

{#if $onSubmit}
    <div class="saving_overlay">
        <div class="loader"></div>
        <p class="saving_overlay_text">
            {#if $modalStates.downloadBinary}
                Downloading...
            {:else}
                Saving...
            {/if}
        </p>
    </div>
{/if}

<div class="background_img"></div>

{#if !$msgClosed}
    <div transition:fade class="msg_display" class:success={form?.success} class:error={form?.error}>
        <div class="msg_display_contents">
            <span class="msg_display_left_bar"></span>
            {#if form?.success}
                <span class="msg_display_icon material-symbols-outlined">check_circle</span>
                <p class="msg_display_status">{form?.message}</p>
            {:else if form?.error}
                <span class="msg_display_icon material-symbols-outlined">warning</span>
                <p class="msg_display_status">Error occurred.</p>
                <button id="error_view_btn" class="error_view_btn material-symbols-outlined" class:open={$errDetailMode} onclick={(e) => toggleMsgDetail(e, $timeOut, width)}>expand_more</button>
            {/if}
            <button id="msg_close_btn" class="msg_close_btn material-symbols-outlined" onclick={() => closeMsgDisplay($timeOut)}>highlight_off</button>
            <div class="timer_bar" style={`width: ${$width}%;`}></div>
        </div>

        {#if $errDetailMode}
            <div transition:slide class="msg_detail">
                Message Details:
                <p>{@html form?.message}</p>
            </div>
        {/if}
    </div>
{/if}

<Modals {form} />

<main class="console_body">
    {#if openMobileNav}
        <!-- モバイル用ナビゲーションメニューが開いている時、背景黒 -->
        <div transition:fade={{ duration: 200 }} class="mobile_menu_cover"></div>
    {/if}

    <nav class="console_menu" class:open={openMobileNav}>
        <Svroller width="100%" height="100%" alwaysVisible={true}>
            <SideMenu {closeMobileMenu} />
        </Svroller>
    </nav>

    <article class="console_article">
        <h1 class="console_article_heading1">
            <span class="material-symbols-outlined">admin_panel_settings</span>
            Admin Console

            {#if $adminTabValue === 'banner' && !bnrAddMode}
                <button class="green_btn" onclick={() => (bnrAddMode = true)}>
                    <span class="btn_icon material-symbols-outlined">add</span>
                    <span class="btn_text">Add Banner</span>
                </button>
            <!-- {:else if $adminTabValue === 'info' && !infoAddMode}
                <button class="green_btn" type="button" onclick={() => (infoAddMode = true)}>
                    <span class="btn_icon material-symbols-outlined">add</span>
                    <span class="btn_text">Add Info</span>
                </button> -->
            <!-- {:else if $adminTabValue === 'distribution' && !distAddMode}
                <button class="green_btn" type="button" onclick={() => (distAddMode = true)}>
                    <span class="btn_icon material-symbols-outlined">add</span>
                    <span class="btn_text">Add Distribution</span>
                </button> -->
            {/if}
        </h1>

        <Main bind:infoAddMode bind:bnrAddMode {data} {form} {isMobile} bind:distAddMode />
    </article>
</main>

<footer class="admin_footer">
    <section class="footer_inner">
        <p class="footer_text">
            Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. <br />This community is based on the cooperation of numerous volunteers, and no revenue of any sort is
            generated through this community.
        </p>
    </section>
</footer>
