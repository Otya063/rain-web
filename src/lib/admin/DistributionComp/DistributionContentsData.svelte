<script lang="ts">
    import { fade } from 'svelte/transition';
    import { Svroller } from 'svrollbar';
    import NumberInput from '$lib/common/NumberInput.svelte';
    import type { DistributionContentsType, DistributionContentsDataProps } from '$types';
    import { distributionContentsData, getDistItemsData, ManageDistribution } from '$utils/client';

    let { isMobile }: DistributionContentsDataProps = $props();
    let selectedDistributionContentsData: string[] = [];
    let distributionFilterOption = $state<string[]>([]);
    const contentsDataOptions = [
        { value: 65535, label: 'Select contents type.' },
        { value: 0, label: 'Leg Armor' },
        { value: 1, label: 'Head Armor' },
        { value: 2, label: 'Chest Armor' },
        { value: 3, label: 'Arm Armor' },
        { value: 4, label: 'Waist Armor' },
        { value: 5, label: 'Melee Weapon' },
        { value: 6, label: 'Ranged Weapon' },
        { value: 7, label: 'Items' },
        { value: 15, label: 'Poogie Outfit' },
        { value: 16, label: 'Restyle Point' },
    ];
</script>

<button
    class="green_btn add_item"
    type="button"
    onclick={() => {
        distributionContentsData.update((data) => [
            {
                item_data: {
                    code: '',
                    name: '',
                },
                types: 65535,
                amount: 1,
                disabled: false,
                showDropdown: false,
                selectedContentsType: 65535,
            },
            ...data,
        ]);
    }}
>
    <span class="btn_icon material-symbols-outlined">add</span>

    {#if !isMobile}
        <span class="btn_text">Add Dist. Contents</span>
    {/if}
</button>

<ul class="edit_area_box dist_list">
    <Svroller width="100%" height="100%" alwaysVisible={!isMobile}>
        {#each $distributionContentsData as content, i}
            {@const effectiveType = (content.selectedContentsType === 65535 ? content.types : content.selectedContentsType) as DistributionContentsType}
            <li class="dist_contents_data">
                <section class="dist_section" class:disabled_elm={content.disabled}>
                    <label class="custom_select_box">
                        <select
                            id={`${content.types}-${content.item_data.code}-[${content.item_data.name}]`}
                            bind:value={content.selectedContentsType}
                            onchange={(e) => {
                                const selectedValue = Number((e.target as HTMLSelectElement).value) as DistributionContentsType;
                                $distributionContentsData[i].amount = 1;
                                if (selectedValue === 16) {
                                    // イメチェンポイントの場合: リストから選ぶ処理が不要なので直接typesに代入
                                    $distributionContentsData[i].item_data.code = '0000';
                                    $distributionContentsData[i].item_data.name = 'Restyle Point';
                                    $distributionContentsData[i].types = 16;
                                    $distributionContentsData[i].selectedContentsType = 16;
                                } else {
                                    // selectedContentsTypeへ仮置きすることでcontent.typesと差別化し、type選択のみでsubmitした場合のアイテムタイプ不一致を防ぐ。typesへ代入するのはリストから選んだ時のみ
                                    $distributionContentsData[i].item_data.code = '';
                                    $distributionContentsData[i].item_data.name = '';
                                    $distributionContentsData[i].types = 65535;
                                    $distributionContentsData[i].selectedContentsType = selectedValue;
                                }
                            }}
                        >
                            {#each contentsDataOptions as opt}
                                <option value={opt.value} disabled={opt.value === 65535} style={opt.value === 65535 ? 'display: none;' : ''}>
                                    {opt.label}
                                </option>
                            {/each}
                        </select>
                    </label>

                    {#if effectiveType !== 16}
                        <div class="custom_select_with_filter_wrapper">
                            <input
                                class="custom_select_with_filter_input"
                                class:disabled_elm={content.selectedContentsType === 65535}
                                type="text"
                                value={content.item_data.name}
                                oninput={(ie) => {
                                    distributionFilterOption = !ie.currentTarget.value
                                        ? []
                                        : selectedDistributionContentsData.filter((e) => e.toLowerCase().includes(ie.currentTarget.value.toLowerCase())).slice(0, 10);
                                }}
                                onfocus={(fe) => {
                                    selectedDistributionContentsData = Object.entries(getDistItemsData(effectiveType)).map(([key, value]) => `${key} - ${value}`);
                                    distributionFilterOption = selectedDistributionContentsData.filter((e) => e.toLowerCase().includes(fe.currentTarget.value.toLowerCase())).slice(0, 10);
                                    $distributionContentsData[i].showDropdown = true;
                                }}
                                onblur={() => ($distributionContentsData[i].showDropdown = false)}
                                placeholder="Enter the content name."
                            />
                            {#if content.showDropdown}
                                <ul class="custom_select_with_filter">
                                    {#if distributionFilterOption.length > 0}
                                        <Svroller width="100%" alwaysVisible={true}>
                                            {#each distributionFilterOption as option}
                                                <!-- onblurイベントでshowDropdown=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                <button
                                                    type="button"
                                                    class="custom_select_with_filter_item"
                                                    onmousedown={(e) => {
                                                        const newName = (e.target as HTMLButtonElement).innerText.replace(/^\w{4} - /, '');
                                                        $distributionContentsData[i].types = effectiveType;
                                                        $distributionContentsData[i].item_data.name = newName;
                                                        $distributionContentsData[i].item_data.code = ManageDistribution.getCodeFromItemName(effectiveType, newName);
                                                    }}
                                                >
                                                    {option}
                                                </button>
                                            {/each}
                                        </Svroller>
                                    {:else}
                                        <li style="padding: 10px 20px;">No option.</li>
                                    {/if}
                                </ul>
                            {/if}
                        </div>
                    {/if}
                </section>

                <div class="dist_contents_data_btn_group">
                    <!-- コンソールに警告は出るが、bind:value={content.amount}でないと、select/inputを触った時に値がリセットされる -->
                    <NumberInput
                        name={`${content.types}-${content.item_data.code}-[${content.item_data.name}]`}
                        bind:value={content.amount}
                        max={999}
                        disabled={content.disabled || content.selectedContentsType === 65535}
                    />

                    <button
                        class="red_btn no_text"
                        class:active={content.disabled}
                        type="button"
                        aria-label="Delete Item"
                        onclick={() => ($distributionContentsData[i].disabled = !$distributionContentsData[i].disabled)}
                    >
                        {#if content.disabled}
                            <span in:fade={{ duration: 200, delay: 150 }} class="btn_icon material-symbols-outlined">undo</span>
                        {:else}
                            <span in:fade={{ duration: 200, delay: 150 }} class="btn_icon material-symbols-outlined">delete</span>
                        {/if}
                    </button>
                </div>
            </li>
        {:else}
            <p class="console_contents_note">Contents data not found.</p>
        {/each}
    </Svroller>
</ul>
