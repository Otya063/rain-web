<script lang="ts">
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { fade, slide } from 'svelte/transition';
    import Select from 'svelte-select';
    import { applyAction, enhance } from '$app/forms';
    import {
        paginatedClansData,
        paginationClansMetaData,
        paginatedAlliancesData,
        paginationAlliancesMetaData,
        closeMsgDisplay,
        filterClanParam,
        filterClanValue,
        msgClosed,
        switchBtnInAuth,
        timeOut,
        prepareModal,
        consoleContDisable,
        filterAllianceValue,
        filterAllianceParam,
        onSubmit,
        clanNameData,
    } from '$lib/utils';
    import type { PaginatedAlliances, PaginatedClans, PaginationMeta } from '$lib/types';

    type UpdatedAllianceData = Pick<PaginatedAlliances, 'id' | 'first_child_clan' | 'second_child_clan'>;
    interface Props {
        paginatedClans: PaginatedClans[];
        paginationClanMeta: PaginationMeta;
        paginatedAlliances: PaginatedAlliances[];
        paginationAllianceMeta: PaginationMeta;
        updatedAllianceData: UpdatedAllianceData;
        clanNames: string[];
    }
    let { paginatedClans, paginationClanMeta, paginatedAlliances, paginationAllianceMeta, updatedAllianceData, clanNames }: Props = $props();
    let paginationBackClick = $state(false);
    let paginationNextClick = $state(false);
    let clanBindedValue: string = $state('');
    let clanBindedParam: string = $state('clan_name');
    let allianceBindedValue: string = $state('');
    let allianceBindedParam: string = $state('alliance_name');
    let clanStatus = $state('init');
    let allianceStatus = $state('init');
    let clanCursor = $state(0);
    let allianceCursor = $state(0);
    let btnStage = $state(1);
    let editingId: number = $state(0);
    let editMode = false;
    const catTypes: { [key in 'allies']: boolean } = $state({
        allies: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    const adminCtrlTypes: { [key in 'clanFilter' | 'allianceFilter']: boolean } = $state({
        clanFilter: false,
        allianceFilter: false,
    }); // 管理者コントロールパネル制御、state使用でスイッチできるように

    /**
     * 管理コントロールの内容を切り替える
     *
     * @param {('clanFilter' | 'allianceFilter')} type 切り替え対象のカテゴリタイプ
     */
    const adminCtrlSwitch = (type: 'clanFilter' | 'allianceFilter'): void => {
        // 別のカテゴリがすでに開かれているかを確認
        const activeCat = Object.values(adminCtrlTypes).some((boolean) => boolean === true);

        // 開かれているカテゴリがクリックされた場合、閉じる
        if (adminCtrlTypes[type]) {
            adminCtrlTypes[type] = false;

            return;
        }

        // 既に開かれているカテゴリがあり、異なるカテゴリがクリックされた場合
        if (activeCat) {
            // 全てのカテゴリを閉じる
            Object.keys(adminCtrlTypes).forEach((_key) => {
                const key = _key as 'clanFilter' | 'allianceFilter';
                adminCtrlTypes[key] = false;
            });

            // クリックされたカテゴリを開く
            adminCtrlTypes[type] = true;

            return;
        }

        // true ⇔ false に切り替える
        adminCtrlTypes[type] = !adminCtrlTypes[type];
    };

    /**
     * 編集モードを切り替える
     *
     * @template T 編集対象のIDの型（数値）
     * @template U 切り替え対象のカテゴリのタイプ（'allies'）
     * @param {T} id 編集対象のID
     * @param {U} type 切り替えたいカテゴリのタイプ
     */
    const editModeSwitch = <T extends number, U extends 'allies'>(id: T, type: U): void => {
        // 別のカテゴリがすでに編集中かを確認
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // 別の通常ボタンが編集中に押された場合、編集対象を切り替える
        if (activeCat && id !== 0) {
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as 'allies';
                catTypes[key] = false;
            });

            catTypes[type] = true;
            editingId = id;

            return;
        }

        // true ⇔ false に切り替える
        if (!editMode) {
            // 編集中
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // 編集終了
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
    };
</script>

<h2>
    <span class="material-symbols-outlined">diversity_3</span>
    Clan List
</h2>

<div class="console_contents">
    <!-- 「div.edit_area_box_wrapper」は必要ないが、スタイルの関係上ワラップしておく -->
    <div class="edit_area_box_wrapper">
        <div id="admin_control" class="edit_area_box" style="margin-bottom: 2%;">
            <div class="edit_area enter">
                <p class="edit_area_title" style="margin: 0;">Admin Control Panel</p>
                <div class="group_btns" style="margin-bottom: 30px;">
                    <button
                        class="blue_btn"
                        type="button"
                        onclick={() => {
                            adminCtrlSwitch('clanFilter');
                        }}
                        class:active={adminCtrlTypes['clanFilter']}
                    >
                        <span class="btn_icon material-symbols-outlined">search</span>
                        <span class="btn_text">Clan</span>
                    </button>

                    <button
                        class="blue_btn"
                        type="button"
                        onclick={() => {
                            adminCtrlSwitch('allianceFilter');
                        }}
                        class:active={adminCtrlTypes['allianceFilter']}
                    >
                        <span class="btn_icon material-symbols-outlined">search</span>
                        <span class="btn_text">Alliance</span>
                    </button>
                </div>

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if adminCtrlTypes['clanFilter']}
                        <div transition:slide class="edit_area_box_parts text admin_ctrl">
                            <form
                                id="getPaginatedClans"
                                class="filter_form"
                                action="?/getPaginatedClans"
                                method="POST"
                                use:enhance={() => {
                                    // 送信ボタンクリック時
                                    consoleContDisable(true);
                                    const btnElm = document.getElementById('btn');
                                    const inputElm = document.querySelectorAll('#filter_input');
                                    switchBtnInAuth(false, btnElm, null, inputElm);
                                    btnStage = 0;

                                    return async ({ result }) => {
                                        await applyAction(result);
                                        switchBtnInAuth(true, btnElm, null, inputElm);
                                        btnStage = 1;

                                        if (result.type === 'success') {
                                            paginatedAlliancesData.set(null);
                                            paginatedClansData.set(paginatedClans);
                                            paginationClansMetaData.set(paginationClanMeta);
                                        } else {
                                            msgClosed.set(false); // メッセージ表示のためfalse
                                        }

                                        consoleContDisable(false);
                                    };
                                }}
                            >
                                <input name="filter_value" type="hidden" value={$filterClanValue} />
                                <input name="filter_param" type="hidden" value={$filterClanParam} />
                                <input name="status" type="hidden" bind:value={clanStatus} />

                                <select class="filter_select" bind:value={clanBindedParam}>
                                    <option value="clan_name">Clan Name</option>
                                    <option value="clan_id">Clan ID</option>
                                </select>
                                ：
                                <input id="filter_input" type="text" placeholder="Filter value ..." bind:value={clanBindedValue} />
                            </form>

                            <button
                                id="btn"
                                class="green_btn"
                                type="submit"
                                form="getPaginatedClans"
                                onclick={() => {
                                    $timeOut && closeMsgDisplay($timeOut); // メッセージ詳細を開いたまま送信すると閉じる
                                    filterClanValue.set(clanBindedValue);
                                    filterClanParam.set(clanBindedParam);
                                    clanStatus = 'init';
                                }}
                            >
                                {#if btnStage === 0}
                                    <span in:fade class="loading"></span>
                                {:else if btnStage === 1}
                                    <span in:fade={{ delay: 100 }} class="btn_icon material-symbols-outlined">search</span>
                                    <span in:fade={{ delay: 100 }} class="btn_text">Search</span>
                                {/if}
                            </button>
                        </div>
                    {/if}
                </div>

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if adminCtrlTypes['allianceFilter']}
                        <div transition:slide class="edit_area_box_parts text admin_ctrl">
                            <form
                                id="getPaginatedAlliances"
                                class="filter_form"
                                action="?/getPaginatedAlliances"
                                method="POST"
                                use:enhance={() => {
                                    // 送信ボタンクリック時
                                    consoleContDisable(true);
                                    const btnElm = document.getElementById('btn');
                                    const inputElm = document.querySelectorAll('#filter_input');
                                    switchBtnInAuth(false, btnElm, null, inputElm);
                                    btnStage = 0;

                                    return async ({ result }) => {
                                        await applyAction(result);
                                        switchBtnInAuth(true, btnElm, null, inputElm);
                                        btnStage = 1;
                                        if (result.type === 'success') {
                                            paginatedClansData.set(null);
                                            paginatedAlliancesData.set(paginatedAlliances);
                                            paginationAlliancesMetaData.set(paginationAllianceMeta);
                                            clanNameData.set(clanNames);
                                        } else {
                                            msgClosed.set(false);
                                        }

                                        consoleContDisable(false);
                                    };
                                }}
                            >
                                <input name="filter_value" type="hidden" value={$filterAllianceValue} />
                                <input name="filter_param" type="hidden" value={$filterAllianceParam} />
                                <input name="status" type="hidden" bind:value={allianceStatus} />

                                <select class="filter_select" bind:value={allianceBindedParam}>
                                    <option value="alliance_name">Alliance Name</option>
                                    <option value="alliance_id">Alliance ID</option>
                                </select>
                                ：
                                <input id="filter_input" type="text" placeholder="Filter value ..." bind:value={allianceBindedValue} />
                            </form>

                            <button
                                id="btn"
                                class="green_btn"
                                type="submit"
                                form="getPaginatedAlliances"
                                onclick={() => {
                                    $timeOut && closeMsgDisplay($timeOut);
                                    filterAllianceValue.set(allianceBindedValue);
                                    filterAllianceParam.set(allianceBindedParam);
                                    allianceStatus = 'init';
                                }}
                            >
                                {#if btnStage === 0}
                                    <span in:fade class="loading"></span>
                                {:else if btnStage === 1}
                                    <span in:fade={{ delay: 100 }} class="btn_icon material-symbols-outlined">search</span>
                                    <span in:fade={{ delay: 100 }} class="btn_text">Search</span>
                                {/if}
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    {#if !$paginatedClansData && !$paginatedAlliancesData}
        <p class="console_contents_note">Searched clan(s) or alliance(s) will be displayed here.</p>
    {:else if $paginatedClansData || $paginatedAlliancesData}
        {#if $paginatedClansData}
            {#if $paginationClansMetaData.hasPrevPage || $paginationClansMetaData.hasNextPage}
                <div class="pagination_btn_list">
                    <form
                        method="POST"
                        action="?/getPaginatedClans"
                        use:enhance={() => {
                            consoleContDisable(true);

                            return async ({ result }) => {
                                paginationBackClick = false;
                                paginationNextClick = false;
                                await applyAction(result);

                                if (result.type === 'success') {
                                    paginatedAlliancesData.set(null);
                                    paginatedClansData.set(paginatedClans);
                                    paginationClansMetaData.set(paginationClanMeta);
                                } else {
                                    msgClosed.set(false);
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterClanValue} />
                        <input name="filter_param" type="hidden" value={$filterClanParam} />
                        <input name="status" type="hidden" bind:value={clanStatus} />
                        <input type="hidden" name="cursor" bind:value={clanCursor} />

                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationBackClick = true;
                                clanStatus = 'back';
                                clanCursor = $paginationClansMetaData.prevCursor;
                            }}
                            class:active={paginationBackClick}
                            class:disabled_elm={!$paginationClansMetaData.hasPrevPage}>Back</button
                        >
                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationNextClick = true;
                                clanStatus = 'next';
                                clanCursor = $paginationClansMetaData.nextCursor;
                            }}
                            class:active={paginationNextClick}
                            class:disabled_elm={!$paginationClansMetaData.hasNextPage}>Next</button
                        >
                    </form>
                </div>
            {/if}

            {#each $paginatedClansData as clan}
                <div class="console_contents_list_title clan_name">
                    Clan Data ({clan.id})

                    <button
                        class="red_btn"
                        type="button"
                        onclick={() =>
                            prepareModal('rebuildClan', {
                                title: 'Rebuild the following clan?',
                                form_action: 'rebuildClan',
                                clan_id: clan.id,
                                clan_name: clan.name || 'NULL',
                                clan_leader: clan.leader_name || 'NULL',
                                created_at: clan.created_at,
                            })}
                    >
                        <span class="btn_icon material-symbols-outlined">autorenew</span>
                        <span class="btn_text">Rebuild</span>
                    </button>
                </div>

                <dl class="console_contents_list">
                    <dt class="contents_term">ID</dt>
                    <dd class="contents_desc">{clan.id}</dd>

                    <dt class="contents_term">Name</dt>
                    <dd class="contents_desc">{clan.name}</dd>

                    <dt class="contents_term">Est.</dt>
                    <dd class="contents_desc">
                        {DateTime.fromJSDate(clan.created_at ?? new Date(0))
                            .setZone(DateTime.local().zoneName)
                            .setLocale('en')
                            .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </dd>

                    <dt class="contents_term">Leader</dt>
                    <dd class="contents_desc">{clan.leader_name}</dd>

                    <dt class="contents_term">Members</dt>
                    <dd class="contents_desc">
                        <div class="clan_members">
                            {#each _.sortBy(clan.guild_characters, 'order_index') as charData, i}
                                {#if charData.characters}
                                    <span>{i + 1}. {charData.characters.name || 'Unknown'} ({charData.characters.id})</span>
                                {/if}
                            {:else}
                                No clan members found.
                            {/each}
                        </div>
                    </dd>
                </dl>
            {/each}

            {#if $paginationClansMetaData.hasPrevPage || $paginationClansMetaData.hasNextPage}
                <div class="pagination_btn_list">
                    <form
                        method="POST"
                        action="?/getPaginatedClans"
                        use:enhance={() => {
                            consoleContDisable(true);

                            return async ({ result }) => {
                                paginationBackClick = false;
                                paginationNextClick = false;
                                await applyAction(result);

                                if (result.type === 'success') {
                                    paginatedAlliancesData.set(null);
                                    paginatedClansData.set(paginatedClans);
                                    paginationClansMetaData.set(paginationClanMeta);
                                } else {
                                    msgClosed.set(false);
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterClanValue} />
                        <input name="filter_param" type="hidden" value={$filterClanParam} />
                        <input name="status" type="hidden" bind:value={clanStatus} />
                        <input type="hidden" name="cursor" bind:value={clanCursor} />

                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationBackClick = true;
                                clanStatus = 'back';
                                clanCursor = $paginationClansMetaData.prevCursor;
                            }}
                            class:active={paginationBackClick}
                            class:disabled_elm={!$paginationClansMetaData.hasPrevPage}>Back</button
                        >
                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationNextClick = true;
                                clanStatus = 'next';
                                clanCursor = $paginationClansMetaData.nextCursor;
                            }}
                            class:active={paginationNextClick}
                            class:disabled_elm={!$paginationClansMetaData.hasNextPage}>Next</button
                        >
                    </form>
                </div>
            {/if}
        {:else if $paginatedAlliancesData}
            {#if $paginationAlliancesMetaData.hasPrevPage || $paginationAlliancesMetaData.hasNextPage}
                <div class="pagination_btn_list">
                    <form
                        method="POST"
                        action="?/getPaginatedAlliances"
                        use:enhance={() => {
                            consoleContDisable(true);

                            return async ({ result }) => {
                                paginationBackClick = false;
                                paginationNextClick = false;
                                await applyAction(result);

                                if (result.type === 'success') {
                                    paginatedClansData.set(null);
                                    paginatedAlliancesData.set(paginatedAlliances);
                                    paginationAlliancesMetaData.set(paginationAllianceMeta);
                                    clanNameData.set(clanNames);
                                } else {
                                    msgClosed.set(false);
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterAllianceValue} />
                        <input name="filter_param" type="hidden" value={$filterAllianceParam} />
                        <input name="status" type="hidden" bind:value={allianceStatus} />
                        <input type="hidden" name="cursor" bind:value={allianceCursor} />

                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationBackClick = true;
                                allianceStatus = 'back';
                                allianceCursor = $paginationAlliancesMetaData.prevCursor;
                            }}
                            class:active={paginationBackClick}
                            class:disabled_elm={!$paginationAlliancesMetaData.hasPrevPage}>Back</button
                        >
                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationNextClick = true;
                                allianceStatus = 'next';
                                allianceCursor = $paginationAlliancesMetaData.nextCursor;
                            }}
                            class:active={paginationNextClick}
                            class:disabled_elm={!$paginationAlliancesMetaData.hasNextPage}>Next</button
                        >
                    </form>
                </div>
            {/if}

            {#each $paginatedAlliancesData as alliance}
                <form
                    action="?/updateAllianceData"
                    method="POST"
                    use:enhance={() => {
                        return async ({ result }) => {
                            msgClosed.set(false); // メッセージ表示のためfalse
                            onSubmit.set(false);
                            await applyAction(result);

                            if (result.type === 'success' && $paginatedAlliancesData) {
                                $paginatedAlliancesData = $paginatedAlliancesData.map((alliance) => {
                                    if (alliance.id === updatedAllianceData.id)
                                        return {
                                            ...alliance,
                                            first_child_clan: updatedAllianceData.first_child_clan,
                                            second_child_clan: updatedAllianceData.second_child_clan,
                                        };

                                    return alliance;
                                });
                            }
                        };
                    }}
                >
                    <input type="hidden" name="alliance_id" value={editingId} />

                    <div class="console_contents_list_title clan_name">{alliance.name}</div>
                    <dl class="console_contents_list">
                        <dt class="contents_term">ID</dt>
                        <dd class="contents_desc">{alliance.id}</dd>

                        <dt class="contents_term">Name</dt>
                        <dd class="contents_desc">{alliance.name}</dd>

                        <dt class="contents_term">Est.</dt>
                        <dd class="contents_desc">
                            {DateTime.fromJSDate(alliance.created_at)
                                .setZone(DateTime.local().zoneName)
                                .setLocale('en')
                                .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </dd>

                        <dt class="contents_term">Allies</dt>
                        <dd class="contents_desc">
                            <div class="clan_members" style="width: 100%; margin: 0; grid-template-columns: repeat(1, 1fr);">
                                <p>
                                    <span style="font-weight: 700;">{'<'} Parent Clan {'>'}</span><br />
                                    Name: {alliance.parent_clan.clan_name}<br />
                                    Leader: {alliance.parent_clan.leader_name}
                                </p>

                                <p>
                                    <span style="font-weight: 700;">{'<'} 1st Child Clan {'>'}<br /></span>
                                    {#if alliance.first_child_clan.clan_name && alliance.first_child_clan.leader_name}
                                        Name: {alliance.first_child_clan.clan_name}<br />
                                        Leader: {alliance.first_child_clan.leader_name}
                                    {:else}
                                        No child clan found.
                                    {/if}
                                </p>

                                <p>
                                    <span style="font-weight: 700;">{'<'} 2nd Child Clan {'>'}<br /></span>
                                    {#if alliance.second_child_clan.clan_name && alliance.second_child_clan.leader_name}
                                        Name: {alliance.second_child_clan.clan_name}<br />
                                        Leader: {alliance.second_child_clan.leader_name}
                                    {:else}
                                        No child clan found.
                                    {/if}
                                </p>
                            </div>

                            {#if editingId === alliance.id && catTypes['allies']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'allies')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" onclick={() => editModeSwitch(alliance.id, 'allies')}>
                                    <span class="btn_icon material-symbols-outlined">checklist_rtl</span>
                                    <span class="btn_text">Set Allies</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === alliance.id && catTypes['allies']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Set Alliance Allies</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>1st child clan</dt>
                                                <dd>
                                                    <Select name="first_clan_name" items={$clanNameData} placeholder="Select 1st child clan." value={alliance.first_child_clan.clan_name} />
                                                </dd>
                                                <br />
                                                <br />
                                                <dt>2nd child clan</dt>
                                                <dd>
                                                    <Select name="second_clan_name" items={$clanNameData} placeholder="Select 2nd child clan." value={alliance.second_child_clan.clan_name} />
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                onclick={() => {
                                                    onSubmit.set(true);
                                                    $timeOut && closeMsgDisplay($timeOut);
                                                    editModeSwitch(0, 'allies');
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
                    </dl>
                </form>
            {/each}

            {#if $paginationAlliancesMetaData.hasPrevPage || $paginationAlliancesMetaData.hasNextPage}
                <div class="pagination_btn_list">
                    <form
                        method="POST"
                        action="?/getPaginatedAlliances"
                        use:enhance={() => {
                            consoleContDisable(true);

                            return async ({ result }) => {
                                paginationBackClick = false;
                                paginationNextClick = false;
                                await applyAction(result);

                                if (result.type === 'success') {
                                    paginatedClansData.set(null);
                                    paginatedAlliancesData.set(paginatedAlliances);
                                    paginationAlliancesMetaData.set(paginationAllianceMeta);
                                    clanNameData.set(clanNames);
                                } else {
                                    msgClosed.set(false);
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterAllianceValue} />
                        <input name="filter_param" type="hidden" value={$filterAllianceParam} />
                        <input name="status" type="hidden" bind:value={allianceStatus} />
                        <input type="hidden" name="cursor" bind:value={allianceCursor} />

                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationBackClick = true;
                                allianceStatus = 'back';
                                allianceCursor = $paginationAlliancesMetaData.prevCursor;
                            }}
                            class:active={paginationBackClick}
                            class:disabled_elm={!$paginationAlliancesMetaData.hasPrevPage}>Back</button
                        >
                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationNextClick = true;
                                allianceStatus = 'next';
                                allianceCursor = $paginationAlliancesMetaData.nextCursor;
                            }}
                            class:active={paginationNextClick}
                            class:disabled_elm={!$paginationAlliancesMetaData.hasNextPage}>Next</button
                        >
                    </form>
                </div>
            {/if}
        {/if}
    {/if}
</div>
