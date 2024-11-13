<script lang="ts">
    import type { distribution } from '@prisma/client/edge';
    import { DateTime } from 'luxon';
    import Select from 'svelte-select';
    import type { DistributionContentsType } from '$lib/types';
    import { getDistItemsData, getDistributionType, tooltip } from '$lib/utils';

    interface Props {
        distributions: Omit<distribution, 'data' | 'bot'>[];
    }
    let { distributions }: Props = $props();
    let filterText = $state('');
    let showDropdown = $state(false);
    let selectedContentsData = $state(['']);
    let filteredOption = $state(['']);
    let selectedContentsType = $state('');
    let filterCharId = $state('');
    let commonDistributions = distributions
        .sort((a, b) => {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            return 0;
        })
        .filter((d) => !d.character_id);
    let individualDistributions: Omit<distribution, 'data' | 'bot'>[] = $state([]);

    // 配布コンテンツ検索時ドロップダウンフィルター
    $effect(() => {
        if (filterText && selectedContentsData) {
            filteredOption = selectedContentsData.filter((e) => e.toLowerCase().includes(filterText.toLowerCase())).slice(0, 10);
        }
    });

    // 個人別配布物フィルター
    $effect(() => {
        if (filterCharId) {
            individualDistributions = distributions
                .sort((a, b) => {
                    if (a.id > b.id) return 1;
                    if (a.id < b.id) return -1;
                    return 0;
                })
                .filter((d) => String(d.character_id) === filterCharId);
        }
    });

    // 入力フィールド欄空白になったら選択肢消す
    $effect(() => {
        !filterText && (filteredOption = []);
    });
</script>

<div style="display: flex; align-items: center;">
    <select
        name=""
        id=""
        bind:value={selectedContentsType}
        onchange={async () => {
            selectedContentsData = Object.entries(await getDistItemsData(Number(selectedContentsType) as DistributionContentsType)).map(([key, value]) => `${key} - ${value}`);
        }}
    >
        <option value="" disabled selected style="display:none;">Select contents-type.</option>
        <option value="0">Leg Armor</option>
        <option value="1">Head Armor</option>
        <option value="2">Chest Armor</option>
        <option value="3">Arm Armor</option>
        <option value="4">Waist Armor</option>
        <option value="5">Melee Weapon</option>
        <option value="6">Ranged Weapon</option>
        <option value="7">Items</option>
    </select>

    <input class:disabled_elm={!selectedContentsData.length} type="text" bind:value={filterText} oninput={() => (showDropdown = true)} onfocus={() => (showDropdown = true)} placeholder="Filter..." />
    <div style="width: 30%;" class:disabled_elm={!(showDropdown && filteredOption.length > 0)}>
        <Select items={filteredOption} />
    </div>
</div>

<h2>
    <span class="material-symbols-outlined">package_2</span>
    Common

    <span class="help_btn material-symbols-outlined" use:tooltip={'Shows what was distributed to all characters.'}>help</span>
</h2>

<div class="console_contents">
    {#each commonDistributions as distribution}
        <p class="console_contents_list_title">Distribution Data ({distribution.id})</p>

        <dl class="console_contents_list">
            <dt class="contents_term">ID</dt>
            <dd class="contents_desc">{distribution.id}</dd>

            <dt class="contents_term">Type</dt>
            <dd class="contents_desc">{getDistributionType(distribution.type)}</dd>

            <dt class="contents_term">Title</dt>
            <dd class="contents_desc">{distribution.event_name}</dd>

            <dt class="contents_term">Deadline</dt>
            <dd class="contents_desc">
                {!distribution.deadline
                    ? 'No Deadline'
                    : DateTime.fromJSDate(distribution.deadline)
                          .setZone(DateTime.local().zoneName)
                          .setLocale('en')
                          .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </dd>

            <dt class="contents_term">Description</dt>
            <dd class="contents_desc">{distribution.description}</dd>
        </dl>
    {:else}
        <p class="console_contents_note">No Distributions Data</p>
    {/each}
</div>

<h2>
    <span class="material-symbols-outlined">package_2</span>
    Individual

    <span class="help_btn material-symbols-outlined" use:tooltip={'Shows what was distributed for each character.<br />(Filter by character-id, excluding Common distributions.)'}>help</span>

    <input style="font-size: 1.6rem; width: 60px;" type="text" bind:value={filterCharId} placeholder="ID" />
</h2>
<div class="console_contents">
    {#each individualDistributions as distribution}
        <p class="console_contents_list_title">Distribution Data ({distribution.id})</p>

        <dl class="console_contents_list">
            <dt class="contents_term">ID</dt>
            <dd class="contents_desc">{distribution.id}</dd>

            <dt class="contents_term">Type</dt>
            <dd class="contents_desc">{getDistributionType(distribution.type)}</dd>

            <dt class="contents_term">Title</dt>
            <dd class="contents_desc">{distribution.event_name}</dd>

            <dt class="contents_term">Character ID of<br />Distribution Target</dt>
            <dd class="contents_desc">{distribution.character_id}</dd>

            <dt class="contents_term">Deadline</dt>
            <dd class="contents_desc">
                {!distribution.deadline
                    ? 'No Deadline'
                    : DateTime.fromJSDate(distribution.deadline)
                          .setZone(DateTime.local().zoneName)
                          .setLocale('en')
                          .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </dd>

            <dt class="contents_term">Description</dt>
            <dd class="contents_desc">{distribution.description}</dd>
        </dl>
    {:else}
        {#if !filterCharId}
            <p class="console_contents_note">* Enter the character ID of the search target in the "ID" field above.</p>
        {:else}
            <p class="console_contents_note">No Distributions Data</p>
        {/if}
    {/each}
</div>
