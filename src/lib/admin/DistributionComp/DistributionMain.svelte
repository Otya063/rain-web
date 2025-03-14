<script lang="ts">
    import { DateTime } from 'luxon';
    import ScrollHint from 'scroll-hint';
    import { onDestroy } from 'svelte';
    import { slide } from 'svelte/transition';
    import { scrollPosition } from 'svelte-scrolling';
    import { Svroller } from 'svrollbar';
    import { applyAction, enhance } from '$app/forms';
    import NumberInput from '$lib/common/NumberInput.svelte';
    import { DistributionCategoryObj, type DistributionEditableItemType } from '$types';
    import {
        closeMsgDisplay,
        tooltip,
        convertColorString,
        conv2DArrayToObject,
        msgClosed,
        onSubmit,
        getDistributionCategoryName,
        ManageDistribution,
        timeOut,
        convHrpToHr,
        distributionContentsData,
        openModal,
        updateAllDistributionData,
        allDistributionData,
        Pager,
        tooltipWhenOverflowText,
        distributionFilterText,
        openDistributionEditField,
        insertTextAtCursor,
        handleKeyDownInTextArea,
        generatePaginationBtn,
        handleDistributionEditField,
        preventHorizScrollOnDetailRow,
        dateTimeJSTBase,
        distributionPagerInstance,
        encodeToShiftJIS,
        editModeSwitch,
        toggleFilterCheckbox,
        pagerDistributionData,
        sortId,
    } from '$utils/client';
    import DistributionContentsData from './DistributionContentsData.svelte';

    interface Props {
        charactersIdName: string[];
        isMobile: boolean;
        updatedContentsData?: string;
        distAddMode: boolean;
    }
    let { charactersIdName, isMobile, updatedContentsData, distAddMode = $bindable(false) }: Props = $props();
    let filterType: 'id' | 'event_name' | 'character_id' = $state('id');
    let editingId: number = $state(0); // 編集対象の配布ID
    let catTypes: Record<DistributionEditableItemType, boolean> = $state({
        character_id: false,
        category: false,
        deadline: false,
        event_name: false,
        description: false,
        times_acceptable: false,
        min_hr: false,
        max_hr: false,
        min_sr: false,
        max_sr: false,
        min_gr: false,
        max_gr: false,
        data: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    let previewTitle = $state('');
    let previewDeadline = $state('');
    let isValidPreviewTitle = $state(true);
    let inputElement: HTMLInputElement | undefined = $state();
    let isInputFocused = $state(false);
    const colorPalette = {
        'White': '00',
        'Black': '01',
        'Red': '02',
        'Green': '03',
        'Cyan': '04',
        'Yellow': '05',
        'Orange': '06',
        'Pink': '07',
        'Blue': '16',
    };
    let targetCharShowDropdown = $state(false);
    let targetCharFilteredOption = $state(['']);
    const noReq = 'No Requirement'; // Scope of Distributionの条件なしテキスト
    let scrollY = $state(0);
    let scrollYBeforeOpenData = $state(0); // コンテンツデータ表示前にスクロール位置を保存（submit後にメニュー閉じて位置がずれるため）
    let previewDescription = $state('');
    let textAreaElement: HTMLTextAreaElement | undefined = $state();
    let mobileSubmitDescHtml = $derived(previewDescription.replace(/<br>/g, '\n')); // モバイル用提出HTML文字列、PCはエディターを使用する
    let currentPage = $state(1);
    let maxPage = $state(0);
    let selectedRowCount = $state(0); // 選択された削除行数
    let checkAll = $state(false); // 全行選択フラグ
    let isChecked: boolean[] = $state(new Array($pagerDistributionData.length).fill(false)); // 各行選択状態
    let generatedPaginationBtn = $derived(generatePaginationBtn(currentPage, maxPage, 7)); // ページネーション用ボタン生成
    let submitMobileTitle = $derived(convertColorString('colorNum', previewTitle, 'event_name'));
    const distributionType: Record<string, number> = {
        Common: 0,
        Specific: 1,
    };
    let openTypeFilterCheckbox = $state(false);
    let selectedTypeFilterCheckbox: number[] = $state([0, 1]);
    let selectedCategoryFilterCheckbox: number[] = $state(Object.values(DistributionCategoryObj));

    /**
     * 編集モードを切り替える
     *
     * @param {number} distId 編集対象の配布ID
     * @param {DistributionEditableItemType} type 切り替えたいカテゴリのタイプ
     */
    const handleEditModeSwitch = (distId: number, type: DistributionEditableItemType): void => {
        const { updatedCatTypes, updatedEditingId } = editModeSwitch<typeof type>(distId, type, catTypes);
        catTypes = updatedCatTypes;
        editingId = updatedEditingId;
    };

    distributionPagerInstance.set(new Pager($allDistributionData));
    $distributionPagerInstance.bindStore((data) => pagerDistributionData.set(data)); // 格納先ストアバインド
    maxPage = $distributionPagerInstance.max; // 最大ページ数設定

    // フィルター時リアクティブ処理
    $effect(() => {
        // 依存関係は$distributionFilterText、filterType
        $distributionPagerInstance.clearFilters(['exact_id', 'exact_character_id', 'text_event_name']); // 既存のフィルターをクリア
        // filterTypeでフィルターするのは１つだけなので、クリアしないと混ざってしまう

        if ($distributionFilterText) {
            if (filterType === 'id' || filterType === 'character_id') {
                $distributionPagerInstance.filterExactMatch(filterType, Number($distributionFilterText));
            } else {
                $distributionPagerInstance.filterStringInclude('event_name', $distributionFilterText.toLowerCase());
            }
        }

        currentPage = 1; // 初期ページ設定
        maxPage = $distributionPagerInstance.max; // 最大ページ数再設定
        openDistributionEditField.set([]); // 展開済み編集フィールドリセット
    });

    // 「タブ切り替え、表示ページ切替、フィルター、IDソート、各編集データ更新」時に、各処理リセット
    $effect(() => {
        // 依存関係は$distCommonSpecificToggle、$specificDistributionData、$commonDistributionData
        if ($pagerDistributionData) {
            isChecked = new Array($pagerDistributionData.length).fill(false); // 各行選択状態全解除
            checkAll = false; // 全行選択フラグリセット
            selectedRowCount = 0; // 選択された削除行数リセット
        }
    });

    // テーブル内モバイル用横スクロールを詳細データ展開エリアでは無効に
    $effect(() => {
        // 依存関係はpreventHorizScrollOnDetailRow
        if (isMobile) {
            const tableWrapperElm = document.getElementsByClassName('console_contents_table_wrapper')[0] as HTMLTableElement;
            tableWrapperElm.style.overflowX = $preventHorizScrollOnDetailRow ? 'hidden' : 'scroll';
        }
    });

    // モバイル端末の場合、スクロールヒント出す
    if (isMobile) {
        setTimeout(() => {
            new ScrollHint('.console_contents_table_wrapper', {
                remainingTime: '5000', // 5秒後に自動消除
            });
        }, 500); // 少し実行をずらすことで、ヒントが最初チラつくのを防ぐ
    }

    // コンポーネントアンマウント時
    onDestroy(() => {
        distributionContentsData.set([
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
        ]); // コンテンツデータリセット（data編集タブ開いたまま、新規作成ページに行くとデータがそのままコピーされてしまう）
    });
</script>

<svelte:window bind:scrollY />

<h2>
    <span class="material-symbols-outlined">package_2</span>
    Distribution
</h2>

<div class="console_contents">
    <form
        id="deleteDistribution"
        action="?/deleteDistribution"
        method="POST"
        use:enhance={({ formData }) => {
            const selectedIds: number[] = String(formData.get('selectedDistributionId')).split(',').map(Number);

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allDistributionData.update((data) => data.filter((distribution) => !selectedIds.includes(distribution.id))); // common/specificの元データを更新
                    $distributionPagerInstance.deleteItem(selectedIds); // pager更新データ動的反映
                    maxPage = $distributionPagerInstance.max; // 最大ページ数再設定
                    currentPage = Math.min(currentPage, $distributionPagerInstance.max); // 現在ページ数調整（最大ページ数を超えないよう）
                    openDistributionEditField.update((items) => {
                        return items.filter((id) => !selectedIds.includes(id));
                    }); // 開いているものを削除したら、そのidをストアから削除する
                }
            };
        }}
    >
        <input
            name="selectedDistributionId"
            type="hidden"
            value={isChecked
                .map((checked, i) => (checked ? $pagerDistributionData[i] : -1))
                .filter((index) => index !== -1)
                .map((distribution) => distribution?.id)}
        /><!-- distribution?.idの理由：行選択後にページ切り替えを行うとundefinedになる -->
    </form>

    <div class="temp_operation_area">
        <label class="custom_select_box">
            <select bind:value={filterType}>
                <option value="id" title="The distribution ID.">ID</option>
                <option value="event_name" title="The distribution title.">Title</option>
                <option value="character_id" title="The character ID for the scope of distribution.">Char ID</option>
            </select>
        </label>

        <label class="temp_operation_area_search">
            <span class="material-symbols-outlined">search</span>
            <input type="text" bind:value={$distributionFilterText} placeholder="Keywords..." />
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
                        <p>
                            Type
                            <span
                                class="help_btn material-symbols-outlined"
                                use:tooltip={'<span class="console_contents_note">Common</span>: Shows what is distributed for all characters.<br /><span class="console_contents_note">Specific</span>: Shows what is distributed for specific character.'}
                                >help</span
                            >
                        </p>
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
                                        $distributionPagerInstance.filterNumberArrInclude('type', selectedTypeFilterCheckbox);
                                        maxPage = $distributionPagerInstance.max; // 最大ページ数再設定
                                        currentPage = 1; // 現在ページリセット
                                        openDistributionEditField.set([]); // 展開済み編集フィールドリセット
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
                                        $distributionPagerInstance.filterNumberArrInclude('category', selectedCategoryFilterCheckbox);
                                        maxPage = $distributionPagerInstance.max; // 最大ページ数再設定
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

        <button class="green_btn" type="button" onclick={() => (distAddMode = true)}>
            <span class="btn_icon material-symbols-outlined">add</span>
            <span class="btn_text">Add Item</span>
        </button>

        <button
            form="deleteDistribution"
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
        <table class="console_contents_table" class:no_mobile_scroll={isMobile && !$pagerDistributionData.length}>
            <thead class="console_contents_table_head distribution">
                <tr class="table_row" class:hide_text={!$pagerDistributionData.length}>
                    <th class="console_contents_table_head_header select center">
                        <button
                            class="material-symbols-outlined"
                            type="button"
                            use:tooltip={isMobile ? '' : selectedRowCount >= 1 ? `Deselect ${selectedRowCount} row(s).` : 'Select all rows to delete.'}
                            onclick={() => {
                                if (!checkAll && selectedRowCount >= 1) {
                                    // 選択行全解除ボタンクリック時
                                    selectedRowCount = 0;
                                    isChecked.fill(false);
                                } else {
                                    // 全選択ボタン通常動作
                                    isChecked.fill(!checkAll);
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
                            $distributionPagerInstance.toggleSortOrder();
                            openDistributionEditField.set([]); // 展開済み編集フィールドリセット
                        }}
                    >
                        ID

                        <span class="material-symbols-outlined">sort</span>
                    </th>

                    <th class="console_contents_table_head_header type">Type</th>

                    <th class="console_contents_table_head_header title">Title</th>

                    <th class="console_contents_table_head_header other" class:center={isMobile} class:fixed={$pagerDistributionData.length}>
                        {#if $openDistributionEditField.length}
                            <button class="material-symbols-outlined" type="button" use:tooltip={isMobile ? '' : 'Collapse all edit fields.'} onclick={() => openDistributionEditField.set([])}>
                                collapse_all
                            </button>
                        {/if}
                    </th>
                </tr>
            </thead>

            <tbody>
                {#each $pagerDistributionData as distribution, i}
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

                        <td class="console_contents_table_data">{distribution.id}</td>

                        <td class="console_contents_table_data">{Object.keys(distributionType).find((key) => distributionType[key] === distribution.type)}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={distribution.event_name.replace(/~C(\d{2})/g, '')}>
                            {distribution.event_name.replace(/~C(\d{2})/g, '')}
                        </td>

                        <td class="console_contents_table_data" class:center={isMobile} class:fixed={$pagerDistributionData.length}>
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !$openDistributionEditField.includes(distribution.id) ? 'Show edit field.' : 'Hide edit field.'}
                                onclick={() => handleDistributionEditField(distribution.id)}
                            >
                                {#if $openDistributionEditField.includes(distribution.id)}
                                    close
                                {:else}
                                    edit_square
                                {/if}
                            </button>
                        </td>
                    </tr>

                    {#if $openDistributionEditField.includes(distribution.id)}
                        <tr class="detail_row">
                            <td colspan="100">
                                <form
                                    action="?/updateDistribution"
                                    method="POST"
                                    use:enhance={({ formData }) => {
                                        const data = conv2DArrayToObject([...formData.entries()]);
                                        const id = Number(data.dist_id);
                                        const column = Object.keys(data)[1] as DistributionEditableItemType;
                                        const value = Object.values(data)[1] as string | null;

                                        return async ({ result }) => {
                                            msgClosed.set(false);
                                            onSubmit.set(false);
                                            await applyAction(result);

                                            if (result.type === 'success') {
                                                updateAllDistributionData(id, column, !updatedContentsData ? value : updatedContentsData); // allDistributionDataストアを更新
                                                $distributionPagerInstance.updatePagerDistribution(id, column, !updatedContentsData ? value : updatedContentsData); // pager更新データ動的反映
                                            }
                                        };
                                    }}
                                >
                                    <input type="hidden" name="dist_id" value={editingId} />

                                    <!--
                                    <div class="console_contents_list_title">
                                        <p class="console_contents_list_title_text distribution">{distribution.event_name.replace(/~C(\d{2})/g, '')}</p>
    
                                        <button
                                            class="red_btn console_contents_list_title_outer"
                                            type="button"
                                            onclick={() =>
                                                openModal('deleteDistribution', {
                                                    label: 'deleteDistribution',
                                                    distId: distribution.id,
                                                    distTitle: distribution.event_name,
                                                    distType: distribution.type,
                                                    isSpecific: $distCommonSpecificToggle === 1,
                                                })}
                                        >
                                            <span class="btn_icon material-symbols-outlined">delete</span>
                                            <span class="btn_text">Delete</span>
                                        </button>
                                    </div>
                                    -->

                                    <dl class="console_contents_list">
                                        <dt class="contents_term">ID</dt>
                                        <dd class="contents_desc">{distribution.id}</dd>

                                        <dt class="contents_term">Category</dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === distribution.id && catTypes['category']}
                                                        <label class="custom_select_box">
                                                            <select name="category">
                                                                {#each Object.entries(DistributionCategoryObj) as [catName, catIndex]}
                                                                    <option value={catIndex} selected={catIndex === distribution.category}>{catName}</option>
                                                                {/each}
                                                            </select>
                                                        </label>
                                                    {:else}
                                                        {getDistributionCategoryName(distribution.category)}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === distribution.id && catTypes['category']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'category')}>
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
                                                                // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                handleEditModeSwitch(0, 'category');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(distribution.id, 'category')}>
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">
                                            Expiry
                                            <span class="help_btn material-symbols-outlined" use:tooltip={$dateTimeJSTBase}>help</span>
                                        </dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === distribution.id && catTypes['deadline']}
                                                        <!-- inputは常に現地時間を想定 -->
                                                        <input type="datetime-local" name="deadline" bind:value={previewDeadline} />

                                                        <!-- モバイルは改行、PCはスぺース -->
                                                        {#if isMobile}<br />{:else}&nbsp;{/if}

                                                        <!-- 「現地時間 > UTC > 日本時間」 の変換処理を再現 -->
                                                        {`True Date: ${
                                                            !previewDeadline
                                                                ? 'None'
                                                                : DateTime.fromISO(previewDeadline)
                                                                      .setZone('utc')
                                                                      .setLocale('en')
                                                                      .plus({ hours: 9 })
                                                                      .toLocaleString({ year: 'numeric', month: isMobile ? 'short' : 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                        }`}
                                                    {:else}
                                                        {!distribution.deadline
                                                            ? 'Permanent'
                                                            : DateTime.fromJSDate(distribution.deadline)
                                                                  .setZone(DateTime.local().zoneName)
                                                                  .setLocale('en')
                                                                  .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === distribution.id && catTypes['deadline']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'deadline')}>
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
                                                                // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                handleEditModeSwitch(0, 'deadline');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button
                                                        class="normal_btn"
                                                        type="button"
                                                        onclick={() => {
                                                            handleEditModeSwitch(distribution.id, 'deadline');
                                                            previewDeadline = !distribution.deadline
                                                                ? DateTime.now().setLocale('en').toFormat("yyyy-MM-dd'T'HH:mm") // デフォルト値は現在の現地時間
                                                                : DateTime.fromJSDate(distribution.deadline).setZone(DateTime.local().zoneName).setLocale('en').toFormat("yyyy-MM-dd'T'HH:mm"); // 期限存在時はそれを現地時間に変換する
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">
                                            Title
                                            {#if isMobile}
                                                <span
                                                    class="help_btn material-symbols-outlined"
                                                    use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p class="console_contents_note">* Text must be 32 characters or less.</p>'}
                                                >
                                                    help
                                                </span>
                                            {/if}
                                        </dt>
                                        <dd class="contents_desc no_desc_item">
                                            <div class="contents_desc_item_group_btn">
                                                {#if !isMobile}
                                                    <button
                                                        class="normal_btn"
                                                        class:disabled_elm={isMobile}
                                                        type="button"
                                                        onclick={() =>
                                                            openModal('distributionEditor', {
                                                                label: 'distributionEditor',
                                                                type: 0,
                                                                distId: distribution.id,
                                                                contents: distribution.event_name,
                                                                showCharacterId: distribution.type === 1,
                                                            })}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">open_in_browser</span>
                                                        <span class="btn_text">Open Editor</span>
                                                    </button>
                                                {:else if editingId === distribution.id && catTypes['event_name']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'event_name')}>
                                                        <span class="btn_icon material-symbols-outlined">close</span>
                                                        <span class="btn_text">Cancel</span>
                                                    </button>
                                                {:else}
                                                    <button
                                                        class="normal_btn"
                                                        type="button"
                                                        onclick={() => {
                                                            handleEditModeSwitch(distribution.id, 'event_name');
                                                            previewTitle = convertColorString('colorTag', distribution.event_name, 'event_name');
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>

                                            <!-- svelte5のバグでslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                            <div class="edit_area_box_wrapper">
                                                {#if editingId === distribution.id && catTypes['event_name']}
                                                    <div transition:slide class="edit_area_box">
                                                        <div class="edit_area enter">
                                                            <dl class="edit_area_box_parts text">
                                                                <div class="color_palette">
                                                                    {#each Object.entries(colorPalette) as [colorName, code]}
                                                                        <!-- onblurイベントでisInputFocused=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                                        <button
                                                                            class={`color_palette_btn ${colorName.toLowerCase()}`}
                                                                            type="button"
                                                                            onmousedown={() =>
                                                                                insertTextAtCursor(`<Color${code} />`, inputElement, isInputFocused, (newValue) => (previewTitle = newValue))}
                                                                            aria-label="Color Palette Button"
                                                                        ></button>
                                                                    {/each}
                                                                </div>

                                                                <dt>Enter new title</dt>
                                                                <dd>
                                                                    <input type="hidden" name="event_name" value={submitMobileTitle} />

                                                                    <input
                                                                        type="text"
                                                                        bind:this={inputElement}
                                                                        bind:value={previewTitle}
                                                                        autocomplete="off"
                                                                        onfocus={() => (isInputFocused = true)}
                                                                        onblur={() => (isInputFocused = false)}
                                                                        oninput={() => {
                                                                            // <Color** /> の部分を正規表現で除外
                                                                            const sanitized = previewTitle.replace(/<Color\d{2} \/>/g, '');

                                                                            // 32バイト以下のみ許可
                                                                            isValidPreviewTitle = encodeToShiftJIS(sanitized).length <= 32;
                                                                        }}
                                                                    />
                                                                </dd>
                                                            </dl>

                                                            <dl class="edit_area_box_parts text">
                                                                <dt>Preview</dt>
                                                                <dd>
                                                                    <p class="preview_title">{@html convertColorString('html', previewTitle, 'event_name')}</p>
                                                                </dd>
                                                            </dl>

                                                            <button
                                                                class="blue_btn"
                                                                type="submit"
                                                                class:disabled_elm={!isValidPreviewTitle}
                                                                disabled={!isValidPreviewTitle}
                                                                onclick={() => {
                                                                    onSubmit.set(true);
                                                                    $timeOut && closeMsgDisplay($timeOut);
                                                                    setTimeout(() => {
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'event_name');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">{!isValidPreviewTitle ? 'close' : 'check'}</span>
                                                                <span class="btn_text">{!isValidPreviewTitle ? 'Invalid Title' : 'Save'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">
                                            Description
                                            {#if isMobile}
                                                <span
                                                    class="help_btn material-symbols-outlined"
                                                    use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p>"&lt;br&gt;" means a line break. Line break operation can\'t be performed in this form, but "&lt;br&gt;" is inserted automatically instead.</p>'}
                                                >
                                                    help
                                                </span>
                                            {/if}
                                        </dt>
                                        <dd class="contents_desc no_desc_item">
                                            <div class="contents_desc_item_group_btn">
                                                {#if !isMobile}
                                                    <button
                                                        class="normal_btn"
                                                        class:disabled_elm={isMobile}
                                                        type="button"
                                                        onclick={() =>
                                                            openModal('distributionEditor', {
                                                                label: 'distributionEditor',
                                                                type: 1,
                                                                distId: distribution.id,
                                                                contents: distribution.description,
                                                                showCharacterId: distribution.type === 1,
                                                            })}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">open_in_browser</span>
                                                        <span class="btn_text">Open Editor</span>
                                                    </button>
                                                {:else if editingId === distribution.id && catTypes['description']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'description')}>
                                                        <span class="btn_icon material-symbols-outlined">close</span>
                                                        <span class="btn_text">Cancel</span>
                                                    </button>
                                                {:else}
                                                    <button
                                                        class="normal_btn"
                                                        type="button"
                                                        onclick={() => {
                                                            handleEditModeSwitch(distribution.id, 'description');
                                                            previewDescription = convertColorString('colorTag', distribution.description, 'event_name');
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>

                                            <!-- svelte5のバグでslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                            <div class="edit_area_box_wrapper">
                                                {#if editingId === distribution.id && catTypes['description']}
                                                    <div transition:slide class="edit_area_box">
                                                        <div class="edit_area enter">
                                                            <dl class="edit_area_box_parts text">
                                                                <div class="color_palette">
                                                                    {#each Object.entries(colorPalette) as [colorName, code]}
                                                                        <!-- onblurイベントでisInputFocused=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                                        <button
                                                                            class={`color_palette_btn ${colorName.toLowerCase()}`}
                                                                            type="button"
                                                                            onmousedown={() =>
                                                                                insertTextAtCursor(`<Color${code} />`, textAreaElement, isInputFocused, (newValue) => (previewDescription = newValue))}
                                                                            aria-label="Color Palette Button"
                                                                        ></button>
                                                                    {/each}
                                                                </div>

                                                                <dt>Enter new description</dt>
                                                                <dd>
                                                                    <input type="hidden" name="description" value={mobileSubmitDescHtml} />
                                                                    <textarea
                                                                        style="width: 100%; height: 20vh;"
                                                                        bind:this={textAreaElement}
                                                                        bind:value={previewDescription}
                                                                        autocomplete="off"
                                                                        onfocus={() => (isInputFocused = true)}
                                                                        onblur={() => (isInputFocused = false)}
                                                                        onkeydown={(e) => handleKeyDownInTextArea(e, textAreaElement, isInputFocused, (newValue) => (previewDescription = newValue))}
                                                                    ></textarea>
                                                                </dd>
                                                            </dl>

                                                            <button
                                                                class="blue_btn"
                                                                type="submit"
                                                                onclick={() => {
                                                                    onSubmit.set(true);
                                                                    $timeOut && closeMsgDisplay($timeOut);
                                                                    setTimeout(() => {
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'event_name');
                                                                    }, 100);
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

                                        <dt class="contents_term">
                                            Remaining Claims
                                            <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999'}>help</span>
                                        </dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === distribution.id && catTypes['times_acceptable']}
                                                        <NumberInput value={distribution.times_acceptable} max={999} name="times_acceptable" />
                                                    {:else}
                                                        {distribution.times_acceptable}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === distribution.id && catTypes['times_acceptable']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'times_acceptable')}>
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
                                                                // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                handleEditModeSwitch(0, 'times_acceptable');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(distribution.id, 'times_acceptable')}>
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">Scope of Distribution</dt>
                                        <dd class="contents_desc nested">
                                            <dl class="console_contents_list">
                                                <dt class="contents_term">
                                                    Character
                                                    <span
                                                        class="help_btn material-symbols-outlined"
                                                        use:tooltip={"<p>Option Format: [Character ID] Name</p><hr /><p>- You can search by name or ID.</p><p>- You can't specify multiple characters.</p><p>- If a character is specified, items are distributed to that character only. If blank, items are distributed to all characters.</p>"}
                                                    >
                                                        help
                                                    </span>
                                                </dt>
                                                <dd class="contents_desc">
                                                    <div class="contents_desc_item">
                                                        <div class="contents_desc_item_text no_overflow">
                                                            {#if editingId === distribution.id && catTypes['character_id']}
                                                                <div class="custom_select_with_filter_wrapper">
                                                                    <!-- 送信されるデータ -->
                                                                    <input id="selected_char" type="hidden" name="character_id" value={distribution.character_id} />

                                                                    <!-- ユーザーが閲覧可能仮データ -->
                                                                    <!-- charactersIdName.filterをvalueに使用すると、メニューを閉じたときにカクつくのでこれ以上使用しないこと -->
                                                                    <input
                                                                        id="selected_char_tentative"
                                                                        class="custom_select_with_filter_input"
                                                                        type="text"
                                                                        value={!distribution.character_id ? null : `[${distribution.character_id}]`}
                                                                        autocomplete="off"
                                                                        oninput={(ie) => {
                                                                            targetCharShowDropdown = true;

                                                                            // 入力値に応じてフィルタオプション変化
                                                                            targetCharFilteredOption = !ie.currentTarget.value
                                                                                ? []
                                                                                : charactersIdName.filter((e) => e.toLowerCase().includes(ie.currentTarget.value.toLowerCase())).slice(0, 10);

                                                                            // 入力値空になったら送信データ削除
                                                                            if (!ie.currentTarget.value) {
                                                                                (document.getElementById('selected_char') as HTMLInputElement).value = '';
                                                                            }
                                                                        }}
                                                                        onfocus={(fe) => {
                                                                            targetCharShowDropdown = true;

                                                                            targetCharFilteredOption = !fe.currentTarget.value
                                                                                ? []
                                                                                : charactersIdName.filter((e) => e.toLowerCase().includes(fe.currentTarget.value.toLowerCase())).slice(0, 10);
                                                                        }}
                                                                        onblur={() => (targetCharShowDropdown = false)}
                                                                        placeholder="Enter the character name or ID."
                                                                    />

                                                                    {#if targetCharShowDropdown}
                                                                        <ul class="custom_select_with_filter">
                                                                            {#if targetCharFilteredOption.length > 0}
                                                                                <Svroller width="100%" alwaysVisible={true}>
                                                                                    {#each targetCharFilteredOption as option}
                                                                                        <!-- onblurイベントでshowDropdown=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                                                        <button
                                                                                            class="custom_select_with_filter_item"
                                                                                            type="button"
                                                                                            onmousedown={(e) => {
                                                                                                // 閲覧できる仮データはinput:textへ代入
                                                                                                (document.getElementById('selected_char_tentative') as HTMLInputElement).value = (
                                                                                                    e.target as HTMLButtonElement
                                                                                                ).innerText;

                                                                                                // 送信するデータ（ID）をinput:hiddenへ代入
                                                                                                (document.getElementById('selected_char') as HTMLInputElement).value = (
                                                                                                    e.target as HTMLButtonElement
                                                                                                ).innerText?.replace(/^\[(\d+)\].*$/, '$1');
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
                                                            {:else}
                                                                {charactersIdName.filter((e) => e.toLowerCase().includes(`[${distribution.character_id}] `))[0] ||
                                                                    (!distribution.character_id ? 'All Characters' : 'Unknown User')}
                                                            {/if}
                                                        </div>
                                                    </div>

                                                    <div class="contents_desc_item_group_btn">
                                                        {#if editingId === distribution.id && catTypes['character_id']}
                                                            <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'character_id')}>
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
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'character_id');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {:else}
                                                            <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(distribution.id, 'character_id')}>
                                                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                                <span class="btn_text">Edit</span>
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </dd>
                                            </dl>

                                            <dl class="console_contents_list">
                                                <dt class="contents_term">
                                                    Min. HR
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}> help </span>
                                                </dt>
                                                <dd class="contents_desc">
                                                    <div class="contents_desc_item">
                                                        <p class="contents_desc_item_text">
                                                            {#if editingId === distribution.id && catTypes['min_hr']}
                                                                <NumberInput value={convHrpToHr(distribution.min_hr)} min={0} max={7} name="min_hr" />
                                                            {:else}
                                                                {distribution.min_hr === 65535 ? noReq : convHrpToHr(distribution.min_hr)}
                                                            {/if}
                                                        </p>
                                                    </div>

                                                    <div class="contents_desc_item_group_btn">
                                                        {#if editingId === distribution.id && catTypes['min_hr']}
                                                            <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'min_hr')}>
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
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'min_hr');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {:else}
                                                            <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(distribution.id, 'min_hr')}>
                                                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                                <span class="btn_text">Edit</span>
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </dd>
                                            </dl>

                                            <dl class="console_contents_list">
                                                <dt class="contents_term">
                                                    Max. HR
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}> help </span>
                                                </dt>
                                                <dd class="contents_desc">
                                                    <div class="contents_desc_item">
                                                        <p class="contents_desc_item_text">
                                                            {#if editingId === distribution.id && catTypes['max_hr']}
                                                                <NumberInput value={convHrpToHr(distribution.max_hr)} min={0} max={7} name="max_hr" />
                                                            {:else}
                                                                {distribution.max_hr === 65535 ? noReq : convHrpToHr(distribution.max_hr)}
                                                            {/if}
                                                        </p>
                                                    </div>

                                                    <div class="contents_desc_item_group_btn">
                                                        {#if editingId === distribution.id && catTypes['max_hr']}
                                                            <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'max_hr')}>
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
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'max_hr');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {:else}
                                                            <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(distribution.id, 'max_hr')}>
                                                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                                <span class="btn_text">Edit</span>
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </dd>
                                            </dl>

                                            <!--
                                            <dl class="console_contents_list">
                                                <dt class="contents_term">
                                                    Min. SR
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}> help </span>
                                                </dt>
                                                <dd class="contents_desc">
                                                    <div class="contents_desc_item">
                                                        <p class="contents_desc_item_text">
                                                            {#if editingId === distribution.id && catTypes['min_sr']}
                                                                <NumberInput value={distribution.min_sr === 65535 ? 0 : distribution.min_sr} min={0} max={999} name="min_sr" />
                                                            {:else}
                                                                {distribution.min_sr === 65535 ? noReq : distribution.min_sr}
                                                            {/if}
                                                        </p>
                                                    </div>

                                                    <div class="contents_desc_item_group_btn">
                                                        {#if editingId === distribution.id && catTypes['min_sr']}
                                                            <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'min_sr')}>
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
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        editModeSwitch(0, 'min_sr');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {:else}
                                                            <button class="normal_btn" type="button" onclick={() => editModeSwitch(distribution.id, 'min_sr')}>
                                                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                                <span class="btn_text">Edit</span>
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </dd>
                                            </dl>

                                            <dl class="console_contents_list">
                                                <dt class="contents_term">
                                                    Max. SR
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}> help </span>
                                                </dt>
                                                <dd class="contents_desc">
                                                    <div class="contents_desc_item">
                                                        <p class="contents_desc_item_text">
                                                            {#if editingId === distribution.id && catTypes['max_sr']}
                                                                <NumberInput value={distribution.min_sr === 65535 ? 0 : distribution.min_sr} min={0} max={999} name="max_sr" />
                                                            {:else}
                                                                {distribution.max_sr === 65535 ? noReq : distribution.max_sr}
                                                            {/if}
                                                        </p>
                                                    </div>

                                                    <div class="contents_desc_item_group_btn">
                                                        {#if editingId === distribution.id && catTypes['max_sr']}
                                                            <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'max_sr')}>
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
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        editModeSwitch(0, 'max_sr');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {:else}
                                                            <button class="normal_btn" type="button" onclick={() => editModeSwitch(distribution.id, 'max_sr')}>
                                                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                                <span class="btn_text">Edit</span>
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </dd>
                                            </dl>
                                            -->

                                            <dl class="console_contents_list">
                                                <dt class="contents_term">
                                                    Min. GR
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}> help </span>
                                                </dt>
                                                <dd class="contents_desc">
                                                    <div class="contents_desc_item">
                                                        <p class="contents_desc_item_text">
                                                            {#if editingId === distribution.id && catTypes['min_gr']}
                                                                <NumberInput value={distribution.min_gr === 65535 ? 0 : distribution.min_gr} min={0} max={999} name="min_gr" />
                                                            {:else}
                                                                {distribution.min_gr === 65535 ? noReq : distribution.min_gr}
                                                            {/if}
                                                        </p>
                                                    </div>

                                                    <div class="contents_desc_item_group_btn">
                                                        {#if editingId === distribution.id && catTypes['min_gr']}
                                                            <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'min_gr')}>
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
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'min_gr');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {:else}
                                                            <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(distribution.id, 'min_gr')}>
                                                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                                <span class="btn_text">Edit</span>
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </dd>
                                            </dl>

                                            <dl class="console_contents_list">
                                                <dt class="contents_term">
                                                    Max. GR
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}> help </span>
                                                </dt>
                                                <dd class="contents_desc">
                                                    <div class="contents_desc_item">
                                                        <p class="contents_desc_item_text">
                                                            {#if editingId === distribution.id && catTypes['max_gr']}
                                                                <NumberInput value={distribution.max_gr === 65535 ? 0 : distribution.max_gr} min={0} max={999} name="max_gr" />
                                                            {:else}
                                                                {distribution.max_gr === 65535 ? noReq : distribution.max_gr}
                                                            {/if}
                                                        </p>
                                                    </div>

                                                    <div class="contents_desc_item_group_btn">
                                                        {#if editingId === distribution.id && catTypes['max_gr']}
                                                            <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'max_gr')}>
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
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'max_gr');
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {:else}
                                                            <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(distribution.id, 'max_gr')}>
                                                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                                <span class="btn_text">Edit</span>
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </dd>
                                            </dl>
                                        </dd>

                                        <dt class="contents_term">Contents Data</dt>
                                        <dd class="contents_desc no_desc_item">
                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === distribution.id && catTypes['data']}
                                                    <button
                                                        class="red_btn"
                                                        type="button"
                                                        onclick={() => {
                                                            handleEditModeSwitch(0, 'data');
                                                            distributionContentsData.set([
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
                                                            ]); // ストアリセット
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">collapse_all</span>
                                                        <span class="btn_text">Hide</span>
                                                    </button>
                                                {:else}
                                                    <button
                                                        class="normal_btn"
                                                        type="button"
                                                        onclick={() => {
                                                            handleEditModeSwitch(distribution.id, 'data');
                                                            scrollYBeforeOpenData = scrollY;
                                                            distributionContentsData.set(ManageDistribution.parseHexString(distribution.data));
                                                            console.log($distributionContentsData);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">expand_all</span>
                                                        <span class="btn_text">Show</span>
                                                    </button>
                                                {/if}
                                            </div>

                                            <!-- svelte5のバグでslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                            <div class="edit_area_box_wrapper">
                                                {#if editingId === distribution.id && catTypes['data']}
                                                    <div transition:slide>
                                                        <input type="hidden" name="data" value="0" />

                                                        <DistributionContentsData {isMobile} />

                                                        {#if $distributionContentsData}
                                                            <button
                                                                class="blue_btn"
                                                                type="submit"
                                                                style="margin: 0 auto;"
                                                                onclick={() => {
                                                                    scrollPosition({ x: 0, y: scrollYBeforeOpenData }); // 配布コンテンツデータ編集前の位置まで戻る
                                                                    onSubmit.set(true);
                                                                    $timeOut && closeMsgDisplay($timeOut);
                                                                    setTimeout(() => {
                                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                        handleEditModeSwitch(0, 'data');
                                                                        distributionContentsData.set([
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
                                                                        ]); // ストアリセット
                                                                    }, 100);
                                                                }}
                                                            >
                                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                                <span class="btn_text">Save</span>
                                                            </button>
                                                        {/if}
                                                    </div>
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
                        <td class="console_contents_table_data no_data" colspan="5">No distribution data.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="pagination_btn_area">
        {#if $pagerDistributionData.length}
            {#each generatedPaginationBtn as page}
                <button
                    class:pagination_btn={page !== '...'}
                    class:pagination_gap={page === '...'}
                    class:selected={currentPage === Number(page)}
                    class:disabled_elm={page === '...'}
                    onclick={() => {
                        if (currentPage !== Number(page)) {
                            // 選択中のボタン以外がonclick対象
                            $distributionPagerInstance.getContent(Number(page)); // ページ数に応じた表示内容に切り替え
                            currentPage = Number(page); // 現在ページ数更新
                            openDistributionEditField.set([]); // 展開済み編集フィールドリセット
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
