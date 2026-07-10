<script lang="ts">
    import { register } from 'swiper/element/bundle';
    import type { UserProps } from '$types';
    import ClaimedDistribution from './ClaimedDistribution.svelte';
    import UserMain from './UserMain.svelte';

    register(); // キャラクター用swiper登録
    let { searchedUsers, isMobile }: UserProps = $props();
    let stage = $state(0); // キャラクターページ画面切り替えフラグ（0: メインページ, 1: 配布物受取済み履歴ページ）
    let scrollY = $state(0);
    let scrollYBeforeClickClaimedDist = $state(0);
    let openUserEditField: number[] = $state([]);
</script>

<svelte:window bind:scrollY />

{#if stage === 0}
    <UserMain bind:stage {scrollY} bind:scrollYBeforeClickClaimedDist bind:openUserEditField {searchedUsers} {isMobile} />
{:else if stage === 1}
    <ClaimedDistribution bind:stage bind:scrollYBeforeClickClaimedDist bind:openUserEditField {isMobile} />
{/if}
