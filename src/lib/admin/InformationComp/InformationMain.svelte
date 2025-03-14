<script lang="ts">
    import { DateTime } from 'luxon';
    import ScrollHint from 'scroll-hint';
    import { Svroller } from 'svrollbar';
    import { applyAction, enhance } from '$app/forms';
    import { InfoTypeObj, type InformationEditableItemType, type Information } from '$types';
    import {
        allInformationData,
        onSubmit,
        msgClosed,
        conv2DArrayToObject,
        timeOut,
        closeMsgDisplay,
        tooltip,
        editModeSwitch,
        dateTimeUTCBase,
        updateAllInformationData,
        Pager,
        pagerInformationData,
        tooltipWhenOverflowText,
        handleInformationEditField,
        generatePaginationBtn,
        preventHorizScrollOnDetailRow,
        toggleFilterCheckbox,
        sortId,
    } from '$utils/client';

    interface Props {
        infoAddMode: boolean;
        isMobile: boolean;
    }
    let { infoAddMode = $bindable(false), isMobile }: Props = $props();
    let editingId: number = $state(0); // 編集対象のインフォID
    let catTypes: Record<InformationEditableItemType, boolean> = $state({
        title: false,
        url: false,
        type: false,
        created_at: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    let selectedRowCount = $state(0); // 選択された削除行数
    let checkAll = $state(false); // 全行選択フラグ
    let isChecked: boolean[] = $state(new Array($pagerInformationData.length).fill(false)); // 各行選択状態
    let pager: Pager<Information>;
    let currentPage = $state(1);
    let maxPage = $state(0);
    let openInformationEditField: number[] = $state([]);
    let filterType: 'id' | 'title' = $state('id');
    let informationFilterText = $state('');
    let generatedPaginationBtn = $derived(generatePaginationBtn(currentPage, maxPage, 7)); // ページネーション用ボタン生成
    let openTypeFilterCheckbox = $state(false);
    let selectedTypeFilterCheckbox: number[] = $state(Object.values(InfoTypeObj));

    /**
     * 編集モードを切り替える
     *
     * @param {number} infoId 編集対象のインフォID
     * @param {InformationEditableItemType} type 切り替えたいカテゴリのタイプ
     */
    const handleEditModeSwitch = (infoId: number, type: InformationEditableItemType): void => {
        const { updatedCatTypes, updatedEditingId } = editModeSwitch<typeof type>(infoId, type, catTypes);
        catTypes = updatedCatTypes;
        editingId = updatedEditingId;
    };

    pager = new Pager($allInformationData);
    pager.bindStore((data) => pagerInformationData.set(data)); // 格納先ストアバインド
    maxPage = pager.max; // 最大ページ数設定

    // フィルター時リアクティブ処理
    $effect(() => {
        // 依存関係はinformationFilterText、filterType
        pager.clearFilters(['exact_id', 'text_title']); // 既存のフィルターをクリア
        // filterTypeでフィルターするのは１つだけなので、クリアしないと混ざってしまう

        if (informationFilterText) {
            if (filterType === 'id') {
                pager.filterExactMatch('id', Number(informationFilterText));
            } else {
                pager.filterStringInclude('title', informationFilterText.toLowerCase());
            }
        }

        currentPage = 1; // 初期ページ設定
        maxPage = pager.max; // 最大ページ数再設定
        openInformationEditField = []; // 展開済み編集フィールドリセット
    });

    // 「表示ページ切替、フィルター、IDソート、各編集データ更新」時に、各処理リセット
    $effect(() => {
        // 依存関係は$pagerInformationData
        if ($pagerInformationData) {
            isChecked = new Array($pagerInformationData.length).fill(false); // 各行選択状態全解除
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
</script>

<h2>
    <span class="material-symbols-outlined">info</span>
    Information
</h2>

<div class="console_contents">
    <form
        id="deleteInformation"
        action="?/deleteInformation"
        method="POST"
        use:enhance={({ formData }) => {
            const selectedIds: number[] = String(formData.get('selectedInformationId')).split(',').map(Number);

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allInformationData.update((data) => data.filter((information) => !selectedIds.includes(information.id))); // 元データを更新
                    pager.deleteItem(selectedIds); // pager更新データ動的反映
                    maxPage = pager.max; // 最大ページ数再設定
                    currentPage = Math.min(currentPage, pager.max); // 現在ページ数調整（最大ページ数を超えないよう）
                    openInformationEditField = openInformationEditField.filter((id) => !selectedIds.includes(id)); // 開いているものを削除したら、そのidをストアから削除する
                }
            };
        }}
    >
        <input
            name="selectedInformationId"
            type="hidden"
            value={isChecked
                .map((checked, i) => (checked ? $pagerInformationData[i] : -1))
                .filter((index) => index !== -1)
                .map((information) => information?.id)}
        /><!-- information?.idの理由：行選択後にページ切り替えを行うとundefinedになる -->
    </form>

    <div class="temp_operation_area">
        <label class="custom_select_box">
            <select bind:value={filterType}>
                <option value="id" title="The information ID.">ID</option>
                <option value="title" title="The information title.">Title</option>
            </select>
        </label>

        <label class="temp_operation_area_search">
            <span class="material-symbols-outlined">search</span>
            <input type="text" bind:value={informationFilterText} placeholder="Keywords..." />
        </label>

        <button class="normal_btn" type="button" onclick={() => (openTypeFilterCheckbox = !openTypeFilterCheckbox)}>
            <span class="btn_icon material-symbols-outlined">filter_alt</span>
            <span class="btn_text">Filter</span>

            {#if openTypeFilterCheckbox}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <!-- チェックボックス押下時、button要素のonclickが実行されるのを防ぐためstopPropagation -->
                <fieldset class="filter_checkbox_wrapper" onclick={(e) => e.stopPropagation()}>
                    <Svroller width="100%" height="100%" alwaysVisible={true}>
                        <p>Type</p>
                        {#each Object.entries(InfoTypeObj) as [typeName, typeIndex]}
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
                                        openInformationEditField = []; // 展開済み編集フィールドリセット
                                    }}
                                />
                                {typeName}
                            </label>
                        {/each}
                    </Svroller>
                </fieldset>
            {/if}
        </button>

        <button class="green_btn" type="button" onclick={() => (infoAddMode = true)}>
            <span class="btn_icon material-symbols-outlined">add</span>
            <span class="btn_text">Add Item</span>
        </button>

        <button
            form="deleteInformation"
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
        <table class="console_contents_table" class:no_mobile_scroll={isMobile && !$pagerInformationData.length}>
            <thead class="console_contents_table_head information">
                <tr class="table_row" class:hide_text={!$pagerInformationData.length}>
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
                            pager.toggleSortOrder();
                            openInformationEditField = []; // 展開済み編集フィールドリセット
                        }}
                    >
                        ID

                        <span class="material-symbols-outlined">sort</span>
                    </th>

                    <th class="console_contents_table_head_header title">Title</th>

                    <th class="console_contents_table_head_header type">Type</th>

                    <th class="console_contents_table_head_header created">Info Created</th>

                    <th class="console_contents_table_head_header other" class:center={isMobile} class:fixed={$pagerInformationData.length}>
                        {#if openInformationEditField.length}
                            <button class="material-symbols-outlined" type="button" use:tooltip={isMobile ? '' : 'Collapse all edit fields.'} onclick={() => (openInformationEditField = [])}>
                                collapse_all
                            </button>
                        {/if}
                    </th>
                </tr>
            </thead>

            <tbody>
                {#each $pagerInformationData as information, i}
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

                        <td class="console_contents_table_data">{information.id}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={information.title.replace(/~C(\d{2})/g, '')}>
                            {information.title.replace(/~C(\d{2})/g, '')}
                        </td>

                        <td class="console_contents_table_data">
                            {Object.fromEntries(Object.entries(InfoTypeObj).map(([key, value]) => [value, key]))[information.type]}
                        </td>

                        <td
                            class="console_contents_table_data"
                            use:tooltipWhenOverflowText={DateTime.fromJSDate(information.created_at)
                                .setZone(DateTime.local().zoneName)
                                .setLocale('en')
                                .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        >
                            {DateTime.fromJSDate(information.created_at)
                                .setZone(DateTime.local().zoneName)
                                .setLocale('en')
                                .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td class="console_contents_table_data" class:center={isMobile} class:fixed={$pagerInformationData.length}>
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !openInformationEditField.includes(information.id) ? 'Show edit field.' : 'Hide edit field.'}
                                onclick={() => (openInformationEditField = handleInformationEditField(openInformationEditField, information.id))}
                            >
                                {#if openInformationEditField.includes(information.id)}
                                    close
                                {:else}
                                    edit_square
                                {/if}
                            </button>
                        </td>
                    </tr>

                    {#if openInformationEditField.includes(information.id)}
                        <tr class="detail_row">
                            <td colspan="100">
                                <form
                                    action="?/updateInformation"
                                    method="POST"
                                    use:enhance={({ formData }) => {
                                        const data = conv2DArrayToObject([...formData.entries()]);
                                        const id = Number(data.info_id);
                                        const column = Object.keys(data)[1] as InformationEditableItemType;
                                        const value = Object.values(data)[1];

                                        return async ({ result }) => {
                                            msgClosed.set(false);
                                            onSubmit.set(false);
                                            await applyAction(result);

                                            if (result.type === 'success') {
                                                updateAllInformationData(id, column, value); // allInformationDataストアを更新
                                                pager.updatePagerInformation(id, column, value); // pager更新データ動的反映
                                            }
                                        };
                                    }}
                                >
                                    <input type="hidden" name="info_id" value={editingId} />

                                    <!-- <p class="console_contents_list_title">
                                            <button
                                                class="red_btn console_contents_list_title_outer"
                                                type="button"
                                                onclick={() =>
                                                    openModal('deleteInfo', {
                                                        label: 'deleteInfo',
                                                        infoId: information.id,
                                                        infoTitle: information.title,
                                                        infoUrl: information.url,
                                                        createdAt: DateTime.fromJSDate(information.created_at)
                                                            .setZone(DateTime.local().zoneName)
                                                            .setLocale('en')
                                                            .toLocaleString({ year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                                        infoType: information.type,
                                                    })}
                                            >
                                                <span class="btn_icon material-symbols-outlined">delete</span>
                                                <span class="btn_text">Delete</span>
                                            </button>

                                            Info Data

                                            <input type="hidden" name="info_id" value={information.id} />
                                        </p> -->

                                    <dl class="console_contents_list">
                                        <dt class="contents_term">ID</dt>
                                        <dd class="contents_desc">{information.id}</dd>

                                        <dt class="contents_term">Title</dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === information.id && catTypes['title']}
                                                        <input class="long" type="text" name="title" value={information.title} placeholder="Enter information title." autocomplete="off" />
                                                    {:else}
                                                        {information.title}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === information.id && catTypes['title']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'title')}>
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
                                                                handleEditModeSwitch(0, 'title');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(information.id, 'title')}>
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">Hyperlink</dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === information.id && catTypes['url']}
                                                        <input class="long" type="text" name="url" value={information.url} autocomplete="off" placeholder="Enter url." />
                                                    {:else}
                                                        {information.url || 'None'}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === information.id && catTypes['url']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'url')}>
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
                                                                handleEditModeSwitch(0, 'url');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(information.id, 'url')}>
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">
                                            Info Created
                                            <span class="help_btn material-symbols-outlined" use:tooltip={$dateTimeUTCBase}>help</span>
                                        </dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === information.id && catTypes['created_at']}
                                                        <!-- inputは常に現地時間を想定 -->
                                                        <input type="datetime-local" name="created_at" value={DateTime.fromJSDate(information.created_at).toFormat("yyyy-MM-dd'T'HH:mm")} />
                                                    {:else}
                                                        {DateTime.fromJSDate(information.created_at)
                                                            .setZone(DateTime.local().zoneName)
                                                            .setLocale('en')
                                                            .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === information.id && catTypes['created_at']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'created_at')}>
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
                                                                handleEditModeSwitch(0, 'created_at');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(information.id, 'created_at')}>
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">Type</dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === information.id && catTypes['type']}
                                                        <label class="custom_select_box">
                                                            <select name="type">
                                                                {#each Object.entries(InfoTypeObj) as [typeName, typeIndex]}
                                                                    <option value={typeIndex} selected={typeIndex === information.type}>{typeName}</option>
                                                                {/each}
                                                            </select>
                                                        </label>
                                                    {:else}
                                                        {Object.fromEntries(Object.entries(InfoTypeObj).map(([key, value]) => [value, key]))[information.type]}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === information.id && catTypes['type']}
                                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'type')}>
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
                                                                handleEditModeSwitch(0, 'type');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(information.id, 'type')}>
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
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
                        <td class="console_contents_table_data no_data" colspan="6">No information data.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="pagination_btn_area">
        {#if $pagerInformationData.length}
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
                            openInformationEditField = []; // 展開済み編集フィールドリセット
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
