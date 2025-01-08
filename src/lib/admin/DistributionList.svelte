<script lang="ts">
    import { DateTime } from 'luxon';
    import { fade, slide } from 'svelte/transition';
    import { Svroller } from 'svrollbar';
    import { applyAction, enhance } from '$app/forms';
    import { DistributionTypeObj, type Distribution, type DistributionContentsType } from '$types';
    import {
        closeMsgDisplay,
        tooltip,
        convertColorString,
        conv2DArrayToObject,
        msgClosed,
        onSubmit,
        getDistributionTypeName,
        ManageDistribution,
        timeOut,
        convHrpToHr,
        distributionContentsData,
        getDistItemsData,
        prepareModal,
        commonDistributionData,
        specificDistributionData,
        updateDistributionData,
    } from '$utils/client';
    import NumberInput from '$lib/common/NumberInput.svelte';

    interface Props {
        title: string;
        helpText: string;
        distributions: Distribution[];
        showCharacterId?: boolean; // Specific用
        charactersIdName: string[];
        isMobile: boolean;
        updatedContentsData: string;
    }
    let { title, helpText, distributions, showCharacterId = false, charactersIdName, isMobile, updatedContentsData }: Props = $props();
    let filterCharId = $state('');
    let editingId: number = $state(0); // 編集対象の配布ID
    let editMode = false;
    const catTypes: { [key in keyof Omit<Distribution, 'id'>]: boolean } = $state({
        character_id: false,
        type: false,
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
    let previewNumberVal = $state(0);
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
    let scrollYBeforeOpenData = 0; // コンテンツデータ表示前にスクロール位置を保存（submit後にメニュー閉じて位置がずれるため）
    let selectedDistContentsData = [''];
    let distFilterOption = $state(['']);
    const getDistributionData = (): Distribution[] => (showCharacterId ? $specificDistributionData : $commonDistributionData);
    let showContents = $state(true);
    let previewDescription = $state('');
    let textAreaElement: HTMLTextAreaElement | undefined = $state();
    let mobileSubmitDescHtml = $derived(previewDescription.replace(/<br>/g, '\n')); // モバイル用提出HTML文字列、PCはエディターを使用する

    /**
     * 編集モードを切り替える
     * @template T 編集対象のIDの型（数値）
     * @template U 切り替え対象のカテゴリのタイプ、`launcher_info`から`id`フィールドを除いたキー
     * @param {T} id 編集対象のID
     * @param {U} type 切り替えたいカテゴリのタイプ
     */
    const editModeSwitch = <T extends number, U extends keyof Omit<Distribution, 'id'>>(id: T, type: U): void => {
        // 別のカテゴリがすでに編集モードかどうかを確認
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // 編集中に別の通常ボタンが押された場合、編集対象を切り替える
        if (activeCat && id !== 0) {
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<Distribution, 'id'>;
                catTypes[key] = false;
            });

            catTypes[type] = true;
            editingId = id;

            return;
        }

        // 開閉をトグルする（true ⇔ false）
        if (!editMode) {
            // 編集を開始する場合
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // 編集を終了する場合
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
    };

    /**
     * カラータグをカーソル位置に挿入する
     * @param {string} text 挿入するカラータグ
     * @param {string} type 扱う対象のテキストタイプ
     */
    const insertTextAtCursor = (text: string, type: 'title' | 'description'): void => {
        // 使用するエレメントを type に応じて選択
        const targetElement = type === 'title' ? inputElement : textAreaElement;

        // 必須条件をチェック
        if (!targetElement || !isInputFocused) {
            return;
        }

        const start = targetElement.selectionStart;
        const end = targetElement.selectionEnd;
        const currentValue = targetElement.value;

        if (start === null || end === null) {
            return;
        }

        // 新しい文字列を生成
        const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);

        // 新しい値をセットし、カーソル位置を調整
        targetElement.value = newValue;
        targetElement.setSelectionRange(start + text.length, start + text.length);

        // プレビューを更新（type に応じて分岐可能）
        if (type === 'title') {
            previewTitle = newValue;
        } else if (type === 'description') {
            previewDescription = newValue; // プレビュー変数が必要な場合
        }
    };

    /**
     * テキストエリア要素で改行を`<br>`に変換する\
     * preventDefaultで本来の改行は止められる
     * @param {KeyboardEvent} event キーボードイベント
     */
    const handleKeyDownInTextArea = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // 改行のデフォルト動作を防ぐ
            insertTextAtCursor('<br>', 'description');
        }
    };

    // 配布物配列をストアcommonDistributionData、specificDistributionDataへそれぞれ格納
    if (showCharacterId) {
        // 個人別配布物フィルター（リアクティブ）
        $effect(() => {
            if (filterCharId) {
                $specificDistributionData = distributions
                    .map((distribution) => {
                        return {
                            ...distribution,
                        };
                    })
                    .sort((a, b) => {
                        if (a.id > b.id) return 1;
                        if (a.id < b.id) return -1;
                        return 0;
                    })
                    .filter((d) => String(d.character_id) === filterCharId);
            }
        });
    } else {
        // 一般配布物フィルター
        $commonDistributionData = distributions
            .map((distribution) => {
                return {
                    ...distribution,
                };
            })
            .sort((a, b) => {
                if (a.id > b.id) return 1;
                if (a.id < b.id) return -1;
                return 0;
            })
            .filter((d) => !d.character_id);
    }
</script>

<svelte:window bind:scrollY />

<h2>
    <span class="material-symbols-outlined">package_2</span>
    {title}
    <span class="help_btn material-symbols-outlined" use:tooltip={helpText}>help</span>

    {#if showCharacterId}
        <input
            class="indiv_dist_input"
            type="text"
            bind:value={filterCharId}
            placeholder="ID"
            oninput={() => {
                // inputフィールドが空になったら配列リセット
                if (!filterCharId) {
                    specificDistributionData.set([]);
                }
            }}
        />
    {/if}

    <button class="help_btn material-symbols-outlined" type="button" onclick={() => (showContents = !showContents)} use:tooltip={showContents ? 'Hide Contents' : 'Show Contents'}>
        {#if showContents}
            visibility
        {:else}
            visibility_off
        {/if}
    </button>
</h2>

<div class="console_contents">
    {#if getDistributionData() && getDistributionData().length > 0}
        {#if showContents}
            {#each getDistributionData() as distribution}
                <form
                    action="?/updateDistributionData"
                    method="POST"
                    use:enhance={({ formData }) => {
                        const data = conv2DArrayToObject([...formData.entries()]);
                        const id = Number(data.dist_id);
                        const column = Object.keys(data)[1] as keyof Omit<Distribution, 'id'>;
                        const value = Object.values(data)[1] as string | null;

                        return async ({ result }) => {
                            msgClosed.set(false);
                            onSubmit.set(false);
                            await applyAction(result);

                            if (result.type === 'success') {
                                if (showCharacterId) {
                                    $specificDistributionData = updateDistributionData($specificDistributionData, id, column, value, updatedContentsData);
                                } else {
                                    $commonDistributionData = updateDistributionData($commonDistributionData, id, column, value, updatedContentsData);
                                }

                                // 配布対象者用処理（character_id）
                                if (column === 'character_id' && !value) {
                                    // 配布対象者を全員に指定した場合

                                    const deletedDistribution = $specificDistributionData.filter((dist) => dist.id === id); // 削除する要素を一時保存（commonへ追加のため）
                                    $specificDistributionData = $specificDistributionData.filter((dist) => dist.id !== id); // 個人別配布物から対象IDの配布物を削除
                                    $commonDistributionData = [...$commonDistributionData, ...deletedDistribution].sort((a, b) => {
                                        if (a.id > b.id) return 1;
                                        if (a.id < b.id) return -1;
                                        return 0;
                                    }); // 一般配布物へ削除されたもの（配布対象者が全員）を追加
                                } else if (column === 'character_id' && value) {
                                    // 配布対象者を誰か指定した場合

                                    const deletedDistribution = $commonDistributionData.filter((dist) => dist.id === id); // 削除する要素を一時保存（specificへ追加のため）
                                    $commonDistributionData = $commonDistributionData.filter((dist) => dist.id !== id); // 一般配布物から対象IDの配布物を削除
                                    $specificDistributionData = [...$specificDistributionData, ...deletedDistribution].sort((a, b) => {
                                        if (a.id > b.id) return 1;
                                        if (a.id < b.id) return -1;
                                        return 0;
                                    }); // 個人別配布物へ削除されたもの（配布対象者が全員）を追加
                                }
                            }
                        };
                    }}
                >
                    <input type="hidden" name="dist_id" value={editingId} />

                    <p class="console_contents_list_title">
                        <button
                            class="red_btn"
                            type="button"
                            onclick={() =>
                                prepareModal('deleteDistribution', {
                                    title: 'Delete the following distribution?',
                                    formAction: 'deleteDistribution',
                                    distId: distribution.id,
                                    distTitle: distribution.event_name,
                                    distType: distribution.type,
                                    isSpecific: showCharacterId,
                                })}
                        >
                            <span class="btn_icon material-symbols-outlined">delete</span>
                            <span class="btn_text">Delete</span>
                        </button>

                        Distribution Data
                    </p>

                    <dl class="console_contents_list">
                        <dt class="contents_term">ID</dt>
                        <dd class="contents_desc">{distribution.id}</dd>

                        <dt class="contents_term">Type</dt>
                        <dd class="contents_desc">
                            {getDistributionTypeName(distribution.type)}

                            {#if editingId === distribution.id && catTypes['type']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'type')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" onclick={() => editModeSwitch(distribution.id, 'type')}>
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === distribution.id && catTypes['type']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Distribution Type</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Select new type</dt>
                                                <dd>
                                                    <select name="type">
                                                        {#each Object.entries(DistributionTypeObj) as [key, value]}
                                                            <option value={key} selected={value === distribution.type}>{key}</option>
                                                        {/each}
                                                    </select>
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
                                                        editModeSwitch(0, 'type');
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
                            Deadline
                            <span class="help_btn material-symbols-outlined" use:tooltip={`The date is shown in your local time.<br />Time Zone: ${DateTime.local().zoneName}`}>help</span>
                        </dt>
                        <dd class="contents_desc">
                            {!distribution.deadline
                                ? 'No Deadline'
                                : DateTime.fromJSDate(distribution.deadline)
                                      .setZone(DateTime.local().zoneName)
                                      .setLocale('en')
                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}

                            {#if editingId === distribution.id && catTypes['deadline']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'deadline')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button
                                    class="normal_btn"
                                    type="button"
                                    onclick={() => {
                                        editModeSwitch(distribution.id, 'deadline');
                                        previewDeadline = !distribution.deadline ? '' : DateTime.fromJSDate(distribution.deadline).toFormat("yyyy-MM-dd'T'HH:mm");
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === distribution.id && catTypes['deadline']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">
                                                Change Date
                                                <span
                                                    class="help_btn material-symbols-outlined"
                                                    use:tooltip={'The date you set here should be based on "your local time." The date is converted to UTC and stored in the database and used in the game as UTC+9 (Japan Standard Time).<br />The converted date actually used in the game is the "True date" below.'}
                                                    >help</span
                                                >
                                            </p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Set new date</dt>
                                                <dd>
                                                    <input type="datetime-local" name="deadline" bind:value={previewDeadline} />
                                                    <input type="hidden" name="zonename" value={DateTime.local().zoneName} />
                                                </dd>
                                            </dl>

                                            <dl class="edit_area_box_parts text">
                                                <!-- UTC変換してから日本時間+9される処理を再現 -->
                                                <dt>True date</dt>
                                                <dd>
                                                    <p>
                                                        {!previewDeadline
                                                            ? 'After setting the above fields, the true date is displayed.'
                                                            : DateTime.fromISO(previewDeadline).setZone('utc').plus({ hours: 9 }).toLocaleString(DateTime.DATETIME_MED)}
                                                    </p>
                                                    <!-- <input
                                                        style="pointer-events: none;"
                                                        type="datetime-local"
                                                        value={DateTime.fromISO(previewDeadline).setZone('utc').plus({ hours: 9 }).toFormat("yyyy-MM-dd'T'HH:mm")}
                                                        readonly
                                                    /> -->
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
                                                        editModeSwitch(0, 'deadline');
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

                        <dt class="contents_term">Title</dt>
                        <dd class="contents_desc" style={isMobile ? '' : 'padding: 1% 0 1%;'}>
                            {#if !isMobile}
                                <button
                                    class="normal_btn"
                                    class:disabled_elm={isMobile}
                                    type="button"
                                    onclick={() => prepareModal('distTitleEditor', { distId: distribution.id, contents: distribution.event_name, showCharacterId })}
                                >
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {:else}
                                {#if editingId === distribution.id && catTypes['event_name']}
                                    <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'event_name')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button
                                        class="normal_btn"
                                        type="button"
                                        onclick={() => {
                                            editModeSwitch(distribution.id, 'event_name');
                                            previewTitle = convertColorString('colorTag', distribution.event_name, 'event_name');
                                        }}
                                    >
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === distribution.id && catTypes['event_name']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">
                                                    Change Title
                                                    <span
                                                        class="help_btn material-symbols-outlined"
                                                        use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p class="console_contents_note">* Text must be 32 characters or less.</p>'}
                                                        >help</span
                                                    >
                                                </p>
                                                <dl class="edit_area_box_parts text">
                                                    <div class="color_palette">
                                                        {#each Object.entries(colorPalette) as [colorName, code]}
                                                            <!-- onblurイベントでisInputFocused=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                            <button
                                                                class={`color_palette_btn ${colorName.toLowerCase()}`}
                                                                type="button"
                                                                onmousedown={() => insertTextAtCursor(`<Color${code} />`, 'title')}
                                                                aria-label="Color Palette Button"
                                                            ></button>
                                                        {/each}
                                                    </div>

                                                    <dt>Enter new title</dt>
                                                    <dd>
                                                        <input
                                                            type="text"
                                                            name="event_name"
                                                            bind:this={inputElement}
                                                            bind:value={previewTitle}
                                                            autocomplete="off"
                                                            onfocus={() => (isInputFocused = true)}
                                                            onblur={() => (isInputFocused = false)}
                                                            oninput={() => {
                                                                // <Color** /> の部分を正規表現で除外
                                                                const sanitized = previewTitle.replace(/<Color\d{2} \/>/g, '');

                                                                // 32文字以下かどうかを確認し、結果を変数に格納
                                                                isValidPreviewTitle = sanitized.length <= 32;
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
                                                            editModeSwitch(0, 'event_name');
                                                        }, 100);
                                                    }}
                                                >
                                                    <span class="btn_icon material-symbols-outlined">{!isValidPreviewTitle ? 'close' : 'check'}</span>
                                                    <span class="btn_text">{!isValidPreviewTitle ? 'Invalid Text' : 'Save'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Description</dt>
                        <dd class="contents_desc" style={isMobile ? '' : 'padding: 1% 0 1%;'}>
                            {#if !isMobile}
                                <button
                                    class="normal_btn"
                                    class:disabled_elm={isMobile}
                                    type="button"
                                    onclick={() => prepareModal('distDescEditor', { distId: distribution.id, contents: distribution.description, showCharacterId })}
                                    ><span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {:else}
                                {#if editingId === distribution.id && catTypes['description']}
                                    <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'description')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button
                                        class="normal_btn"
                                        type="button"
                                        onclick={() => {
                                            editModeSwitch(distribution.id, 'description');
                                            previewDescription = convertColorString('colorTag', distribution.description, 'event_name');
                                        }}
                                    >
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === distribution.id && catTypes['description']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">
                                                    Change Description
                                                    <span
                                                        class="help_btn material-symbols-outlined"
                                                        use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p>"&lt;br&gt;" means a line break. Line break operation can\'t be performed in this form, but "&lt;br&gt;" is inserted automatically intead.</p>'}
                                                        >help</span
                                                    >
                                                </p>
                                                <dl class="edit_area_box_parts text">
                                                    <div class="color_palette">
                                                        {#each Object.entries(colorPalette) as [colorName, code]}
                                                            <!-- onblurイベントでisInputFocused=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                            <button
                                                                class={`color_palette_btn ${colorName.toLowerCase()}`}
                                                                type="button"
                                                                onmousedown={() => insertTextAtCursor(`<Color${code} />`, 'description')}
                                                                aria-label="Color Palette Button"
                                                            ></button>
                                                        {/each}
                                                    </div>

                                                    <dt>Enter new description</dt>
                                                    <dd>
                                                        <input type="hidden" name="description" value={mobileSubmitDescHtml} />
                                                        <textarea
                                                            style="width: 100%; height: 20vh; overflow: scroll;"
                                                            bind:this={textAreaElement}
                                                            bind:value={previewDescription}
                                                            autocomplete="off"
                                                            onfocus={() => (isInputFocused = true)}
                                                            onblur={() => (isInputFocused = false)}
                                                            onkeydown={handleKeyDownInTextArea}
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
                                                            editModeSwitch(0, 'event_name');
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
                            {/if}
                        </dd>

                        <dt class="contents_term">Remaining Claims</dt>
                        <dd class="contents_desc">
                            {distribution.times_acceptable}

                            {#if editingId === distribution.id && catTypes['times_acceptable']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'times_acceptable')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button
                                    class="normal_btn"
                                    type="button"
                                    onclick={() => {
                                        editModeSwitch(distribution.id, 'times_acceptable');
                                        previewNumberVal = distribution.times_acceptable;
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === distribution.id && catTypes['times_acceptable']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">
                                                Change Remaining Claims
                                                <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999'}>help</span>
                                            </p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Set new remaining count</dt>
                                                <dd>
                                                    <NumberInput bind:value={previewNumberVal} max={999} name="times_acceptable" input={(value) => (previewNumberVal = value)} />
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
                                                        editModeSwitch(0, 'times_acceptable');
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

                        <dt class="contents_term">Scope of Distribution</dt>
                        <dd class="contents_desc">
                            <dl class="console_contents_list nested">
                                <dt class="contents_term">Character</dt>

                                <dd class="contents_desc">
                                    {charactersIdName.filter((e) => e.toLowerCase().includes(`[${distribution.character_id}] `))[0] || 'No Requirement (All Characters)'}

                                    {#if editingId === distribution.id && catTypes['character_id']}
                                        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'character_id')}>
                                            <span class="btn_icon material-symbols-outlined">close</span>
                                            <span class="btn_text">Cancel</span>
                                        </button>
                                    {:else}
                                        <button class="normal_btn" type="button" onclick={() => editModeSwitch(distribution.id, 'character_id')}>
                                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                            <span class="btn_text">Edit</span>
                                        </button>
                                    {/if}

                                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                    <div class="edit_area_box_wrapper">
                                        {#if editingId === distribution.id && catTypes['character_id']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">
                                                        Change Character Requirement
                                                        <span
                                                            class="help_btn material-symbols-outlined"
                                                            use:tooltip={'Option Format: [Character ID] Name<p class="console_contents_note">* You can\'t specify multiple characters.</p><p class="console_contents_note">* If you specify one character, items are distributed only to that character. If left blank, items are distributed to all characters.</p>'}
                                                            >help</span
                                                        >
                                                    </p>
                                                    <dl class="edit_area_box_parts text">
                                                        <dt>Select new character</dt>
                                                        <dd>
                                                            <!-- slideアニメーションバグのせいでhiddenにしているものをリスト表示のため、一時的にvisibleにする必要がある -->
                                                            <div class="select_area">
                                                                <!-- 送信されるデータ -->
                                                                <input id="selected_char" type="hidden" name="character_id" value={distribution.character_id} />

                                                                <!-- ユーザーが閲覧可能仮データ -->
                                                                <!-- charactersIdName.filterをvalueに使用すると、メニューを閉じたときにカクつくのでこれ以上使用しないこと -->
                                                                <input
                                                                    id="selected_char_tentative"
                                                                    type="text"
                                                                    value={distribution.character_id}
                                                                    oninput={(ie) => {
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
                                                                        targetCharFilteredOption = !fe.currentTarget.value
                                                                            ? []
                                                                            : charactersIdName.filter((e) => e.toLowerCase().includes(fe.currentTarget.value.toLowerCase())).slice(0, 10);
                                                                        targetCharShowDropdown = true;

                                                                        // モバイル端末ではedit_area_box_wrapper->hiddenによりリストが切れてしまうため、表示中はvisibleに変更
                                                                        const wrapper = fe.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                                        if (isMobile && wrapper) {
                                                                            wrapper.style.overflow = 'visible';
                                                                        }
                                                                    }}
                                                                    onblur={(fe) => {
                                                                        targetCharShowDropdown = false;

                                                                        // 閉じる際には元のスタイルへ戻す
                                                                        const wrapper = fe.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                                        if (isMobile && wrapper) {
                                                                            wrapper.style.overflow = 'hidden';
                                                                        }
                                                                    }}
                                                                    placeholder="Filter value..."
                                                                />

                                                                {#if targetCharShowDropdown}
                                                                    <ul class="select_area_list">
                                                                        {#if targetCharFilteredOption.length > 0}
                                                                            <Svroller width="100%" alwaysVisible={true}>
                                                                                {#each targetCharFilteredOption as option}
                                                                                    <!-- onblurイベントでshowDropdown=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                                                    <button
                                                                                        class="select_area_list_item"
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
                                                                editModeSwitch(0, 'character_id');
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
                            </dl>

                            <dl class="console_contents_list nested">
                                <dt class="contents_term">Min. HR</dt>
                                <dd class="contents_desc">
                                    {distribution.min_hr === 65535 ? noReq : convHrpToHr(distribution.min_hr)}

                                    {#if editingId === distribution.id && catTypes['min_hr']}
                                        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'min_hr')}>
                                            <span class="btn_icon material-symbols-outlined">close</span>
                                            <span class="btn_text">Cancel</span>
                                        </button>
                                    {:else}
                                        <button
                                            class="normal_btn"
                                            type="button"
                                            onclick={() => {
                                                editModeSwitch(distribution.id, 'min_hr');
                                                previewNumberVal = convHrpToHr(distribution.min_hr);
                                            }}
                                        >
                                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                            <span class="btn_text">Edit</span>
                                        </button>
                                    {/if}

                                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                    <div class="edit_area_box_wrapper">
                                        {#if editingId === distribution.id && catTypes['min_hr']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">
                                                        Change H-Rank Requirement
                                                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}>help</span>
                                                    </p>
                                                    <dl class="edit_area_box_parts text">
                                                        <dt>Set new rank</dt>
                                                        <dd>
                                                            <NumberInput bind:value={previewNumberVal} min={0} max={7} name="min_hr" input={(value) => (previewNumberVal = value)} />
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
                                                                editModeSwitch(0, 'min_hr');
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
                            </dl>

                            <dl class="console_contents_list nested">
                                <dt class="contents_term">Max. HR</dt>
                                <dd class="contents_desc">
                                    {distribution.max_hr === 65535 ? noReq : convHrpToHr(distribution.max_hr)}

                                    {#if editingId === distribution.id && catTypes['max_hr']}
                                        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'max_hr')}>
                                            <span class="btn_icon material-symbols-outlined">close</span>
                                            <span class="btn_text">Cancel</span>
                                        </button>
                                    {:else}
                                        <button
                                            class="normal_btn"
                                            type="button"
                                            onclick={() => {
                                                editModeSwitch(distribution.id, 'max_hr');
                                                previewNumberVal = convHrpToHr(distribution.max_hr);
                                            }}
                                        >
                                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                            <span class="btn_text">Edit</span>
                                        </button>
                                    {/if}

                                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                    <div class="edit_area_box_wrapper">
                                        {#if editingId === distribution.id && catTypes['max_hr']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">
                                                        Change H-Rank Requirement
                                                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}>help</span>
                                                    </p>
                                                    <dl class="edit_area_box_parts text">
                                                        <dt>Set new rank</dt>
                                                        <dd>
                                                            <NumberInput bind:value={previewNumberVal} min={0} max={7} name="max_hr" input={(value) => (previewNumberVal = value)} />
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
                                                                editModeSwitch(0, 'max_hr');
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
                            </dl>

                            <!--
                            <dl class="console_contents_list nested">
                                <dt class="contents_term">Min. SR</dt>
                                <dd class="contents_desc">
                                    {distribution.min_sr === 65535 ? noReq : distribution.min_sr}
                            
                                    {#if editingId === distribution.id && catTypes['min_sr']}
                                        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'min_sr')}>
                                            <span class="btn_icon material-symbols-outlined">close</span>
                                            <span class="btn_text">Cancel</span>
                                        </button>
                                    {:else}
                                        <button
                                            class="normal_btn"
                                            type="button"
                                            onclick={() => {
                                                editModeSwitch(distribution.id, 'min_sr');
                                                previewNumberVal = distribution.min_sr === 65535 ? 0 : distribution.min_sr;
                                            }}
                                        >
                                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                            <span class="btn_text">Edit</span>
                                        </button>
                                    {/if}
                                </dd>
                            
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === distribution.id && catTypes['min_sr']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">
                                                    Change S-Rank Requirement
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                                                </p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Set new rank</dt>
                                                    <dd>
                                                        <NumberInput bind:value={previewNumberVal} min={0} max={999} name="min_sr" input={(value) => (previewNumberVal = value)} />
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
                                                            editModeSwitch(0, 'min_sr');
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
                            </dl>
                            
                            <dl class="console_contents_list nested">
                                <dt class="contents_term">Max. SR</dt>
                                <dd class="contents_desc">
                                    {distribution.max_sr === 65535 ? noReq : distribution.max_sr}
                            
                                    {#if editingId === distribution.id && catTypes['max_sr']}
                                        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'max_sr')}>
                                            <span class="btn_icon material-symbols-outlined">close</span>
                                            <span class="btn_text">Cancel</span>
                                        </button>
                                    {:else}
                                        <button
                                            class="normal_btn"
                                            type="button"
                                            onclick={() => {
                                                editModeSwitch(distribution.id, 'max_sr');
                                                previewNumberVal = distribution.max_sr === 65535 ? 0 : distribution.max_sr;
                                            }}
                                        >
                                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                            <span class="btn_text">Edit</span>
                                        </button>
                                    {/if}
                                </dd>
                            
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === distribution.id && catTypes['max_sr']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">
                                                    Change S-Rank Requirement
                                                    <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                                                </p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Set new rank</dt>
                                                    <dd>
                                                        <NumberInput bind:value={previewNumberVal} min={0} max={999} name="max_sr" input={(value) => (previewNumberVal = value)} />
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
                                                            editModeSwitch(0, 'max_sr');
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
                            </dl>
                            -->

                            <dl class="console_contents_list nested">
                                <dt class="contents_term">Min. GR</dt>
                                <dd class="contents_desc">
                                    {distribution.min_gr === 65535 ? noReq : distribution.min_gr}

                                    {#if editingId === distribution.id && catTypes['min_gr']}
                                        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'min_gr')}>
                                            <span class="btn_icon material-symbols-outlined">close</span>
                                            <span class="btn_text">Cancel</span>
                                        </button>
                                    {:else}
                                        <button
                                            class="normal_btn"
                                            type="button"
                                            onclick={() => {
                                                editModeSwitch(distribution.id, 'min_gr');
                                                previewNumberVal = distribution.min_gr === 65535 ? 0 : distribution.min_gr;
                                            }}
                                        >
                                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                            <span class="btn_text">Edit</span>
                                        </button>
                                    {/if}

                                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                    <div class="edit_area_box_wrapper">
                                        {#if editingId === distribution.id && catTypes['min_gr']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">
                                                        Change G-Rank Requirement
                                                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                                                    </p>
                                                    <dl class="edit_area_box_parts text">
                                                        <dt>Set new rank</dt>
                                                        <dd>
                                                            <NumberInput bind:value={previewNumberVal} min={0} max={999} name="min_gr" input={(value) => (previewNumberVal = value)} />
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
                                                                editModeSwitch(0, 'min_gr');
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
                            </dl>

                            <dl class="console_contents_list nested">
                                <dt class="contents_term">Max. GR</dt>
                                <dd class="contents_desc">
                                    {distribution.max_gr === 65535 ? noReq : distribution.max_gr}

                                    {#if editingId === distribution.id && catTypes['max_gr']}
                                        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'max_gr')}>
                                            <span class="btn_icon material-symbols-outlined">close</span>
                                            <span class="btn_text">Cancel</span>
                                        </button>
                                    {:else}
                                        <button
                                            class="normal_btn"
                                            type="button"
                                            onclick={() => {
                                                editModeSwitch(distribution.id, 'max_gr');
                                                previewNumberVal = distribution.max_gr === 65535 ? 0 : distribution.max_gr;
                                            }}
                                        >
                                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                            <span class="btn_text">Edit</span>
                                        </button>
                                    {/if}

                                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                    <div class="edit_area_box_wrapper">
                                        {#if editingId === distribution.id && catTypes['max_gr']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">
                                                        Change G-Rank Requirement
                                                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                                                    </p>
                                                    <dl class="edit_area_box_parts text">
                                                        <dt>Set new rank</dt>
                                                        <dd>
                                                            <NumberInput bind:value={previewNumberVal} min={0} max={999} name="max_gr" input={(value) => (previewNumberVal = value)} />
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
                                                                editModeSwitch(0, 'max_gr');
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
                            </dl>
                        </dd>

                        <dt class="contents_term">Contents Data</dt>
                        <dd class="contents_desc" style={isMobile ? '' : 'padding: 1% 0 1%;'}>
                            {#if editingId === distribution.id && catTypes['data']}
                                <button
                                    class="red_btn"
                                    type="button"
                                    onclick={() => {
                                        editModeSwitch(0, 'data');
                                        distributionContentsData.set([]); // ストアリセット
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
                                        editModeSwitch(distribution.id, 'data');
                                        scrollYBeforeOpenData = scrollY;
                                        distributionContentsData.set(ManageDistribution.parseHexString(distribution.data));
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">expand_all</span>
                                    <span class="btn_text">Show</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === distribution.id && catTypes['data']}
                                    <div transition:slide>
                                        <input type="hidden" name="data" value="0" />
                                        <button
                                            class="green_btn add_item"
                                            type="button"
                                            onclick={() => {
                                                // リアクテイブ化のため、pushではなくスプレッド構文を使う
                                                $distributionContentsData = [
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
                                                    ...$distributionContentsData,
                                                ];
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
                                                    <li class="dist_contents_data">
                                                        <section class="dist_section" class:disabled_elm={content.disabled}>
                                                            <select
                                                                id={`${content.types}-${content.item_data.code}-[${content.item_data.name}]`}
                                                                onchange={(e) => {
                                                                    if (Number((e.target as HTMLSelectElement)?.value) === 16) {
                                                                        // イメチェンポイントの場合
                                                                        $distributionContentsData[i].types = 16;
                                                                        $distributionContentsData[i].item_data.name = 'Restyle Point';
                                                                        $distributionContentsData[i].item_data.code = '0000';
                                                                    } else {
                                                                        // selectedContentsTypeへ一時的に格納しておく。ここで仮置きすることで、content.typesと差別化できselectだけ行ってsubmitをすることによるアイテムタイプとアイテムそのものが一致しないという不具合を防ぐ。typesへ代入するのはリストから選んだ時のみ
                                                                        $distributionContentsData[i].selectedContentsType = Number((e.target as HTMLSelectElement)?.value) as DistributionContentsType;
                                                                    }
                                                                }}
                                                            >
                                                                <!-- 以下65535チェックを行う理由は初期設定をtypes準拠で行い、ユーザー操作によるリアクテイブコンテンツ変化をselectedContentsTypeで行うため -->
                                                                <option value="" disabled style="display:none;" selected={content.types === 65535}>Select contents-type.</option>
                                                                <option value="0" selected={content.selectedContentsType === 65535 ? content.types === 0 : content.selectedContentsType === 0}>
                                                                    Leg Armor
                                                                </option>
                                                                <option value="1" selected={content.selectedContentsType === 65535 ? content.types === 1 : content.selectedContentsType === 1}>
                                                                    Head Armor
                                                                </option>
                                                                <option value="2" selected={content.selectedContentsType === 65535 ? content.types === 2 : content.selectedContentsType === 2}>
                                                                    Chest Armor
                                                                </option>
                                                                <option value="3" selected={content.selectedContentsType === 65535 ? content.types === 3 : content.selectedContentsType === 3}>
                                                                    Arm Armor
                                                                </option>
                                                                <option value="4" selected={content.selectedContentsType === 65535 ? content.types === 4 : content.selectedContentsType === 4}>
                                                                    Waist Armor
                                                                </option>
                                                                <option value="5" selected={content.selectedContentsType === 65535 ? content.types === 5 : content.selectedContentsType === 5}>
                                                                    Melee Weapon
                                                                </option>
                                                                <option value="6" selected={content.selectedContentsType === 65535 ? content.types === 6 : content.selectedContentsType === 6}>
                                                                    Ranged Weapon
                                                                </option>
                                                                <option value="7" selected={content.selectedContentsType === 65535 ? content.types === 7 : content.selectedContentsType === 7}>
                                                                    Items
                                                                </option>
                                                                <option value="15" selected={content.selectedContentsType === 65535 ? content.types === 15 : content.selectedContentsType === 15}>
                                                                    Poogie Outfit
                                                                </option>
                                                                <option value="16" selected={content.selectedContentsType === 65535 ? content.types === 16 : content.selectedContentsType === 16}>
                                                                    Restyle Point
                                                                </option>
                                                            </select>

                                                            {#if content.selectedContentsType === 65535 ? content.types !== 16 : content.selectedContentsType !== 16}
                                                                <div class="select_area">
                                                                    <input
                                                                        type="text"
                                                                        value={content.item_data.name}
                                                                        oninput={(ie) => {
                                                                            // 入力値に応じてフィルタオプション変化
                                                                            distFilterOption = !ie.currentTarget.value
                                                                                ? []
                                                                                : selectedDistContentsData.filter((e) => e.toLowerCase().includes(ie.currentTarget.value.toLowerCase())).slice(0, 10);
                                                                        }}
                                                                        onfocus={(fe) => {
                                                                            // インプット要素クリックでtypeに応じてコンテンツデータロードし、初期フィルタオプション設定
                                                                            selectedDistContentsData = Object.entries(
                                                                                getDistItemsData(content.selectedContentsType === 65535 ? content.types : content.selectedContentsType),
                                                                            ).map(([key, value]) => `${key} - ${value}`);
                                                                            distFilterOption = selectedDistContentsData
                                                                                .filter((e) => e.toLowerCase().includes(fe.currentTarget.value.toLowerCase()))
                                                                                .slice(0, 10);
                                                                            $distributionContentsData[i].showDropdown = true;

                                                                            // モバイル端末ではedit_area_box_wrapper->hiddenによりリストが切れてしまうため、表示中はvisibleに変更
                                                                            const wrapper = fe.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                                            if (isMobile && wrapper) {
                                                                                wrapper.style.overflow = 'visible';
                                                                            }
                                                                        }}
                                                                        onblur={(fe) => {
                                                                            $distributionContentsData[i].showDropdown = false;

                                                                            // 閉じる際には元のスタイルへ戻す
                                                                            const wrapper = fe.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                                            if (isMobile && wrapper) {
                                                                                wrapper.style.overflow = 'hidden';
                                                                            }
                                                                        }}
                                                                        placeholder="Filter value..."
                                                                    />
                                                                    {#if content.showDropdown}
                                                                        <ul class="select_area_list">
                                                                            {#if distFilterOption.length > 0}
                                                                                <Svroller width="100%" alwaysVisible={true}>
                                                                                    {#each distFilterOption as option}
                                                                                        <!-- onblurイベントでshowDropdown=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                                                        <button
                                                                                            type="button"
                                                                                            class="select_area_list_item"
                                                                                            onmousedown={(e) => {
                                                                                                // 各アイテムデータ更新
                                                                                                $distributionContentsData[i].types =
                                                                                                    content.selectedContentsType === 65535 ? content.types : content.selectedContentsType;
                                                                                                $distributionContentsData[i].item_data.name = (e.target as HTMLButtonElement).innerText.replace(
                                                                                                    /^\w{4} - /,
                                                                                                    '',
                                                                                                );
                                                                                                $distributionContentsData[i].item_data.code = ManageDistribution.getCodeFromItemName(
                                                                                                    content.types,
                                                                                                    content.item_data.name,
                                                                                                );
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
                                                                input={() => 0}
                                                                max={999}
                                                                disabled={content.disabled}
                                                            />
                                                            <button
                                                                class="delete_btn red_btn"
                                                                class:active={content.disabled}
                                                                type="button"
                                                                aria-label="Delete Item"
                                                                onclick={() => ($distributionContentsData[i].disabled = !$distributionContentsData[i].disabled)}
                                                            >
                                                                {#if content.disabled}
                                                                    <span in:fade={{ duration: 200, delay: 150 }} out:fade={{ duration: 200 }} class="btn_icon material-symbols-outlined">undo</span>
                                                                {:else}
                                                                    <span in:fade={{ duration: 200, delay: 150 }} out:fade={{ duration: 200 }} class="btn_icon material-symbols-outlined">delete</span>
                                                                {/if}
                                                            </button>
                                                        </div>
                                                    </li>
                                                {:else}
                                                    <p class="console_contents_note">Contents data not found.</p>
                                                {/each}
                                            </Svroller>
                                        </ul>

                                        {#if $distributionContentsData}
                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                style="margin: 0 auto;"
                                                onclick={() => {
                                                    window.scrollTo(0, scrollYBeforeOpenData);
                                                    onSubmit.set(true);
                                                    $timeOut && closeMsgDisplay($timeOut);
                                                    setTimeout(() => {
                                                        // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                        editModeSwitch(0, 'data');
                                                        distributionContentsData.set([]); // ストアリセット
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
            {/each}
        {:else}
            <p class="console_contents_note">Contents are currently hidden.</p>
        {/if}
    {:else if showCharacterId && !filterCharId}
        <p class="console_contents_note">* Enter the character ID of the search target in the "ID" field above.</p>
    {:else}
        <p class="console_contents_note">No Distributions Data</p>
    {/if}
</div>
