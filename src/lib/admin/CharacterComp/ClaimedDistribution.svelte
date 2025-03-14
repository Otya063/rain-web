<script lang="ts">
    import ScrollHint from 'scroll-hint';
    import { scrollPosition } from 'svelte-scrolling';
    import { Svroller } from 'svrollbar';
    import { applyAction, enhance } from '$app/forms';
    import { DistributionCategoryObj, type Distribution, type Replace } from '$types';
    import {
        claimedDistributions,
        closeMsgDisplay,
        msgClosed,
        onSubmit,
        timeOut,
        tooltip,
        tooltipWhenOverflowText,
        userDisplayState,
        adminTabValue,
        openDistributionEditField,
        distributionFilterText,
        Pager,
        generatePaginationBtn,
        paginatedUsersData,
        toggleFilterCheckbox,
        sortId,
    } from '$utils/client';

    interface Props {
        stage: number;
        scrollYBeforeClickClaimedDist: number;
        isMobile: boolean;
    }
    let { stage = $bindable(), scrollYBeforeClickClaimedDist = $bindable(), isMobile }: Props = $props();
    let selectedRowCount = $state(0); // 選択された削除行数
    let checkAll = $state(false); // 全行選択フラグ
    let isChecked: boolean[] = $state(new Array($claimedDistributions.data.length).fill(false)); // 各行選択状態
    let pager: Pager<Replace<Distribution, { deadline: string | null }>>;
    let currentPage = $state(1);
    let maxPage = $state(0);
    let filterType: 'id' | 'event_name' = $state('id');
    let claimedDistributionFilterText = $state('');
    let generatedPaginationBtn = $derived(generatePaginationBtn(currentPage, maxPage, 7)); // ページネーション用ボタン生成
    const distributionType: Record<string, number> = {
        Common: 0,
        Specific: 1,
    };
    let openTypeFilterCheckbox = $state(false);
    let selectedTypeFilterCheckbox: number[] = $state([0, 1]);
    let selectedCategoryFilterCheckbox: number[] = $state(Object.values(DistributionCategoryObj));

    pager = new Pager($claimedDistributions.data);
    pager.bindStore((data) =>
        claimedDistributions.update((store) => ({
            ...store,
            data,
        })),
    ); // 格納先ストアバインド
    maxPage = pager.max; // 最大ページ数設定

    // フィルター時リアクティブ処理
    $effect(() => {
        // 依存関係はclaimedDistributionFilterText、filterType
        pager.clearFilters(['exact_id', 'text_event_name']); // 既存のフィルターをクリア
        // filterTypeでフィルターするのは１つだけなので、クリアしないと混ざってしまう

        if (claimedDistributionFilterText) {
            if (filterType === 'id') {
                pager.filterExactMatch('id', Number(claimedDistributionFilterText));
            } else {
                pager.filterStringInclude('event_name', claimedDistributionFilterText.toLowerCase());
            }
        }

        currentPage = 1; // 初期ページ設定
        maxPage = pager.max; // 最大ページ数再設定
    });

    // 「表示ページ切替、フィルター、IDソート」時に、各処理リセット
    $effect(() => {
        // 依存関係は$claimedDistributions.data
        if ($claimedDistributions.data) {
            isChecked = new Array($claimedDistributions.data.length).fill(false); // 各行選択状態全解除
            checkAll = false; // 全行選択フラグリセット
            selectedRowCount = 0; // 選択された削除行数リセット
        }
    });

    // モバイル端末の場合、スクロールヒント出す
    if (isMobile) {
        setTimeout(() => {
            new ScrollHint('.console_contents_table_wrapper', {
                remainingTime: '5000', // ５秒後に自動消除
            });
        }, 500); // 少し実行をずらすことで、ヒントが最初チラつくのを防ぐ
    }

    console.log($claimedDistributions.data);
</script>

<button
    class="menu_btn claimed_distribution_back"
    type="button"
    onclick={() => {
        stage = 0;
        scrollPosition({ x: 0, y: scrollYBeforeClickClaimedDist }); // 配布物受取済み履歴ページ閲覧前の位置まで戻る
        scrollYBeforeClickClaimedDist = 0;
        claimedDistributions.set({ userId: 0, charId: 0, data: [] }); // リセット
    }}
>
    <span class="btn_icon material-symbols-outlined">arrow_back</span>
    <span class="btn_text">View User/Character</span>
</button>

<h2>
    <span class="material-symbols-outlined">schedule</span>
    Claimed Distributions
</h2>

<div class="console_contents">
    <form
        id="deleteClaimedDistribution"
        action="?/deleteClaimedDistribution"
        method="POST"
        use:enhance={({ formData }) => {
            const selectedIds: number[] = String(formData.get('selectedDistributionId')).split(',').map(Number);

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    pager.deleteItem(selectedIds); // pager更新データ動的反映
                    maxPage = pager.max; // 最大ページ数再設定
                    currentPage = Math.min(currentPage, pager.max); // 現在ページ数調整（最大ページ数を超えないよう）

                    // ストアpaginatedUsersDataのclaim_distributionプロパティから対象のものを削除
                    paginatedUsersData.update((users) =>
                        users.map((user) => {
                            if (user.id === $claimedDistributions.userId) {
                                return {
                                    ...user,
                                    characters: user.characters.map((character, index) => {
                                        if (index === $userDisplayState[user.id].selectedCharacterIndex) {
                                            return { ...character, claim_distribution: character.claim_distribution.filter((distribution) => !selectedIds.includes(distribution.id)) };
                                        } else {
                                            return character;
                                        }
                                    }),
                                };
                            } else {
                                return user;
                            }
                        }),
                    );
                }
            };
        }}
    >
        <input name="charId" type="hidden" value={$claimedDistributions.charId} />
        <input
            name="selectedDistributionId"
            type="hidden"
            value={isChecked
                .map((checked, i) => (checked ? $claimedDistributions.data[i] : -1))
                .filter((index) => index !== -1)
                .map((distribution) => distribution?.id)}
        /><!-- distribution?.idの理由：行選択後にページ切り替えを行うとundefinedになる -->
    </form>

    <div class="temp_operation_area">
        <label class="custom_select_box">
            <select bind:value={filterType}>
                <option value="id" title="The distribution ID.">ID</option>
                <option value="event_name" title="The distribution title.">Title</option>
            </select>
        </label>

        <label class="temp_operation_area_search">
            <span class="material-symbols-outlined">search</span>
            <input type="text" bind:value={claimedDistributionFilterText} placeholder="Keywords..." />
        </label>

        <button class="normal_btn" type="button" onclick={() => (openTypeFilterCheckbox = !openTypeFilterCheckbox)}>
            <span class="btn_icon material-symbols-outlined">filter_alt</span>
            <span class="btn_text">Filter</span>

            {#if openTypeFilterCheckbox}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <!-- チェックボックス押下時、th要素のonclickが実行されるのを防ぐためstopPropagation -->
                <fieldset class="filter_checkbox_wrapper" onclick={(e) => e.stopPropagation()}>
                    <Svroller width="100%" height="100%" alwaysVisible={true}>
                        <p>Type</p>
                        {#each Object.entries(distributionType) as [typeName, typeIndex]}
                            <label>
                                <input
                                    type="checkbox"
                                    name="type"
                                    value={typeIndex}
                                    checked={selectedTypeFilterCheckbox.includes(typeIndex)}
                                    onclick={(e) => {
                                        // 最後の一つのチェックを外そうとした場合、イベントキャンセル（チェックを外そうとした時、ここでのcheckedはfalseになる）
                                        if (selectedTypeFilterCheckbox.length <= 1 && !(e.target as HTMLInputElement).checked) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onchange={() => {
                                        selectedTypeFilterCheckbox = toggleFilterCheckbox(selectedTypeFilterCheckbox, typeIndex);
                                        pager.filterNumberArrInclude('type', selectedTypeFilterCheckbox);
                                        maxPage = pager.max; // 最大ページ数再設定
                                        currentPage = 1; // 現在ページリセット
                                    }}
                                />
                                {typeName}
                            </label>
                        {/each}

                        <p>Category</p>
                        {#each Object.entries(DistributionCategoryObj) as [catName, catIndex]}
                            <label>
                                <input
                                    type="checkbox"
                                    name="type"
                                    value={catIndex}
                                    checked={selectedCategoryFilterCheckbox.includes(catIndex)}
                                    onclick={(e) => {
                                        // 最後の一つのチェックを外そうとした場合、イベントキャンセル（チェックを外そうとした時、ここでのcheckedはfalseになる）
                                        if (selectedCategoryFilterCheckbox.length <= 1 && !(e.target as HTMLInputElement).checked) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onchange={() => {
                                        selectedCategoryFilterCheckbox = toggleFilterCheckbox(selectedCategoryFilterCheckbox, catIndex);
                                        pager.filterNumberArrInclude('category', selectedCategoryFilterCheckbox);
                                        maxPage = pager.max; // 最大ページ数再設定
                                        currentPage = 1; // 現在ページリセット
                                        openDistributionEditField.set([]); // 展開済み編集フィールドリセット
                                    }}
                                />
                                {catName}
                            </label>
                        {/each}
                    </Svroller>
                </fieldset>
            {/if}
        </button>

        <button
            form="deleteClaimedDistribution"
            class="red_btn"
            class:disabled_elm={selectedRowCount < 1}
            use:tooltip={isMobile ? '' : `Delete ${selectedRowCount} selected row(s).`}
            type="submit"
            onclick={() => {
                $timeOut && closeMsgDisplay($timeOut);
                onSubmit.set(true);
            }}
        >
            <span class="btn_icon material-symbols-outlined">delete</span>
            <span class="btn_text">Delete</span>
        </button>
    </div>

    <div class="console_contents_table_wrapper">
        <table class="console_contents_table" class:no_mobile_scroll={isMobile && !$claimedDistributions.data.length}>
            <thead class="console_contents_table_head distribution">
                <tr class="table_row" class:hide_text={!$claimedDistributions.data.length}>
                    <th class="console_contents_table_head_header select center">
                        <button
                            class="material-symbols-outlined"
                            type="button"
                            use:tooltip={isMobile ? '' : selectedRowCount >= 1 ? `Deselect ${selectedRowCount} row(s).` : 'Select all rows to delete.'}
                            onclick={() => {
                                if (!checkAll && selectedRowCount >= 1) {
                                    // 選択行全解除ボタンクリック時
                                    selectedRowCount = 0;
                                    isChecked = isChecked.map(() => false);
                                } else {
                                    // 全選択ボタン通常動作
                                    isChecked = isChecked.map(() => !checkAll);
                                    checkAll = !checkAll;
                                    selectedRowCount = checkAll ? isChecked.length : 0;
                                }
                            }}
                        >
                            {checkAll ? 'check_box' : selectedRowCount >= 1 ? 'indeterminate_check_box' : 'check_box_outline_blank'}
                        </button>
                    </th>

                    <th
                        class="console_contents_table_head_header id"
                        use:tooltip={$sortId}
                        onclick={() => {
                            pager.toggleSortOrder();
                        }}
                    >
                        ID

                        <span class="material-symbols-outlined">sort</span>
                    </th>

                    <th class="console_contents_table_head_header type">Type</th>

                    <th class="console_contents_table_head_header title">Title</th>

                    <th class="console_contents_table_head_header other" class:fixed={$claimedDistributions.data.length}></th>
                </tr>
            </thead>

            <tbody>
                {#each $claimedDistributions.data as claimedDistribution, i}
                    <tr class="table_row" class:selected={isChecked[i]}>
                        <td class="console_contents_table_data center">
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !isChecked[i] ? 'Select a row to delete.' : 'Deselect a row.'}
                                onclick={() => {
                                    isChecked[i] = !isChecked[i];
                                    isChecked[i] ? selectedRowCount++ : selectedRowCount--;

                                    if (checkAll && selectedRowCount === 0) {
                                        // 全選択時かつ、手動で選択行を全て解除した場合
                                        // 全選択フラグ折る
                                        checkAll = false;
                                    }
                                }}
                            >
                                {isChecked[i] ? 'check_box' : 'check_box_outline_blank'}
                            </button>
                        </td>

                        <td class="console_contents_table_data">{claimedDistribution.id}</td>

                        <td class="console_contents_table_data">{Object.keys(distributionType).find((key) => distributionType[key] === claimedDistribution.type)}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={claimedDistribution.event_name.replace(/~C(\d{2})/g, '')}>
                            {claimedDistribution.event_name.replace(/~C(\d{2})/g, '')}
                        </td>

                        <td class="console_contents_table_data" class:center={isMobile} class:fixed={$claimedDistributions.data.length}>
                            <button
                                class="material-symbols-outlined"
                                use:tooltip={isMobile ? '' : 'Jump to edit.'}
                                type="button"
                                onclick={() => {
                                    adminTabValue.set('distribution');
                                    distributionFilterText.set(String(claimedDistribution.id));
                                    openDistributionEditField.update(() => {
                                        return [claimedDistribution.id]; // 指定したIDの配布データへジャンプ、既に存在するIDは上書きする
                                    });
                                }}
                            >
                                visibility
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr class="table_row">
                        <td class="console_contents_table_data no_data" colspan="5">No claimed distribution data.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="pagination_btn_area">
        {#if $claimedDistributions.data.length}
            {#each generatedPaginationBtn as page}
                <button
                    class:pagination_btn={page !== '...'}
                    class:pagination_gap={page === '...'}
                    class:selected={currentPage === Number(page)}
                    class:disabled_elm={page === '...'}
                    onclick={() => {
                        if (currentPage !== Number(page)) {
                            // 選択中のボタン以外がonclick対象
                            pager.getContent(Number(page)); // ページ数に応じた表示内容に切り替え
                            currentPage = Number(page); // 現在ページ数更新
                        }
                    }}
                >
                    {page}
                </button>
            {/each}
        {/if}
    </div>
</div>

<!-- scroll-hint用cssインポート -->
<svelte:head>
    {#if isMobile}
        <link rel="stylesheet" href="https://unpkg.com/scroll-hint@latest/css/scroll-hint.css" />
    {/if}
</svelte:head>
