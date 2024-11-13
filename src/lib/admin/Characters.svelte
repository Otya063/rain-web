<script lang="ts">
    import { error } from '@sveltejs/kit';
    import { DateTime } from 'luxon';
    import { slide } from 'svelte/transition';
    import { applyAction, enhance } from '$app/forms';
    import type { PaginatedUsers } from '$lib/types';
    import {
        prepareModal,
        onSubmit,
        decToLittleEndian,
        getWpnTypeByDec,
        getWpnNameByDec,
        msgClosed,
        timeOut,
        closeMsgDisplay,
        conv2DArrayToObject,
        paginatedUsersData,
        userCtrlPanel,
        updateUserCtrlPanel,
        convHrpToHr,
        validateInput,
        secToTime,
    } from '$lib/utils';

    let { user }: { user: PaginatedUsers } = $props();
    let validName = $state(true);
    const validFileName = [
        'savedata.bin',
        'decomyset.bin',
        'hunternavi.bin',
        'otomoairou.bin',
        'partner.bin',
        'platebox.bin',
        'platedata.bin',
        'platemyset.bin',
        'rengokudata.bin',
        'savemercenary.bin',
        'skinhist.bin',
        'minidata.bin',
        'scenariodata.bin',
        'savefavoritequest.bin',
    ] as const; // 有効なファイル名リスト
    let binaryData: { [key in (typeof validFileName)[number]]: Uint8Array | null } = $state({
        'savedata.bin': null,
        'decomyset.bin': null,
        'hunternavi.bin': null,
        'otomoairou.bin': null,
        'partner.bin': null,
        'platebox.bin': null,
        'platedata.bin': null,
        'platemyset.bin': null,
        'rengokudata.bin': null,
        'savemercenary.bin': null,
        'skinhist.bin': null,
        'minidata.bin': null,
        'scenariodata.bin': null,
        'savefavoritequest.bin': null,
    }); // アップロード前に各データを管理する

    /**
     * ファイルをUint8Array形式に変換する
     *
     * @param {Event} e ファイル選択時のイベント
     */
    const convFileToUint8 = (e: Event): void => {
        const target = e.target as HTMLInputElement;
        const files = target.files as FileList;

        // ファイル名の検証
        Array.from(files).forEach((file) => {
            if (!validFileName.includes(file.name as any)) {
                alert(`Invalid file name (${file.name}).`);
                (document.getElementById('save_file_input') as HTMLInputElement).value = ''; // input要素をリセット

                return;
            }
        });

        // ファイルをUint8Arrayに変換
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (e) => {
                const buffer = e.target!.result as ArrayBuffer;
                binaryData[file.name as (typeof validFileName)[number]] = new Uint8Array(buffer);
            };
        });
    };
</script>

<swiper-container
    centered-slides={true}
    effect={'coverflow'}
    coverflow-effect-slide-shadows={false}
    mousewheel={true}
    direction={'horizontal'}
    speed={500}
    navigation={true}
    space-between={50}
    observer={true}
    observe-parents={true}
    onswiperslidechange={(e: Event) => {
        setTimeout(() => {
            const target = e.target as HTMLElement;
            const activeChar = target.getElementsByClassName('swiper-slide-active')[0].lastElementChild! as HTMLDivElement;
            const userId = Number(activeChar.dataset.userid);
            const charId = Number(activeChar.dataset.charid);

            // userCtrlPanel更新
            updateUserCtrlPanel(userId, charId);
        }, 100);
    }}
>
    {#each user.characters as character}
        <swiper-slide>
            <div
                class="character_item {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}"
                class:new={character.is_new_character}
                data-userId={user.id}
                data-charId={character.id}
            >
                <span class="name">{character.name ?? 'Ready to Hunt'}</span>

                {#if character.discord}
                    <button
                        class="green_btn linked_character"
                        type="button"
                        onclick={() =>
                            prepareModal('linkDiscord', {
                                title: 'Unlink the following characters?',
                                form_action: 'unlinkDiscord',
                                user_id: user.id,
                                username: user.username,
                                char_id: character.id,
                                char_name: character.name,
                                discord_id: character.discord?.discord_id,
                            })}
                    >
                        <span class="btn_icon material-symbols-outlined">link</span>
                        <span class="btn_text">Linked</span>
                    </button>
                {:else}
                    <button
                        class="green_btn link_character"
                        type="button"
                        onclick={() =>
                            prepareModal('linkDiscord', {
                                title: 'Execute the linking process with the following user and character. Please confirm the target ID and Username, and enter the ID (18-digit) of Discord to be linked.',
                                form_action: 'linkDiscord',
                                user_id: user.id,
                                username: user.username,
                                char_id: character.id,
                                char_name: character.name,
                            })}
                    >
                        <span class="btn_icon material-symbols-outlined">link</span>
                        <span class="btn_text">Link</span>
                    </button>
                {/if}

                {#if !character.is_new_character}
                    <div class="wpn_icon {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}"></div>

                    <div class="wpn_text">
                        <p>{getWpnTypeByDec(character.weapon_type, 'en')}</p>
                        {#await getWpnNameByDec(character.weapon_id, character.weapon_type, 'en')}
                            Loading...
                        {:then wpnName}
                            <p>{wpnName}</p>
                        {/await}
                    </div>

                    {#if character.deleted}
                        <button
                            class="red_btn deleted_character"
                            type="button"
                            onclick={() =>
                                prepareModal('deleteCharacter', {
                                    title: 'Restore the following character?',
                                    form_action: 'restoreCharacter',
                                    char_id: character.id,
                                    char_name: character.name,
                                })}
                        >
                            <span class="btn_icon material-symbols-outlined">delete</span>
                            <span class="btn_text">Deleted</span>
                        </button>
                    {:else}
                        <button
                            class="red_btn delete_character"
                            type="button"
                            onclick={() =>
                                prepareModal('deleteCharacter', {
                                    title: 'Delete the following character?',
                                    form_action: 'deleteCharacter',
                                    char_id: character.id,
                                    char_name: character.name,
                                })}
                            class:disabled_elm={user.characters.length === 1}
                        >
                            <span class="btn_icon material-symbols-outlined">delete</span>
                            <span class="btn_text">Delete</span>
                        </button>
                    {/if}
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
            </div>
        </swiper-slide>
    {/each}
</swiper-container>

{#if $userCtrlPanel[user.id].selectedChar.is_new_character}
    <p style="color: #ff8100; padding-top: 1%;">New character can't be edited.</p>
{:else}
    <form
        action="?/updateCharacterData"
        method="POST"
        enctype="multipart/form-data"
        use:enhance={({ formData }) => {
            const data = conv2DArrayToObject([...formData.entries()]);
            const userId = Number(data.user_id);
            const charId = Number(data.character_id);
            const column = Object.keys(data)[2];
            const value = Object.values(data)[2];

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    updateUserCtrlPanel(userId, charId, column, value);

                    switch (column) {
                        case 'name': {
                            $paginatedUsersData = $paginatedUsersData.map((user) => {
                                // 名前更新
                                user.characters = user.characters.map((character) => {
                                    const bounty = !character.discord?.bounty ? 0 : character.discord?.bounty - 50000;

                                    if (character.id === charId && character.discord)
                                        return {
                                            ...character,
                                            name: value,
                                            discord: {
                                                ...character.discord,
                                                bounty,
                                            },
                                        };

                                    return character;
                                });

                                return user;
                            });

                            break;
                        }

                        case 'bounty': {
                            $paginatedUsersData = $paginatedUsersData.map((user) => {
                                // バウンティコイン量を更新
                                user.characters = user.characters.map((character) => {
                                    if (character.id === charId && character.discord)
                                        return {
                                            ...character,
                                            discord: {
                                                ...character.discord,
                                                bounty: value,
                                            },
                                        };

                                    return character;
                                });

                                return user;
                            });

                            break;
                        }

                        case 'clan': {
                            $paginatedUsersData = $paginatedUsersData.map((user) => {
                                // ギルドキャラクターデータ削除
                                user.characters = user.characters.map((character) => {
                                    if (character.id === charId)
                                        return {
                                            ...character,
                                            guild_characters: null,
                                        };

                                    return character;
                                });

                                return user;
                            });

                            break;
                        }

                        case 'reupload_binary': {
                            break;
                        }

                        default: {
                            error(400, { message: '', message1: '', message2: [`Invalid column: ${column}.`], message3: undefined });
                        }
                    }
                }
            };
        }}
    >
        <input type="hidden" name="user_id" value={user.id} />
        <input type="hidden" name="character_id" value={$userCtrlPanel[user.id].selectedChar.id} />

        <dl class="console_contents_list">
            <dt class="contents_term">Character ID</dt>
            <dd class="contents_desc">{$userCtrlPanel[user.id].selectedChar.id}</dd>

            <dt class="contents_term">Name</dt>
            <dd class="contents_desc">
                {$userCtrlPanel[user.id].selectedChar.name ?? 'Ready to Hunt'}

                {#if $userCtrlPanel[user.id].activeCategories['name']}
                    <button type="button" class="red_btn" onclick={() => ($userCtrlPanel[user.id].activeCategories['name'] = false)}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button
                        type="button"
                        class="normal_btn"
                        onclick={() => {
                            $userCtrlPanel[user.id].activeCategories['name'] = true;
                            validName = true;
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if $userCtrlPanel[user.id].activeCategories['name']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Character Name</p>
                                <p class="console_contents_note">* 50K coins are automatically cut from the user's bounty coin owned.</p>
                                <p class="console_contents_note">
                                    * Empty isn't allowed, and only name containing the following characters is allowed:<br />
                                    <span style="color: rgb(125, 125, 125); border-bottom: 1px solid black;">
                                        ー Japanese: Hiragana, Katakana, Kanji<br />
                                        ー English: Uppercase, Lowercase, and Half-width digits<br />
                                        ー Symbols: &#33; &quot; &#35; &#36; &#37; &#38; &#39; &#40; &#41; &#42; &#43; &#44; &#45; &#46; &#47; &#58; &#59; &#60; &#61; &#62; &#63; &#64; &#91; &#92; &#93;
                                        &#94; &#95; &#96; &#123; &#124; &#125; &#126;<br />
                                    </span>
                                </p>

                                <dl class="edit_area_box_parts text">
                                    <dt>Enter new name</dt>
                                    <dd>
                                        <input
                                            type="text"
                                            name="name"
                                            value={$userCtrlPanel[user.id].selectedChar.name ?? 'Ready to Hunt'}
                                            oninput={(e) => (validName = validateInput(e))}
                                            autocomplete="off"
                                        />
                                        <input type="hidden" name="not_linked" value={!$userCtrlPanel[user.id].selectedChar.discord} />
                                        <input type="hidden" name="bounty_coin" value={$userCtrlPanel[user.id].selectedChar.discord?.bounty} />
                                    </dd>
                                </dl>

                                <button
                                    class="blue_btn"
                                    class:disabled_elm={!validName}
                                    type="submit"
                                    onclick={() => {
                                        $userCtrlPanel[user.id].activeCategories['name'] = false;
                                        $timeOut && closeMsgDisplay($timeOut);
                                        onSubmit.set(true);
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>

            <dt class="contents_term">Gender</dt>
            <dd class="contents_desc">{$userCtrlPanel[user.id].selectedChar.is_female ? 'Female' : 'Male'}</dd>

            <dt class="contents_term">HR</dt>
            <dd class="contents_desc">{convHrpToHr($userCtrlPanel[user.id].selectedChar.hrp)}</dd>

            <dt class="contents_term">GR</dt>
            <dd class="contents_desc">{$userCtrlPanel[user.id].selectedChar.gr}</dd>

            <dt class="contents_term">Weapon</dt>
            <dd class="contents_desc">
                [ {getWpnTypeByDec($userCtrlPanel[user.id].selectedChar.weapon_type, 'en')} ]
                <br />
                {#await getWpnNameByDec($userCtrlPanel[user.id].selectedChar.weapon_id, $userCtrlPanel[user.id].selectedChar.weapon_type, 'en')}
                    Loading...
                {:then wpnName}
                    {wpnName} ({decToLittleEndian($userCtrlPanel[user.id].selectedChar.weapon_id)})
                {/await}
            </dd>

            <dt class="contents_term">Last Login</dt>
            <dd class="contents_desc">
                {DateTime.fromSeconds($userCtrlPanel[user.id].selectedChar.last_login ?? 0)
                    .setZone(DateTime.local().zoneName)
                    .setLocale('en')
                    .toLocaleString({ year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </dd>

            <dt class="contents_term">Playtime</dt>
            <dd class="contents_desc">{secToTime($userCtrlPanel[user.id].selectedChar.playtime)}</dd>

            <dt class="contents_term">Bounty Coin</dt>
            <dd class="contents_desc">
                {#if !$userCtrlPanel[user.id].selectedChar.discord}
                    No account linked.
                {:else}
                    {$userCtrlPanel[user.id].selectedChar.discord?.bounty === 0 ? 'No coins.' : `${$userCtrlPanel[user.id].selectedChar.discord?.bounty} Coin(s)`}

                    {#if $userCtrlPanel[user.id].activeCategories['bounty']}
                        <button class="red_btn" type="button" onclick={() => ($userCtrlPanel[user.id].activeCategories['bounty'] = false)}>
                            <span class="btn_icon material-symbols-outlined">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" type="button" onclick={() => ($userCtrlPanel[user.id].activeCategories['bounty'] = true)}>
                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                    <div class="edit_area_box_wrapper">
                        {#if $userCtrlPanel[user.id].activeCategories['bounty']}
                            <div transition:slide class="edit_area_box">
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change the Quantity of Coins</p>
                                    <dl class="edit_area_box_parts text">
                                        <dt>Enter the quantity</dt>
                                        <dd>
                                            <input
                                                type="text"
                                                name="bounty"
                                                inputmode="numeric"
                                                pattern="\d*"
                                                value={!$userCtrlPanel[user.id].selectedChar.discord?.bounty ? null : $userCtrlPanel[user.id].selectedChar.discord?.bounty}
                                                placeholder="Enter the quantity"
                                            />
                                        </dd>
                                    </dl>

                                    <button
                                        class="blue_btn"
                                        type="submit"
                                        onclick={() => {
                                            onSubmit.set(true);
                                            $timeOut && closeMsgDisplay($timeOut);
                                            $userCtrlPanel[user.id].activeCategories['bounty'] = false;
                                        }}
                                    >
                                        <span class="btn_icon material-symbols-outlined">check</span>
                                        <span class="btn_text">Save</span>
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            </dd>

            <dt class="contents_term">Clan Name</dt>
            <dd class="contents_desc">
                {$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.name ?? 'None'}

                <!-- {#if $userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.name}
                    {#if $userCtrlPanel[user.id].activeCategories['clan']}
                        <button type="button" class="red_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['clan'] = false)}>
                            <span class="btn_icon material-symbols-outlined">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button type="button" class="normal_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['clan'] = true)}>
                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}
                {/if} -->

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if $userCtrlPanel[user.id].activeCategories['clan']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area enter">
                                <p class="edit_area_title">Leave the Clan</p>
                                <p class="console_contents_note">* If this character is the last one in the clan, the clan itself will also be automatically deleted.</p>

                                <input type="hidden" name="clan" />
                                <input type="hidden" name="clan_length" value={$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.guild_characters?.length} />
                                <input type="hidden" name="clan_id" value={$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.id} />
                                <input type="hidden" name="clan_name" value={$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.name} />

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        $userCtrlPanel[user.id].activeCategories['clan'] = false;
                                        $timeOut && closeMsgDisplay($timeOut);
                                        onSubmit.set(true);
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Leave</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>

            <dt class="contents_term">Binary Data</dt>
            <dd class="contents_desc">
                <!-- バイナリ再アップロード-->
                {#if $userCtrlPanel[user.id].activeCategories['reupload_binary']}
                    <button type="button" class="red_btn" onclick={() => ($userCtrlPanel[user.id].activeCategories['reupload_binary'] = false)}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button type="button" class="normal_btn" onclick={() => ($userCtrlPanel[user.id].activeCategories['reupload_binary'] = true)}>
                        <span class="btn_icon material-symbols-outlined">upload_file</span>
                        <span class="btn_text">Re-upload</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if $userCtrlPanel[user.id].activeCategories['reupload_binary']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area enter">
                                <p class="edit_area_title">Re-upload Binary Data</p>
                                <p class="console_contents_note">* Once re-uploaded, the original binary data will be overwritten.</p>
                                <p class="console_contents_note">
                                    * You can upload any file you want, as long as it's one of the 14 files listed below. The remaining files that aren't uploaded won't be changed. Of course,
                                    uploading all 14 files at once is no problem.
                                </p>
                                <p class="console_contents_note">
                                    * Each file must have the following name resspectively.<br /><span style="color: #7d7d7d; border-bottom: 1px solid black;">
                                        ー {@html validFileName.join('<br>ー ')}
                                    </span>
                                </p>
                                <dl class="edit_area_box_parts text">
                                    <dt>Select new files</dt>
                                    <dd>
                                        <input type="hidden" name="reupload_binary" />
                                        <input name="savedata" type="hidden" bind:value={binaryData['savedata.bin']} />
                                        <input name="decomyset" type="hidden" bind:value={binaryData['decomyset.bin']} />
                                        <input name="hunternavi" type="hidden" bind:value={binaryData['hunternavi.bin']} />
                                        <input name="otomoairou" type="hidden" bind:value={binaryData['otomoairou.bin']} />
                                        <input name="partner" type="hidden" bind:value={binaryData['partner.bin']} />
                                        <input name="platebox" type="hidden" bind:value={binaryData['platebox.bin']} />
                                        <input name="platedata" type="hidden" bind:value={binaryData['platedata.bin']} />
                                        <input name="platemyset" type="hidden" bind:value={binaryData['platemyset.bin']} />
                                        <input name="rengokudata" type="hidden" bind:value={binaryData['rengokudata.bin']} />
                                        <input name="savemercenary" type="hidden" bind:value={binaryData['savemercenary.bin']} />
                                        <input name="skin_hist" type="hidden" bind:value={binaryData['skinhist.bin']} />
                                        <input name="minidata" type="hidden" bind:value={binaryData['minidata.bin']} />
                                        <input name="scenariodata" type="hidden" bind:value={binaryData['scenariodata.bin']} />
                                        <input name="savefavoritequest" type="hidden" bind:value={binaryData['savefavoritequest.bin']} />
                                        <input name="file" id="save_file_input" type="file" onchange={convFileToUint8} accept=".bin" multiple />
                                    </dd>
                                </dl>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        $userCtrlPanel[user.id].activeCategories['reupload_binary'] = false;
                                        $timeOut && closeMsgDisplay($timeOut);
                                        onSubmit.set(true);
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- バイナリダウンロード -->
                <button
                    type="button"
                    class="normal_btn"
                    onclick={() =>
                        prepareModal('downloadBinary', {
                            title: `Are you sure you want to download ${$userCtrlPanel[user.id].selectedChar.name}'s binary data?`,
                            form_action: '', // formアクションは使用しない
                            char_id: $userCtrlPanel[user.id].selectedChar.id,
                            char_name: $userCtrlPanel[user.id].selectedChar.name,
                        })}
                >
                    <span class="btn_icon material-symbols-outlined">cloud_download</span>
                    <span class="btn_text">Download</span>
                </button>
            </dd>
        </dl>
    </form>
{/if}
