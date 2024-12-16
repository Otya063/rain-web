<script lang="ts">
    import { Svroller } from 'svrollbar';

    interface Props {
        name: string;
        clanNames: string[];
        isMobile: boolean;
        initClanName: string | null;
    }
    let { name, clanNames, isMobile, initClanName }: Props = $props();
    let filterText = $state('');
    let showDropdown = $state(false);
    let filteredOption = $state(['']);
    let submitText = $state(''); // サーバー側に送信される実際の文字列で、リストアイテムをクリックした時のみ代入される

    // クランがある場合の初期設定
    filterText = submitText = initClanName ? clanNames.filter((e) => e.toLowerCase().includes(initClanName.toLowerCase()))[0] : '';
</script>

<div class="select_area">
    <input type="hidden" {name} value={submitText} />
    <input
        type="text"
        value={filterText}
        name={null}
        oninput={(ie) => {
            filteredOption = !ie.currentTarget.value ? [] : clanNames.filter((e) => e.toLowerCase().includes(ie.currentTarget.value.toLowerCase())).slice(0, 10);

            // 入力値空になったら送信データ削除
            if (!ie.currentTarget.value) {
                submitText = '';
            }
        }}
        onfocus={(fe) => {
            filteredOption = !fe.currentTarget.value ? [] : clanNames.filter((e) => e.toLowerCase().includes(fe.currentTarget.value.toLowerCase())).slice(0, 10);
            showDropdown = true;

            // モバイル端末ではedit_area_box_wrapper->hiddenによりリストが切れてしまうため、表示中はvisibleに変更
            const wrapper = fe.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
            if (isMobile && wrapper) {
                wrapper.style.overflow = 'visible';
            }
        }}
        onblur={(fe) => {
            showDropdown = false;

            // モバイル端末ではedit_area_box_wrapper->hiddenによりリストが切れてしまうため、表示中はvisibleに変更
            const wrapper = fe.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
            if (isMobile && wrapper) {
                wrapper.style.overflow = 'hidden';
            }
        }}
        placeholder="Filter clan..."
    />

    {#if showDropdown}
        <div class="select_area_list">
            {#if filteredOption.length > 0}
                <Svroller width="100%" alwaysVisible={true}>
                    {#each filteredOption as option}
                        <!-- onblurイベントでshowDropdown=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                        <button
                            type="button"
                            class="select_area_list_item"
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
                <p style="padding: 10px 20px;">No option.</p>
            {/if}
        </div>
    {/if}
</div>
