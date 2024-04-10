<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import {
        paginatedClansData,
        paginationClansMetaData,
        closeMsgDisplay,
        filterClanParam,
        filterClanValue,
        msgClosed,
        switchBtnInAuth,
        timeOut,
        prepareModal,
        consoleContDisable,
        convHrpToHr,
    } from '$lib/utils';
    import type { PaginatedClans, PaginationMeta } from '$lib/types';
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { fade, slide } from 'svelte/transition';

    export let paginatedClans: PaginatedClans[];
    export let paginationMeta: PaginationMeta;
    let paginationBackClick = false;
    let paginationNextClick = false;
    let bindedValue: string = '';
    let bindedParam: string;
    let status = 'init';
    let cursor = 0;
    let btnStage = 1;

    /* Related to Edit Mode
    ====================================================*/
    const adminCtrlTypes: { [key: string]: boolean } = {
        filter: false,
    };

    // switch admin control contents
    const adminCtrlSwitch = (type: string): void | false => {
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
            Object.keys(adminCtrlTypes).forEach((key) => {
                adminCtrlTypes[key] = false;
            });

            // set the category clicked to true (open)
            adminCtrlTypes[type] = true;

            return false;
        }

        // toggle true <-> false
        adminCtrlTypes[type] = !adminCtrlTypes[type];
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
                        adminCtrlSwitch('filter');
                    }}
                    class:active={adminCtrlTypes['filter']}
                >
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Filter</span>
                </button>
            </div>

            {#if adminCtrlTypes['filter']}
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
                                    paginatedClansData.set(paginatedClans);
                                    paginationClansMetaData.set(paginationMeta);
                                } else {
                                    msgClosed.set(false);
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterClanValue} />
                        <input name="filter_param" type="hidden" value={$filterClanParam} />
                        <input name="status" type="hidden" bind:value={status} />

                        <input id="filter_input" type="text" placeholder="Filter ..." bind:value={bindedValue} />
                        <span>By</span>
                        <select class="filter_select" bind:value={bindedParam}>
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
                            $timeOut && closeMsgDisplay($timeOut);
                            filterClanValue.set(bindedValue);
                            filterClanParam.set(bindedParam);
                            status = 'init';
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

    {#if !$paginatedClansData}
        <p class="console_contents_note">Searched clan(s) will be displayed here.</p>
    {:else}
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
                                paginatedClansData.set(paginatedClans);
                                paginationClansMetaData.set(paginationMeta);
                            }

                            consoleContDisable(false);
                        };
                    }}
                >
                    <input name="filter_value" type="hidden" value={$filterClanValue} />
                    <input name="filter_param" type="hidden" value={$filterClanParam} />
                    <input name="status" type="hidden" bind:value={status} />
                    <input type="hidden" name="cursor" bind:value={cursor} />

                    <button
                        class="pagination_btn_item"
                        type="submit"
                        on:click={() => {
                            $timeOut && closeMsgDisplay($timeOut);
                            paginationBackClick = true;
                            status = 'back';
                            cursor = $paginationClansMetaData.prevCursor;
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
                            status = 'next';
                            cursor = $paginationClansMetaData.nextCursor;
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
                        {#each _.sortBy(clan.guild_characters, 'order_index') as charData, i}
                            {#if charData.characters}
                                <span>{i + 1}. {charData.characters.name || 'Unknown'} [ HR: {convHrpToHr(charData.characters.hrp || 0)}, GR: {charData.characters.gr || 0} ]<br />Character ID: {charData
                                        .characters.id}</span
                                >
                            {/if}
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
                                paginatedClansData.set(paginatedClans);
                                paginationClansMetaData.set(paginationMeta);
                            }

                            consoleContDisable(false);
                        };
                    }}
                >
                    <input name="filter_value" type="hidden" value={$filterClanValue} />
                    <input name="filter_param" type="hidden" value={$filterClanParam} />
                    <input name="status" type="hidden" bind:value={status} />
                    <input type="hidden" name="cursor" bind:value={cursor} />

                    <button
                        class="pagination_btn_item"
                        type="submit"
                        on:click={() => {
                            $timeOut && closeMsgDisplay($timeOut);
                            paginationBackClick = true;
                            status = 'back';
                            cursor = $paginationClansMetaData.prevCursor;
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
                            status = 'next';
                            cursor = $paginationClansMetaData.nextCursor;
                        }}
                        class:active={paginationNextClick}
                        class:disabled_elm={!$paginationClansMetaData.hasNextPage}>Next</button
                    >
                </form>
            </div>
        {/if}
    {/if}
</div>
