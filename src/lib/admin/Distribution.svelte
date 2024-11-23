<script lang="ts">
    import { Svroller } from 'svrollbar';
    import type { Distribution, DistributionContentsType } from '$types';
    import { getDistItemsData } from '$utils/client';
    import DistributionList from './DistributionList.svelte';

    interface Props {
        distributions: Distribution[];
    }
    let { distributions }: Props = $props();
    let filterText = $state('');
    let showDropdown = $state(false);
    let selectedContentsData = $state(['']);
    let filteredOption = $state(['']);
    let selectedContentsType = $state('');

    // 配布コンテンツ検索時ドロップダウンフィルター
    $effect(() => {
        if (filterText && selectedContentsData) {
            filteredOption = selectedContentsData.filter((e) => e.toLowerCase().includes(filterText.toLowerCase())).slice(0, 10);
        }
    });

    // 入力フィールド欄空白になったら選択肢消す
    $effect(() => {
        !filterText && (filteredOption = []);
    });
</script>

<section class="dist_section">
    <select
        name=""
        id=""
        bind:value={selectedContentsType}
        onchange={() => {
            selectedContentsData = Object.entries(getDistItemsData(Number(selectedContentsType) as DistributionContentsType)).map(([key, value]) => `${key} - ${value}`);
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
        <option value="15">Poogie Outfit</option>
    </select>

    <div class="dist_select_area">
        <input
            class:disabled_elm={!selectedContentsType}
            type="text"
            bind:value={filterText}
            oninput={() => (showDropdown = true)}
            onfocus={() => (showDropdown = true)}
            onblur={() => (showDropdown = false)}
            placeholder="Filter value..."
        />

        {#if showDropdown}
            <ul class="dist_select_area_list">
                {#if filteredOption.length > 0}
                    <Svroller width="100%" alwaysVisible={true}>
                        {#each filteredOption as option}
                            <li class="dist_select_area_list_item">
                                {option}
                            </li>
                        {/each}
                    </Svroller>
                {:else}
                    <li style="padding: 10px 20px;">No option.</li>
                {/if}
            </ul>
        {/if}
    </div>
</section>

<DistributionList title="Common" helpText="Shows what was distributed to all characters." {distributions} />

<DistributionList title="Individual" helpText="Shows what was distributed for each character.<br />(Filter by character-id, excluding Common distributions.)" {distributions} showCharacterId={true} />
