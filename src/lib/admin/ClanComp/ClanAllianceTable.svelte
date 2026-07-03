<script lang="ts">
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { fade } from 'svelte/transition';
    import { get } from 'svelte/store';
    import { onDestroy } from 'svelte';
    import { applyAction, enhance } from '$app/forms';
    import type { PaginatedAlliances, PaginatedClans, ClanAllianceMode, UpdatedAllianceData, ClanAllianceTableProps } from '$types';
    import {
        pagerClansData,
        lastSearchClansResult,
        pagerAlliancesData,
        lastSearchAlliancesResult,
        clanNameData,
        closeMsgDisplay,
        filterClanParam,
        filterClanValue,
        filterAllianceParam,
        filterAllianceValue,
        msgClosed,
        timeOut,
        onSubmit,
        tooltip,
        tooltipWhenOverflowText,
        sortId,
        Pager,
        generatePaginationBtn,
        handleCommonEditField,
        openModal,
    } from '$utils/client';
    import AllianceAllies from './AllianceAllies.svelte';

    let { isMobile }: ClanAllianceTableProps = $props();

    let clanBindedValue = $state('');
    let clanBindedParam = $state('clan_name');
    let allianceBindedValue = $state('');
    let allianceBindedParam = $state('alliance_name');
    let clanSearching = $state(false);
    let allianceSearching = $state(false);
    const adminCtrlTypes: { [key in 'clanFilter' | 'allianceFilter']: boolean } = $state({
        clanFilter: false,
        allianceFilter: false,
    });

    const adminCtrlSwitch = (type: 'clanFilter' | 'allianceFilter'): void => {
        const isOpen = adminCtrlTypes[type];
        Object.keys(adminCtrlTypes).forEach((k) => (adminCtrlTypes[k as typeof type] = false));
        if (!isOpen) {
            adminCtrlTypes[type] = true;
        }

        return;
    };

    let currentMode = $state<ClanAllianceMode>('none');

    // 猟団
    let clanPager = $state(new Pager<PaginatedClans>([]));
    let isChecked: boolean[] = $state([]);
    let checkAll = $state(false);
    let selectedCount = $state(0);
    let openClanEditField: number[] = $state([]);
    let clanFilterType: 'id' | 'name' = $state('name');
    let clanFilterText = $state('');

    // 同盟
    let alliancePager = $state(new Pager<PaginatedAlliances>([]));
    let isAllianceChecked: boolean[] = $state([]);
    let checkAllAlliance = $state(false);
    let selectedAllianceCount = $state(0);
    let openAllianceEditField: number[] = $state([]);
    let editingAllianceId = $state(0);
    let allianceFilterType = $state<'id' | 'name'>('name');
    let allianceFilterText = $state('');

    // 共有ページネーション
    let currentPage = $state(1);
    let clanMaxPage = $state(0);
    let allianceMaxPage = $state(0);
    let maxPage = $derived(currentMode === 'clan' ? clanMaxPage : currentMode === 'alliance' ? allianceMaxPage : 0);
    let generatedPaginationBtn = $derived(generatePaginationBtn(currentPage, maxPage, 7));
    let activeDataLength = $derived(currentMode === 'clan' ? $pagerClansData.length : currentMode === 'alliance' ? $pagerAlliancesData.length : 0);

    const initClanPager = (clans: PaginatedClans[]): void => {
        clanPager = new Pager(clans);
        clanPager.bindStore((data) => {
            pagerClansData.set(data);
        });
        clanMaxPage = clanPager.max;
        currentPage = 1;

        return;
    };

    const initAlliancePager = (alliances: PaginatedAlliances[]): void => {
        alliancePager = new Pager(alliances);
        alliancePager.bindStore((data) => {
            pagerAlliancesData.set(data);
        });
        allianceMaxPage = alliancePager.max;
        currentPage = 1;

        return;
    };

    const handleClanDelete = (): void => {
        const targets = $pagerClansData.filter((_, i) => isChecked[i]).map((c) => ({ id: c.id, name: c.name }));
        openModal('deleteClans', {
            label: 'deleteClans',
            clans: targets,
            onSuccess: (ids) => {
                clanPager.deleteItem(ids);
                lastSearchClansResult.set(clanPager.getItems());
                clanMaxPage = clanPager.max;
                currentPage = Math.min(currentPage, clanPager.max);
            },
        });

        return;
    };

    const handleClanRebuild = (): void => {
        const targets = $pagerClansData
            .filter((_, i) => isChecked[i])
            .map((c) => ({
                id: c.id,
                name: c.name,
                leaderName: c.leader_name,
                createdAt: c.created_at,
            }));
        openModal('rebuildClan', {
            label: 'rebuildClan',
            clans: targets,
            onSuccess: (results) => {
                for (const { oldId, newId } of results) {
                    clanPager.updateItem(oldId, (clan) => ({ ...clan, id: newId }));
                    openClanEditField = openClanEditField.filter((id) => id !== oldId);
                }

                lastSearchClansResult.set(clanPager.getItems());
            },
        });

        return;
    };

    const handleAllianceDelete = (): void => {
        const targets = $pagerAlliancesData.filter((_, i) => isAllianceChecked[i]).map((a) => ({ id: a.id, name: a.name }));
        openModal('deleteAlliance', {
            label: 'deleteAlliance',
            alliances: targets,
            onSuccess: (ids) => {
                alliancePager.deleteItem(ids);
                lastSearchAlliancesResult.set(alliancePager.getItems());
                allianceMaxPage = alliancePager.max;
                currentPage = Math.min(currentPage, alliancePager.max);
            },
        });

        return;
    };

    // フィルター時リアクティブ処理
    let filterInitialized = false;
    $effect(() => {
        clanPager.clearFilters(['exact_id', 'text_name']);
        if (clanFilterText) {
            if (clanFilterType === 'id') {
                clanPager.filterExactMatch('id', Number(clanFilterText));
            } else {
                clanPager.filterStringInclude('name', clanFilterText.toLowerCase());
            }
        }

        currentPage = 1;
        clanMaxPage = clanPager.max;
        if (filterInitialized) {
            openClanEditField = [];
        }

        filterInitialized = true;
    });

    let allianceFilterInitialized = false;
    $effect(() => {
        alliancePager.clearFilters(['exact_id', 'text_name']);
        if (allianceFilterText) {
            if (allianceFilterType === 'id') {
                alliancePager.filterExactMatch('id', Number(allianceFilterText));
            } else {
                alliancePager.filterStringInclude('name', allianceFilterText.toLowerCase());
            }
        }

        currentPage = 1;
        allianceMaxPage = alliancePager.max;
        if (allianceFilterInitialized) {
            openAllianceEditField = [];
        }

        allianceFilterInitialized = true;
    });

    $effect(() => {
        if ($pagerClansData) {
            isChecked = new Array($pagerClansData.length).fill(false);
            checkAll = false;
            selectedCount = 0;
        }
    });

    $effect(() => {
        if ($pagerAlliancesData) {
            isAllianceChecked = new Array($pagerAlliancesData.length).fill(false);
            checkAllAlliance = false;
            selectedAllianceCount = 0;
        }
    });

    // 前回の検索結果を復元（タブ切替後の再マウント時）
    const storedClans = get(lastSearchClansResult);
    const storedAlliances = get(lastSearchAlliancesResult);
    if (storedClans) {
        initClanPager(storedClans);
        currentMode = 'clan';
    } else if (storedAlliances) {
        initAlliancePager(storedAlliances);
        currentMode = 'alliance';
    }

    onDestroy(() => {
        const clanItems = clanPager.getItems();
        if (clanItems.length > 0) {
            lastSearchClansResult.set(clanItems);
        }

        const allianceItems = alliancePager.getItems();
        if (allianceItems.length > 0) {
            lastSearchAlliancesResult.set(allianceItems);
        }
    });
</script>

<div class="edit_area_box" style="margin-bottom: 2%;">
    <div class="edit_area enter">
        <p class="edit_area_title" style="margin: 0;">Control Panel</p>
        <div class="group_btns" class:disabled_elm={clanSearching || allianceSearching} style="margin-bottom: 30px;">
            <button class="blue_btn" type="button" onclick={() => adminCtrlSwitch('clanFilter')} class:active={adminCtrlTypes['clanFilter']}>
                <span class="btn_icon material-symbols-outlined">search</span>
                <span class="btn_text">Clan</span>
            </button>

            <button class="blue_btn" type="button" onclick={() => adminCtrlSwitch('allianceFilter')} class:active={adminCtrlTypes['allianceFilter']}>
                <span class="btn_icon material-symbols-outlined">search</span>
                <span class="btn_text">Alliance</span>
            </button>
        </div>

        {#if adminCtrlTypes['clanFilter']}
            <div class="edit_area_box_parts text ctrl_panel">
                <form
                    id="getPaginatedClans"
                    action="?/getPaginatedClans"
                    method="POST"
                    use:enhance={() => {
                        return async ({ result }) => {
                            await applyAction(result);
                            clanSearching = false;
                            if (result.type === 'success') {
                                const data = result.data as { searchedClans?: PaginatedClans[] };
                                if (data?.searchedClans) {
                                    initClanPager(data.searchedClans);
                                    lastSearchClansResult.set(data.searchedClans);
                                    currentMode = 'clan';
                                    openClanEditField = [];

                                    // Alliance側をリセット
                                    initAlliancePager([]);
                                    lastSearchAlliancesResult.set(undefined);
                                    openAllianceEditField = [];
                                    editingAllianceId = 0;
                                    isAllianceChecked = [];
                                    checkAllAlliance = false;
                                    selectedAllianceCount = 0;
                                    allianceFilterText = '';
                                }
                            } else {
                                msgClosed.set(false);
                            }
                        };
                    }}
                >
                    <input name="filter_value" type="hidden" value={$filterClanValue} />
                    <input name="filter_param" type="hidden" value={$filterClanParam} />

                    <div class="temp_operation_area" class:disabled_elm={clanSearching}>
                        <label class="custom_select_box">
                            <select bind:value={clanBindedParam}>
                                <option value="clan_name">Clan Name</option>
                                <option value="clan_id">Clan ID</option>
                            </select>
                        </label>

                        <label class="temp_operation_area_search">
                            <span class="material-symbols-outlined">search</span>
                            <input type="text" placeholder="Keywords..." bind:value={clanBindedValue} autocomplete="off" />
                        </label>
                    </div>
                </form>

                <button
                    class="green_btn"
                    class:loading_btn={clanSearching}
                    style={!clanSearching ? '' : 'cursor: not-allowed; pointer-events: none;'}
                    type="submit"
                    form="getPaginatedClans"
                    onclick={() => {
                        if (!clanSearching) {
                            clanSearching = true;
                            $timeOut && closeMsgDisplay($timeOut);
                            filterClanValue.set(clanBindedValue);
                            filterClanParam.set(clanBindedParam);
                        }
                    }}
                >
                    {#if clanSearching}
                        <span in:fade class="loading"></span>
                    {/if}
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Search</span>
                </button>
            </div>
        {/if}

        {#if adminCtrlTypes['allianceFilter']}
            <div class="edit_area_box_parts text ctrl_panel">
                <form
                    id="getPaginatedAlliances"
                    action="?/getPaginatedAlliances"
                    method="POST"
                    use:enhance={() => {
                        return async ({ result }) => {
                            await applyAction(result);
                            allianceSearching = false;
                            if (result.type === 'success') {
                                const data = result.data as { searchedAlliances?: PaginatedAlliances[]; clanNames?: string[] };
                                if (data?.searchedAlliances) {
                                    initAlliancePager(data.searchedAlliances);
                                    lastSearchAlliancesResult.set(data.searchedAlliances);
                                    currentMode = 'alliance';
                                    openAllianceEditField = [];
                                    editingAllianceId = 0;

                                    // Clan側をリセット
                                    initClanPager([]);
                                    lastSearchClansResult.set(undefined);
                                    openClanEditField = [];
                                    isChecked = [];
                                    checkAll = false;
                                    selectedCount = 0;
                                    clanFilterText = '';
                                }

                                if (data?.clanNames) {
                                    clanNameData.set(data.clanNames);
                                }
                            } else {
                                msgClosed.set(false);
                            }
                        };
                    }}
                >
                    <input name="filter_value" type="hidden" value={$filterAllianceValue} />
                    <input name="filter_param" type="hidden" value={$filterAllianceParam} />

                    <div class="temp_operation_area" class:disabled_elm={allianceSearching}>
                        <label class="custom_select_box">
                            <select bind:value={allianceBindedParam}>
                                <option value="alliance_name">Alliance Name</option>
                                <option value="alliance_id">Alliance ID</option>
                            </select>
                        </label>

                        <label class="temp_operation_area_search">
                            <span class="material-symbols-outlined">search</span>
                            <input type="text" placeholder="Keywords..." bind:value={allianceBindedValue} autocomplete="off" />
                        </label>
                    </div>
                </form>

                <button
                    class="green_btn"
                    class:loading_btn={allianceSearching}
                    style={!allianceSearching ? '' : 'cursor: not-allowed; pointer-events: none;'}
                    type="submit"
                    form="getPaginatedAlliances"
                    onclick={() => {
                        if (!allianceSearching) {
                            allianceSearching = true;
                            $timeOut && closeMsgDisplay($timeOut);
                            filterAllianceValue.set(allianceBindedValue);
                            filterAllianceParam.set(allianceBindedParam);
                        }
                    }}
                >
                    {#if allianceSearching}
                        <span in:fade class="loading"></span>
                    {/if}
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Search</span>
                </button>
            </div>
        {/if}
    </div>
</div>

{#if currentMode === 'clan'}
    <div class="temp_operation_area">
        <label class="custom_select_box">
            <select bind:value={clanFilterType}>
                <option value="name">Clan Name</option>
                <option value="id">Clan ID</option>
            </select>
        </label>

        <label class="temp_operation_area_search">
            <span class="material-symbols-outlined">search</span>
            <input type="text" bind:value={clanFilterText} placeholder="Keywords..." autocomplete="off" />
        </label>

        <button class="red_btn" class:disabled_elm={selectedCount === 0} type="button" onclick={handleClanRebuild}>
            <span class="btn_icon material-symbols-outlined">autorenew</span>
            <span class="btn_text">Rebuild</span>
        </button>

        <button class="red_btn" class:disabled_elm={selectedCount === 0} type="button" onclick={handleClanDelete}>
            <span class="btn_icon material-symbols-outlined">delete</span>
            <span class="btn_text">Delete</span>
        </button>
    </div>
{:else if currentMode === 'alliance'}
    <div class="temp_operation_area">
        <label class="custom_select_box">
            <select bind:value={allianceFilterType}>
                <option value="name">Alliance Name</option>
                <option value="id">Alliance ID</option>
            </select>
        </label>

        <label class="temp_operation_area_search">
            <span class="material-symbols-outlined">search</span>
            <input type="text" bind:value={allianceFilterText} placeholder="Keywords..." autocomplete="off" />
        </label>

        <button class="red_btn" class:disabled_elm={selectedAllianceCount === 0} type="button" onclick={handleAllianceDelete}>
            <span class="btn_icon material-symbols-outlined">delete</span>
            <span class="btn_text">Delete</span>
        </button>
    </div>
{/if}

<div class="console_contents_table_wrapper">
    <table class="console_contents_table" class:no_mobile_scroll={isMobile && !activeDataLength}>
        <thead class="console_contents_table_head" class:clan={currentMode === 'clan'} class:alliance={currentMode === 'alliance'}>
            {#if currentMode === 'clan'}
                <tr class="table_row" class:hide_text={!$pagerClansData.length}>
                    <th class="console_contents_table_head_header select center">
                        <button
                            class="material-symbols-outlined"
                            type="button"
                            use:tooltip={isMobile ? '' : selectedCount >= 1 ? `Deselect ${selectedCount} clan(s).` : 'Select all clans to delete / rebuild.'}
                            onclick={() => {
                                if (!checkAll && selectedCount >= 1) {
                                    selectedCount = 0;
                                    isChecked.fill(false);
                                } else if (!checkAll) {
                                    isChecked = $pagerClansData.map(() => true);
                                    selectedCount = isChecked.length;
                                    checkAll = selectedCount > 0;
                                } else {
                                    isChecked.fill(false);
                                    selectedCount = 0;
                                    checkAll = false;
                                }
                            }}
                        >
                            {checkAll ? 'check_box' : selectedCount >= 1 ? 'indeterminate_check_box' : 'check_box_outline_blank'}
                        </button>
                    </th>

                    <th
                        class="console_contents_table_head_header id"
                        use:tooltip={$sortId}
                        onclick={() => {
                            clanPager.toggleSortOrder();
                            openClanEditField = [];
                        }}
                    >
                        Clan ID
                        <span class="material-symbols-outlined">sort</span>
                    </th>

                    <th class="console_contents_table_head_header clan_name">Clan Name</th>

                    <th class="console_contents_table_head_header leader">Leader</th>

                    <th class="console_contents_table_head_header other" class:center={isMobile} class:fixed_column={$pagerClansData.length}>
                        {#if openClanEditField.length}
                            <button class="material-symbols-outlined" type="button" use:tooltip={isMobile ? '' : 'Collapse all edit fields.'} onclick={() => (openClanEditField = [])}>
                                collapse_all
                            </button>
                        {/if}
                    </th>
                </tr>
            {:else if currentMode === 'alliance'}
                <tr class="table_row" class:hide_text={!$pagerAlliancesData.length}>
                    <th class="console_contents_table_head_header select center">
                        <button
                            class="material-symbols-outlined"
                            type="button"
                            use:tooltip={isMobile ? '' : selectedAllianceCount >= 1 ? `Deselect ${selectedAllianceCount} alliance(s).` : 'Select all alliances to delete.'}
                            onclick={() => {
                                if (!checkAllAlliance && selectedAllianceCount >= 1) {
                                    selectedAllianceCount = 0;
                                    isAllianceChecked.fill(false);
                                } else if (!checkAllAlliance) {
                                    isAllianceChecked = $pagerAlliancesData.map(() => true);
                                    selectedAllianceCount = isAllianceChecked.length;
                                    checkAllAlliance = selectedAllianceCount > 0;
                                } else {
                                    isAllianceChecked.fill(false);
                                    selectedAllianceCount = 0;
                                    checkAllAlliance = false;
                                }
                            }}
                        >
                            {checkAllAlliance ? 'check_box' : selectedAllianceCount >= 1 ? 'indeterminate_check_box' : 'check_box_outline_blank'}
                        </button>
                    </th>

                    <th
                        class="console_contents_table_head_header id"
                        use:tooltip={$sortId}
                        onclick={() => {
                            alliancePager.toggleSortOrder();
                            openAllianceEditField = [];
                        }}
                    >
                        Alliance ID
                        <span class="material-symbols-outlined">sort</span>
                    </th>

                    <th class="console_contents_table_head_header alliance_name">Alliance Name</th>

                    <th class="console_contents_table_head_header other" class:center={isMobile} class:fixed_column={$pagerAlliancesData.length}>
                        {#if openAllianceEditField.length}
                            <button class="material-symbols-outlined" type="button" use:tooltip={isMobile ? '' : 'Collapse all edit fields.'} onclick={() => (openAllianceEditField = [])}>
                                collapse_all
                            </button>
                        {/if}
                    </th>
                </tr>
            {:else}
                <tr class="table_row hide_text">
                    <th class="console_contents_table_head_header id">ID</th>
                    <th class="console_contents_table_head_header clan_name">Name</th>
                    <th class="console_contents_table_head_header other"></th>
                </tr>
            {/if}
        </thead>

        <tbody>
            {#if currentMode === 'clan'}
                {#each $pagerClansData as clan, i}
                    <tr class="table_row" class:selected={isChecked[i]}>
                        <td class="console_contents_table_data center">
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !isChecked[i] ? 'Select a clan to delete / rebuild.' : 'Deselect a clan.'}
                                onclick={() => {
                                    isChecked[i] = !isChecked[i];
                                    isChecked[i] ? selectedCount++ : selectedCount--;
                                    checkAll = selectedCount === $pagerClansData.length && $pagerClansData.length > 0;
                                }}
                            >
                                {isChecked[i] ? 'check_box' : 'check_box_outline_blank'}
                            </button>
                        </td>

                        <td class="console_contents_table_data">{clan.id}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={clan.name ?? ''}>
                            {clan.name}
                        </td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={clan.leader_name ?? ''}>
                            {clan.leader_name}
                        </td>

                        <td class="console_contents_table_data center" class:fixed_column={$pagerClansData.length}>
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !openClanEditField.includes(clan.id) ? 'Show details.' : 'Hide details.'}
                                onclick={() => (openClanEditField = handleCommonEditField(openClanEditField, clan.id))}
                            >
                                {openClanEditField.includes(clan.id) ? 'close' : 'expand_circle_down'}
                            </button>
                        </td>
                    </tr>

                    {#if openClanEditField.includes(clan.id)}
                        <tr class="detail_row">
                            <td colspan="100">
                                <dl class="console_contents_list">
                                    <dt class="contents_term">Est.</dt>
                                    <dd class="contents_desc">
                                        {DateTime.fromJSDate(clan.created_at || new Date(0))
                                            .setZone(DateTime.local().zoneName)
                                            .setLocale('en')
                                            .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </dd>

                                    <dt class="contents_term">
                                        Members
                                        <span class="help_btn material-symbols-outlined" use:tooltip={'Format: Name (Character ID)'}>help</span>
                                    </dt>
                                    <dd class="contents_desc">
                                        <div class="clan_members">
                                            {#each _.sortBy(clan.guild_characters, 'order_index') as charData, j}
                                                {#if charData.characters}
                                                    <span>{j + 1}. {charData.characters.name || 'Unknown'} ({charData.characters.id})</span>
                                                {/if}
                                            {:else}
                                                No clan members found.
                                            {/each}
                                        </div>
                                    </dd>
                                </dl>
                            </td>
                        </tr>
                    {/if}
                {:else}
                    <tr class="table_row">
                        <td class="console_contents_table_data no_data" colspan="5">No clan data.</td>
                    </tr>
                {/each}
            {:else if currentMode === 'alliance'}
                {#each $pagerAlliancesData as alliance, i}
                    <tr class="table_row" class:selected={isAllianceChecked[i]}>
                        <td class="console_contents_table_data center">
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !isAllianceChecked[i] ? 'Select an alliance to delete.' : 'Deselect an alliance.'}
                                onclick={() => {
                                    isAllianceChecked[i] = !isAllianceChecked[i];
                                    isAllianceChecked[i] ? selectedAllianceCount++ : selectedAllianceCount--;
                                    checkAllAlliance = selectedAllianceCount === $pagerAlliancesData.length && $pagerAlliancesData.length > 0;
                                }}
                            >
                                {isAllianceChecked[i] ? 'check_box' : 'check_box_outline_blank'}
                            </button>
                        </td>

                        <td class="console_contents_table_data">{alliance.id}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={alliance.name}>
                            {alliance.name}
                        </td>

                        <td class="console_contents_table_data center" class:fixed_column={$pagerAlliancesData.length}>
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !openAllianceEditField.includes(alliance.id) ? 'Show details.' : 'Hide details.'}
                                onclick={() => {
                                    openAllianceEditField = handleCommonEditField(openAllianceEditField, alliance.id);
                                    if (!openAllianceEditField.includes(alliance.id)) {
                                        editingAllianceId = 0;
                                    }
                                }}
                            >
                                {#if openAllianceEditField.includes(alliance.id)}
                                    close
                                {:else}
                                    expand_circle_down
                                {/if}
                            </button>
                        </td>
                    </tr>

                    {#if openAllianceEditField.includes(alliance.id)}
                        <tr class="detail_row">
                            <td colspan="100">
                                <form
                                    action="?/updateAlliance"
                                    method="POST"
                                    use:enhance={() => {
                                        return async ({ result }) => {
                                            msgClosed.set(false);
                                            onSubmit.set(false);
                                            await applyAction(result);

                                            if (result.type === 'success' && result.data) {
                                                const updated = (result.data as { updatedAllianceData?: UpdatedAllianceData }).updatedAllianceData;
                                                if (updated) {
                                                    alliancePager.updateItem(updated.id, (a) => ({
                                                        ...a,
                                                        firstChildClan: updated.firstChildClan,
                                                        secondChildClan: updated.secondChildClan,
                                                    }));
                                                    lastSearchAlliancesResult.set(alliancePager.getItems());
                                                }
                                            }
                                        };
                                    }}
                                >
                                    <input type="hidden" name="alliance_id" value={alliance.id} />

                                    <dl class="console_contents_list">
                                        <dt class="contents_term">Est.</dt>
                                        <dd class="contents_desc">
                                            {DateTime.fromJSDate(alliance.created_at)
                                                .setZone(DateTime.local().zoneName)
                                                .setLocale('en')
                                                .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </dd>

                                        <dt class="contents_term">
                                            Allies
                                            <span
                                                class="help_btn material-symbols-outlined"
                                                use:tooltip={'<p>Option Format: [Clan ID] - Clan Name</p><p class="console_contents_note">* Due to site resource constraints, filter results are limited to 10 cases.</p>'}
                                                >help</span
                                            >
                                        </dt>
                                        <dd class="contents_desc">
                                            <dl class="console_contents_list nested">
                                                <dt class="contents_term">Parent Clan</dt>
                                                <dd class="contents_desc">{alliance.parentClan ?? 'No Clan'}</dd>

                                                <dt class="contents_term">1st Child Clan</dt>
                                                <dd class="contents_desc">
                                                    {#if editingAllianceId === alliance.id}
                                                        <AllianceAllies name="first_clan" clanNames={$clanNameData} {isMobile} initClanName={alliance.firstChildClan} />
                                                    {:else}
                                                        {alliance.firstChildClan ?? 'No Clan'}
                                                    {/if}
                                                </dd>

                                                <dt class="contents_term">2nd Child Clan</dt>
                                                <dd class="contents_desc">
                                                    {#if editingAllianceId === alliance.id}
                                                        <AllianceAllies name="second_clan" clanNames={$clanNameData} {isMobile} initClanName={alliance.secondChildClan} />
                                                    {:else}
                                                        {alliance.secondChildClan ?? 'No Clan'}
                                                    {/if}
                                                </dd>
                                            </dl>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingAllianceId === alliance.id}
                                                    <button class="red_btn" type="button" onclick={() => (editingAllianceId = 0)}>
                                                        <span class="btn_icon material-symbols-outlined">close</span>
                                                        <span class="btn_text">Cancel</span>
                                                    </button>
                                                    <button
                                                        class="blue_btn"
                                                        type="submit"
                                                        onclick={() => {
                                                            onSubmit.set(true);
                                                            $timeOut && closeMsgDisplay($timeOut);
                                                            setTimeout(() => {
                                                                editingAllianceId = 0;
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => (editingAllianceId = alliance.id)}>
                                                        <span class="btn_icon material-symbols-outlined">checklist_rtl</span>
                                                        <span class="btn_text">Set Allies</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>
                                    </dl>
                                </form>
                            </td>
                        </tr>
                    {/if}
                {:else}
                    <tr class="table_row">
                        <td class="console_contents_table_data no_data" colspan="4">No alliance data.</td>
                    </tr>
                {/each}
            {:else}
                <tr class="table_row">
                    <td class="console_contents_table_data no_data" colspan="3">Searched clan(s) / alliance(s) will be displayed here.</td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<div class="pagination_btn_area">
    {#if activeDataLength}
        {#each generatedPaginationBtn as page}
            <button
                class:pagination_btn={page !== '...'}
                class:pagination_gap={page === '...'}
                class:selected={currentPage === Number(page)}
                class:disabled_elm={page === '...'}
                onclick={() => {
                    if (currentPage !== Number(page)) {
                        if (currentMode === 'clan') {
                            clanPager.getContent(Number(page));
                            openClanEditField = [];
                        } else {
                            alliancePager.getContent(Number(page));
                            openAllianceEditField = [];
                        }
                        currentPage = Number(page);
                    }
                }}
            >
                {page}
            </button>
        {/each}
    {/if}
</div>
