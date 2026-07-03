<script lang="ts">
    import Splide from '@splidejs/splide';
    import { onMount } from 'svelte';
    import type { CharacterCardProps } from '$types';
    import { openModal, getWpnTypeByDec, getWpnNameByDec, convHrpToHr, secToTime, userDisplayState } from '$utils/client';
    import '@splidejs/splide/css';

    let { user, isMobile, onDeleteCharacter, onLinkDiscord }: CharacterCardProps = $props();

    onMount(() => {
        const savedIndex = $userDisplayState[user.id]?.selectedCharacterIndex ?? 0;
        const splide = new Splide(`#splide_${user.id}`, { arrows: !isMobile, speed: 800, wheel: true, waitForTransition: true, wheelSleep: 800, start: savedIndex }).mount();
        splide.on('move', (activeIndex) => {
            // 選択キャラクターのインデックス登録（ページ切り替え後も選択したキャラクターから変わらないようにするため）
            userDisplayState.update((data) => {
                const userState = data[user.id];

                return {
                    ...data,
                    [user.id]: {
                        ...userState,
                        selectedCharacterIndex: activeIndex,
                    },
                };
            });
        });
    });
</script>

<section id={`splide_${user.id}`} class="splide" aria-label="character_swiper">
    <div class="splide__track">
        <ul class="splide__list">
            {#each user.characters as character}
                <li class="character_item splide__slide {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}" class:new={character.is_new_character}>
                    <span class="name">{character.name || 'Ready to Hunt'}</span>

                    <button
                        class="green_btn"
                        class:linked_character={!!character.linked_discord_id}
                        type="button"
                        onclick={() =>
                            openModal('linkDiscord', {
                                label: 'linkDiscord',
                                type: character.linked_discord_id ? 1 : 0,
                                userId: user.id,
                                username: user.username,
                                charId: character.id,
                                charName: character.name || 'Ready to Hunt',
                                discordId: character.linked_discord_id,
                                onSuccess: onLinkDiscord,
                            })}
                    >
                        <span class="btn_icon material-symbols-outlined">link</span>
                        <span class="btn_text">{character.linked_discord_id ? 'Unlink' : 'Link'}</span>
                    </button>

                    {#if !character.is_new_character}
                        <div class="wpn_icon {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}"></div>

                        <div class="wpn_text">
                            <p>{getWpnTypeByDec(character.weapon_type, 'en')}</p>
                            <p>{getWpnNameByDec(character.weapon_id, character.weapon_type)}</p>
                        </div>

                        <button
                            class="red_btn {character.deleted ? 'deleted_character' : 'delete_character'}"
                            type="button"
                            onclick={() =>
                                openModal('deleteCharacter', {
                                    label: 'deleteCharacter',
                                    type: character.deleted ? 1 : 0,
                                    charId: character.id,
                                    charName: character.name || 'Ready to Hunt',
                                    onSuccess: onDeleteCharacter,
                                })}
                            class:disabled_elm={!character.deleted && user.characters.length === 1}
                        >
                            <span class="btn_icon material-symbols-outlined">delete</span>
                            <span class="btn_text">{character.deleted ? 'Deleted' : 'Delete'}</span>
                        </button>
                    {:else}
                        <div class="wpn_icon"></div>
                        <div class="wpn_text">
                            <p>No Data</p>
                            <p>No Data</p>
                        </div>
                    {/if}

                    <div class="other_info">
                        <p class="rank">HR: {convHrpToHr(character.hrp)} / GR: {character.gr}</p>
                        <p class="last_login">Playtime: {secToTime(character.playtime)}</p>
                    </div>
                </li>
            {/each}
        </ul>
    </div>
</section>
