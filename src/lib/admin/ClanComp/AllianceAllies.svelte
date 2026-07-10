<script lang="ts">
    import { Svroller } from 'svrollbar';
    import type { AllianceAlliesProps } from '$types';

    let { name, clanNames, isMobile, initClanName }: AllianceAlliesProps = $props();
    let filterText = $state('');
    let showDropdown = $state(false);
    let filteredOptions = $state<string[]>([]);
    let submitText = $state('');

    filterText = submitText = initClanName ? (clanNames.find((e) => e.toLowerCase().includes(initClanName.toLowerCase())) ?? '') : '';

    const computeFiltered = (value: string): string[] => {
        return value ? clanNames.filter((e) => e.toLowerCase().includes(value.toLowerCase())).slice(0, 10) : [];
    };

    const handleOverflow = (el: HTMLElement, visible: boolean) => {
        if (!isMobile) {
            return;
        }

        const wrapper = el.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
        if (wrapper) {
            wrapper.style.overflow = visible ? 'visible' : 'hidden';
        }

        return;
    };
</script>

<div class="custom_select_with_filter_wrapper">
    <input type="hidden" {name} value={submitText} />
    <input
        class="custom_select_with_filter_input"
        type="text"
        value={filterText}
        name={null}
        autocomplete="off"
        oninput={(e) => {
            const val = e.currentTarget.value;
            filteredOptions = computeFiltered(val);
            if (!val) {
                submitText = '';
            }
        }}
        onfocus={(e) => {
            filteredOptions = computeFiltered(e.currentTarget.value);
            showDropdown = true;
            handleOverflow(e.currentTarget, true);
        }}
        onblur={(e) => {
            showDropdown = false;
            handleOverflow(e.currentTarget, false);
        }}
        placeholder="Filter clan..."
    />

    {#if showDropdown}
        <ul class="custom_select_with_filter">
            {#if filteredOptions.length > 0}
                <Svroller width="100%" alwaysVisible={true}>
                    {#each filteredOptions as option}
                        <!-- onblurイベントでshowDropdown=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                        <button
                            type="button"
                            class="custom_select_with_filter_item"
                            onmousedown={() => {
                                filterText = option;
                                submitText = option;
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
