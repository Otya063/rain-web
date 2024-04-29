<script lang="ts">
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
        convHrpToHr,
        filterAllianceValue,
        filterAllianceParam,
        onSubmit,
        clanNameData,
    } from '$lib/utils';
    import type { PaginatedAlliances, PaginatedClans, PaginationMeta } from '$lib/types';
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import Select from 'svelte-select';
    import { fade, slide } from 'svelte/transition';

    type UpdatedAllianceData = Pick<PaginatedAlliances, 'id' | 'first_child_clan' | 'second_child_clan'>;
    export let paginatedClans: PaginatedClans[];
    export let paginationClanMeta: PaginationMeta;
    export let paginatedAlliances: PaginatedAlliances[];
    export let paginationAllianceMeta: PaginationMeta;
    export let updatedAllianceData: UpdatedAllianceData;
    export let clanNames: string[];
    let paginationBackClick = false;
    let paginationNextClick = false;
    let clanBindedValue: string = '';
    let clanBindedParam: string;
    let allianceBindedValue: string = '';
    let allianceBindedParam: string;
    let clanStatus = 'init';
    let allianceStatus = 'init';
    let clanCursor = 0;
    let allianceCursor = 0;
    let btnStage = 1;

    /* Related to Edit Mode
    ====================================================*/
    let editingId: number;
    let editMode = false;
    const catTypes: { [key in 'allies']: boolean } = {
        allies: false,
    };
    const adminCtrlTypes: { [key in 'clanFilter' | 'allianceFilter']: boolean } = {
        clanFilter: false,
        allianceFilter: false,
    };

    // switch admin control contents
    const adminCtrlSwitch = (type: 'clanFilter' | 'allianceFilter'): void | false => {
        // check if another cat type is already open
        const activeCat = Object.values(adminCtrlTypes).some((boolean) => boolean === true);

        // if an open cat is clicked (try to close it), close it
        if (adminCtrlTypes[type]) {
            adminCtrlTypes[type] = false;

            return false;
        }

        // if there is an open cat and a different category is cliked (try to open it)
        if (activeCat) {
            // set everything to false (close) in a loop.
            Object.keys(adminCtrlTypes).forEach((_key) => {
                const key = _key as 'clanFilter' | 'allianceFilter';
                adminCtrlTypes[key] = false;
            });

            // set the category clicked to true (open)
            adminCtrlTypes[type] = true;

            return false;
        }

        // toggle true <-> false
        adminCtrlTypes[type] = !adminCtrlTypes[type];
    };

    const editModeSwitch = <T extends number, U extends 'allies'>(id: T, type: U): void | false => {
        // check if another category type is already in edit mode
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // when another normal_btn is pressed while editing, the editing target is switched
        if (activeCat && id !== 0) {
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as 'allies';
                catTypes[key] = false;
            });

            catTypes[type] = true;
            editingId = id;

            return false;
        }

        // toggle true <-> false
        if (!editMode) {
            // when editing
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // when finished editing
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
    };
</script>

<h2>
    <span class="material-icons">diversity_3</span>
    Clan List
</h2>

<div class="console_contents">
    <div id="admin_control" class="edit_area_box" style="margin-bottom: 2%;">
        <div class="edit_area enter">
            <p class="edit_area_title" style="margin: 0;">Admin Control Panel</p>
            <div class="group_btns" style="margin-bottom: 30px;">
                <button
                    class="blue_btn"
                    type="button"
                    on:click={() => {
                        adminCtrlSwitch('clanFilter');
                    }}
                    class:active={adminCtrlTypes['clanFilter']}
                >
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Filter Clan</span>
                </button>

                <button
                    class="blue_btn"
                    type="button"
                    on:click={() => {
                        adminCtrlSwitch('allianceFilter');
                    }}
                    class:active={adminCtrlTypes['allianceFilter']}
                >
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Filter Alliance</span>
                </button>
            </div>

            {#if adminCtrlTypes['clanFilter']}
                <div transition:slide class="edit_area_box_parts text admin_ctrl">
                    <form
                        id="getPaginatedClans"
                        class="filter_form"
                        action="?/getPaginatedClans"
                        method="POST"
                        use:enhance={() => {
                            // when clicking submit button
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
                                    msgClosed.set(false); // set false to display the message
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterClanValue} />
                        <input name="filter_param" type="hidden" value={$filterClanParam} />
                        <input name="status" type="hidden" bind:value={clanStatus} />

                        <input id="filter_input" type="text" placeholder="Filter ..." bind:value={clanBindedValue} />
                        <span>By</span>
                        <select class="filter_select" bind:value={clanBindedParam}>
                            <option value="clan_name">Clan Name</option>
                            <option value="clan_id">Clan ID</option>
                        </select>
                    </form>

                    <button
                        id="btn"
                        class="green_btn"
                        type="submit"
                        form="getPaginatedClans"
                        on:click={() => {
                            $timeOut && closeMsgDisplay($timeOut); // close when submit with message details open
                            filterClanValue.set(clanBindedValue);
                            filterClanParam.set(clanBindedParam);
                            clanStatus = 'init';
                        }}
                    >
                        {#if btnStage === 0}
                            <span in:fade class="loading"></span>
                        {:else if btnStage === 1}
                            <span in:fade={{ delay: 100 }} class="btn_icon material-icons">search</span>
                            <span in:fade={{ delay: 100 }} class="btn_text">Search</span>
                        {/if}
                    </button>
                </div>
            {/if}

            {#if adminCtrlTypes['allianceFilter']}
                <div transition:slide class="edit_area_box_parts text admin_ctrl">
                    <form
                        id="getPaginatedAlliances"
                        class="filter_form"
                        action="?/getPaginatedAlliances"
                        method="POST"
                        use:enhance={() => {
                            // when clicking submit button
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

                        <input id="filter_input" type="text" placeholder="Filter ..." bind:value={allianceBindedValue} />
                        <span>By</span>
                        <select class="filter_select" bind:value={allianceBindedParam}>
                            <option value="alliance_name">Alliance Name</option>
                            <option value="alliance_id">Alliance ID</option>
                        </select>
                    </form>

                    <button
                        id="btn"
                        class="green_btn"
                        type="submit"
                        form="getPaginatedAlliances"
                        on:click={() => {
                            $timeOut && closeMsgDisplay($timeOut);
                            filterAllianceValue.set(allianceBindedValue);
                            filterAllianceParam.set(allianceBindedParam);
                            allianceStatus = 'init';
                        }}
                    >
                        {#if btnStage === 0}
                            <span in:fade class="loading"></span>
                        {:else if btnStage === 1}
                            <span in:fade={{ delay: 100 }} class="btn_icon material-icons">search</span>
                            <span in:fade={{ delay: 100 }} class="btn_text">Search</span>
                        {/if}
                    </button>
                </div>
            {/if}
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
                            on:click={() => {
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
                            on:click={() => {
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
                    {clan.name}

                    <button
                        class="red_btn"
                        type="button"
                        on:click={() =>
                            prepareModal('rebuildClan', {
                                title: 'Rebuild the following clan?',
                                form_action: 'rebuildClan',
                                clan_id: clan.id,
                                clan_name: clan.name || 'NULL',
                                clan_leader: clan.leader_name || 'NULL',
                                created_at: clan.created_at,
                            })}
                    >
                        <span class="btn_icon material-icons">autorenew</span>
                        <span class="btn_text">Rebuild</span>
                    </button>
                </div>

                <dl class="console_contents_list">
                    <dt class="contents_term">Clan ID</dt>
                    <dd class="contents_desc">{clan.id}</dd>

                    <dt class="contents_term">Clan Name</dt>
                    <dd class="contents_desc">{clan.name}</dd>

                    <dt class="contents_term">Est.</dt>
                    <dd class="contents_desc">
                        {!clan.created_at
                            ? 'No Data'
                            : DateTime.fromJSDate(clan.created_at)
                                  .setZone(DateTime.local().zoneName)
                                  .setLocale('en')
                                  .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </dd>

                    <dt class="contents_term">Clan Leader</dt>
                    <dd class="contents_desc">{clan.leader_name}</dd>

                    <dt class="contents_term">Clan Members</dt>
                    <dd class="contents_desc">
                        <div class="clan_members">
                            {#if !clan.guild_characters.length}
                                No clan members found.
                            {:else}
                                {#each _.sortBy(clan.guild_characters, 'order_index') as charData, i}
                                    {#if !charData.characters}
                                        No clan members found.
                                    {:else}
                                        <span
                                            >{i + 1}. {charData.characters.name || 'Unknown'} [ HR: {convHrpToHr(charData.characters.hrp || 0)}, GR: {charData.characters.gr || 0} ]<br />Character ID: {charData
                                                .characters.id}</span
                                        >
                                    {/if}
                                {/each}
                            {/if}
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
                            on:click={() => {
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
                            on:click={() => {
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
                            on:click={() => {
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
                            on:click={() => {
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
                            msgClosed.set(false); // set false to display the message
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
                        <dt class="contents_term">Alliance ID</dt>
                        <dd class="contents_desc">{alliance.id}</dd>

                        <dt class="contents_term">Alliance Name</dt>
                        <dd class="contents_desc">{alliance.name}</dd>

                        <dt class="contents_term">Est.</dt>
                        <dd class="contents_desc">
                            {!alliance.created_at
                                ? 'No Data'
                                : DateTime.fromJSDate(alliance.created_at)
                                      .setZone(DateTime.local().zoneName)
                                      .setLocale('en')
                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </dd>

                        <dt class="contents_term">Allies Info</dt>
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
                                <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'allies')}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => editModeSwitch(alliance.id, 'allies')}>
                                    <span class="btn_icon material-icons">checklist_rtl</span>
                                    <span class="btn_text">Set Allies</span>
                                </button>
                            {/if}

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
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                // delay the change by 100ms to prevent "0" during submitting
                                                setTimeout(() => {
                                                    editModeSwitch(0, 'allies');
                                                }, 100);
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
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
                            on:click={() => {
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
                            on:click={() => {
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
