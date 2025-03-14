<script lang="ts">
    import { DateTime } from 'luxon';
    import { slide } from 'svelte/transition';
    import type { SwiperContainer } from 'swiper/element';
    import { applyAction, enhance } from '$app/forms';
    import { type CharacterEditableItemType, type User, type UserEditableItemType, BinaryTypesArray } from '$types';
    import {
        openModal,
        onSubmit,
        decToLittleEndian,
        getWpnTypeByDec,
        getWpnNameByDec,
        msgClosed,
        timeOut,
        closeMsgDisplay,
        conv2DArrayToObject,
        userDisplayState,
        updatePaginatedUsersData,
        convHrpToHr,
        validateCharName,
        secToTime,
        tooltip,
        claimedDistributions,
    } from '$utils/client';

    interface Props {
        user: User;
        stage: number;
        scrollY: number;
        scrollYBeforeClickClaimedDist: number;
        catTypes: Record<UserEditableItemType, boolean>;
        editingId: number;
        handleEditModeSwitch: (userId: number, type: UserEditableItemType) => void;
    }
    let { user, stage = $bindable(), scrollY = $bindable(), scrollYBeforeClickClaimedDist = $bindable(), catTypes, editingId, handleEditModeSwitch }: Props = $props();
    let validName = $state(true);
    // const catTypes: Record<CharacterEditableItemType, boolean> = $state({
    //     name: false,
    //     bounty: false,
    //     clan: false,
    //     reupload_binary: false,
    // }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    // let editingId: number = $state(0); // 編集対象のキャラクターID
    let selectedCharacterIndex = $state(0);

    /**
     * 編集モードを切り替える
     *
     * @param {number} charId 編集対象のキャラクターID
     * @param {CharacterEditableItemType} type 切り替えたいカテゴリのタイプ
     */
    // const editModeSwitch = (charId: number, type: CharacterEditableItemType): void => {
    //     // 別のカテゴリが既に表示中かどうか
    //     const isAnyActive = Object.values(catTypes).some((isActive) => isActive);

    //     if (isAnyActive && charId !== 0) {
    //         // 既に別のカテゴリが表示中の場合、編集対象切り替え
    //         Object.keys(catTypes).forEach((key) => {
    //             catTypes[key as CharacterEditableItemType] = false;
    //         });

    //         catTypes[type] = true;
    //         editingId = charId;
    //     } else {
    //         // 通常時、開閉トグル
    //         catTypes[type] = !catTypes[type]; // トグル
    //         editingId = catTypes[type] ? charId : 0; // 非表示ならIDリセット
    //     }
    // };

    // ストアuserDisplayStateが更新されたら、selectedCharacterIndexの値を自動更新
    $effect(() => {
        const userState = $userDisplayState[user.id];
        if (userState) {
            selectedCharacterIndex = userState.selectedCharacterIndex;
        }
    });
</script>

<!-- initial-slideを設定してそれがデフォルトインデックス（0）以外の場合は、onswiperslidechangeイベントがコンポーネントマウント時自動発火する -->
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
    initial-slide={$userDisplayState[user.id].selectedCharacterIndex}
    onswiperslidechange={(e: Event) => {
        const swiperContainerElm = e.target as SwiperContainer; // スワイプ中のswiper-containerを取得

        if (swiperContainerElm.swiper) {
            // 選択キャラクターのインデックス登録（ページ切り替え後も選択したキャラクターから変わらないようにするため）
            userDisplayState.update((data) => {
                const userState = data[user.id];

                return {
                    ...data,
                    [user.id]: {
                        ...userState,
                        selectedCharacterIndex: swiperContainerElm.swiper.activeIndex,
                    },
                };
            });
        }
    }}
>
    {#each user.characters as character}
        <swiper-slide>
            <div class="character_item {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}" class:new={character.is_new_character}>
                <span class="name">{character.name || 'Ready to Hunt'}</span>

                {#if !character.linked_discord_id}
                    <button
                        class="green_btn"
                        type="button"
                        onclick={() =>
                            openModal('linkDiscord', {
                                label: 'linkDiscord',
                                type: 0,
                                userId: user.id,
                                username: user.username,
                                charId: character.id,
                                charName: character.name || 'Ready to Hunt',
                            })}
                    >
                        <span class="btn_icon material-symbols-outlined">link</span>
                        <span class="btn_text">Link</span>
                    </button>
                {:else}
                    <button
                        class="green_btn linked_character"
                        type="button"
                        onclick={() =>
                            openModal('linkDiscord', {
                                label: 'linkDiscord',
                                type: 1,
                                userId: user.id,
                                username: user.username,
                                charId: character.id,
                                charName: character.name || 'Ready to Hunt',
                                discordId: character.linked_discord_id,
                            })}
                    >
                        <span class="btn_icon material-symbols-outlined">link</span>
                        <span class="btn_text">Unlink</span>
                    </button>
                {/if}

                {#if !character.is_new_character}
                    <div class="wpn_icon {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}"></div>

                    <div class="wpn_text">
                        <p>{getWpnTypeByDec(character.weapon_type, 'en')}</p>
                        <p>{getWpnNameByDec(character.weapon_id, character.weapon_type)}</p>
                    </div>

                    {#if character.deleted}
                        <button
                            class="red_btn deleted_character"
                            type="button"
                            onclick={() =>
                                openModal('deleteCharacter', {
                                    label: 'deleteCharacter',
                                    type: 1,
                                    charId: character.id,
                                    charName: character.name || 'Ready to Hunt',
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
                                openModal('deleteCharacter', {
                                    label: 'deleteCharacter',
                                    type: 0,
                                    charId: character.id,
                                    charName: character.name || 'Ready to Hunt',
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

<form
    action="?/updateCharacterData"
    method="POST"
    enctype="multipart/form-data"
    use:enhance={({ formData }) => {
        const data = conv2DArrayToObject([...formData.entries()]);
        const column = Object.keys(data)[2] as CharacterEditableItemType;
        const value = Object.values(data)[2];

        return async ({ result }) => {
            msgClosed.set(false);
            onSubmit.set(false);
            await applyAction(result);

            if (result.type === 'success') {
                updatePaginatedUsersData(user.id, column, value);
            }
        };
    }}
>
    <input type="hidden" name="user_id" value={user.id} />
    <input type="hidden" name="character_id" value={user.characters[selectedCharacterIndex].id} />

    <dl class="console_contents_list">
        <dt class="contents_term">Character ID</dt>
        <dd class="contents_desc">{user.characters[selectedCharacterIndex].id}</dd>

        <dt class="contents_term">
            Name
            <!-- 新規作成キャラクターもしくはアカウント未連携時、エラーマーク表示 -->
            {#if user.characters[selectedCharacterIndex].is_new_character || !user.characters[selectedCharacterIndex].linked_discord_id}
                <span
                    class="help_btn material-symbols-outlined"
                    use:tooltip={user.characters[selectedCharacterIndex].is_new_character
                        ? 'This character is newly created.'
                        : !user.characters[selectedCharacterIndex].linked_discord_id
                          ? "This character isn't linked to a discord account."
                          : ''}
                >
                    error
                </span>
            {/if}
        </dt>
        <dd class="contents_desc">
            {user.characters[selectedCharacterIndex].name || 'Ready to Hunt'}

            <!-- 新規作成キャラクターでなくアカウント連携済みなら変更可能 -->
            {#if !user.characters[selectedCharacterIndex].is_new_character && user.characters[selectedCharacterIndex].linked_discord_id}
                {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['name']}
                    <button type="button" class="red_btn" onclick={() => handleEditModeSwitch(0, 'name')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button
                        type="button"
                        class="normal_btn"
                        onclick={() => {
                            handleEditModeSwitch(user.characters[selectedCharacterIndex].id, 'name');
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}
            {/if}

            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
            <div class="edit_area_box_wrapper">
                {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['name']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area enter">
                            <p class="edit_area_title">Change Character Name</p>
                            <p class="console_contents_note">* 50K coins are automatically cut from the user's bounty coin owned.</p>
                            <p class="console_contents_note">
                                * Empty isn't allowed, and only name containing the following characters is allowed:<br />
                                <span style="color: rgb(125, 125, 125); border-bottom: 1px solid black;">
                                    ー Japanese: Hiragana, Katakana, Kanji<br />
                                    ー English: Uppercase, Lowercase, and Half-width digits<br />
                                    ー Symbols: &#33; &quot; &#35; &#36; &#37; &#38; &#39; &#40; &#41; &#42; &#43; &#44; &#45; &#46; &#47; &#58; &#59; &#60; &#61; &#62; &#63; &#64; &#91; &#92; &#93; &#94;
                                    &#95; &#96; &#123; &#124; &#125; &#126;<br />
                                </span>
                            </p>

                            <dl class="edit_area_box_parts text">
                                <dt>Enter new name</dt>
                                <dd>
                                    <input
                                        type="text"
                                        name="name"
                                        value={user.characters[selectedCharacterIndex].name || 'Ready to Hunt'}
                                        oninput={(e) => (validName = validateCharName(e))}
                                        autocomplete="off"
                                    />
                                    <input type="hidden" name="discord_id" value={user.characters[selectedCharacterIndex].linked_discord_id} />
                                    <input type="hidden" name="bounty_coin" value={user.characters[selectedCharacterIndex].bounty_coin} />
                                </dd>
                            </dl>

                            <button
                                class="blue_btn"
                                class:disabled_elm={!validName}
                                type="submit"
                                onclick={() => {
                                    $timeOut && closeMsgDisplay($timeOut);
                                    onSubmit.set(true);
                                    handleEditModeSwitch(0, 'name'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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
        <dd class="contents_desc">{user.characters[selectedCharacterIndex].is_female ? 'Female' : 'Male'}</dd>

        <dt class="contents_term">HR</dt>
        <dd class="contents_desc">{convHrpToHr(user.characters[selectedCharacterIndex].hrp)}</dd>

        <dt class="contents_term">GR</dt>
        <dd class="contents_desc">{user.characters[selectedCharacterIndex].gr}</dd>

        <dt class="contents_term">Weapon</dt>
        <dd class="contents_desc">
            {#if user.characters[selectedCharacterIndex].is_new_character}
                No weapon data.
            {:else}
                [ {getWpnTypeByDec(user.characters[selectedCharacterIndex].weapon_type, 'en')} ]
                <br />

                {getWpnNameByDec(user.characters[selectedCharacterIndex].weapon_id, user.characters[selectedCharacterIndex].weapon_type)} ({decToLittleEndian(
                    user.characters[selectedCharacterIndex].weapon_id,
                )})
            {/if}
        </dd>

        <dt class="contents_term">Last Login</dt>
        <dd class="contents_desc">
            {DateTime.fromSeconds(user.characters[selectedCharacterIndex].last_login || 0)
                .setZone(DateTime.local().zoneName)
                .setLocale('en')
                .toLocaleString({ year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </dd>

        <dt class="contents_term">Playtime</dt>
        <dd class="contents_desc">{secToTime(user.characters[selectedCharacterIndex].playtime)}</dd>

        <dt class="contents_term">Bounty Coin</dt>
        <dd class="contents_desc">
            {#if !user.characters[selectedCharacterIndex].linked_discord_id}
                No account linked.
            {:else}
                {user.characters[selectedCharacterIndex].bounty_coin === 0 || !user.characters[selectedCharacterIndex].bounty_coin
                    ? 'No coins.'
                    : `${user.characters[selectedCharacterIndex].bounty_coin} Coin(s)`}

                {#if !user.characters[selectedCharacterIndex].is_new_character}
                    {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['bounty']}
                        <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'bounty')}>
                            <span class="btn_icon material-symbols-outlined">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.characters[selectedCharacterIndex].id, 'bounty')}>
                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['bounty']}
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
                                            value={user.characters[selectedCharacterIndex].bounty_coin === 0 ? null : user.characters[selectedCharacterIndex].bounty_coin}
                                            placeholder="Enter the quantity."
                                        />
                                    </dd>
                                </dl>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        handleEditModeSwitch(0, 'bounty'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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
            {user.characters[selectedCharacterIndex].clan.name || 'No joined clan.'}

            <!--
            {#if user.characters[selectedCharacterIndex].clan.name}
                {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['clan']}
                    <button type="button" class="red_btn" onclick={() => editModeSwitch(0, 'clan')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button type="button" class="normal_btn" onclick={() => editModeSwitch(user.characters[selectedCharacterIndex].id, 'clan')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}
            {/if}
            -->

            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
            <div class="edit_area_box_wrapper">
                {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['clan']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area enter">
                            <p class="edit_area_title">Leave the Clan</p>
                            <p class="console_contents_note">* If this character is the last one in the clan, the clan itself will also be automatically deleted.</p>

                            <input type="hidden" name="clan" />
                            <input type="hidden" name="clan_length" value={user.characters[selectedCharacterIndex].clan.members} />
                            <input type="hidden" name="clan_id" value={user.characters[selectedCharacterIndex].clan.id} />
                            <input type="hidden" name="clan_name" value={user.characters[selectedCharacterIndex].clan.name} />

                            <button
                                class="blue_btn"
                                type="submit"
                                onclick={() => {
                                    $timeOut && closeMsgDisplay($timeOut);
                                    onSubmit.set(true);
                                    handleEditModeSwitch(0, 'clan'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

        {#if !user.characters[selectedCharacterIndex].is_new_character}
            <dt class="contents_term">Binary Data</dt>
            <dd class="contents_desc">
                <!-- バイナリ再アップロード-->
                {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['reupload_binary']}
                    <button type="button" class="red_btn" onclick={() => handleEditModeSwitch(0, 'reupload_binary')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button type="button" class="normal_btn" onclick={() => handleEditModeSwitch(user.characters[selectedCharacterIndex].id, 'reupload_binary')}>
                        <span class="btn_icon material-symbols-outlined">upload_file</span>
                        <span class="btn_text">Re-upload</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if editingId === user.characters[selectedCharacterIndex].id && catTypes['reupload_binary']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area enter">
                                <p class="edit_area_title">
                                    Re-upload Binary Data
                                    <span
                                        class="help_btn material-symbols-outlined"
                                        use:tooltip={`<p>Up to 14 files can be uploaded at a time.</p><p class="console_contents_note">* Each file name must match the following string:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(2, 1fr);">${BinaryTypesArray.map((type) => `<span>- ${type}</span>`).join('')}</p>`}
                                        >help</span
                                    >
                                </p>

                                <dl class="edit_area_box_parts text">
                                    <dt>Select new files</dt>
                                    <dd>
                                        <input type="hidden" name="reupload_binary" />
                                        <input name="file" id="save_file_input" type="file" accept=".bin" multiple />
                                    </dd>
                                </dl>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        $timeOut && closeMsgDisplay($timeOut);
                                        onSubmit.set(true);
                                        handleEditModeSwitch(0, 'reupload_binary'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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
                        openModal('downloadBinary', {
                            label: 'downloadBinary',
                            charId: user.characters[selectedCharacterIndex].id,
                            charName: user.characters[selectedCharacterIndex].name || 'Ready to Hunt',
                        })}
                >
                    <span class="btn_icon material-symbols-outlined">cloud_download</span>
                    <span class="btn_text">Download</span>
                </button>
            </dd>
        {/if}

        <dt class="contents_term">Claimed Distribution</dt>
        <dd class="contents_desc">
            {#if !user.characters[selectedCharacterIndex].claim_distribution}
                No claimed distributions.
            {:else}
                <button
                    type="button"
                    class="normal_btn"
                    onclick={() => {
                        scrollYBeforeClickClaimedDist = scrollY;
                        claimedDistributions.set({
                            userId: user.id,
                            charId: user.characters[selectedCharacterIndex].id,
                            data: user.characters[selectedCharacterIndex].claim_distribution,
                        });
                        // scrollTop(); // トップまで移動
                        stage = 1;
                    }}
                >
                    <span class="btn_icon material-symbols-outlined">pageview</span>
                    <span class="btn_text">View</span>
                </button>
            {/if}
        </dd>
    </dl>
</form>
