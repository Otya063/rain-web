<script lang="ts">
    import { DateTime } from 'luxon';
    import { Svroller } from 'svrollbar';
    import { applyAction, enhance } from '$app/forms';
    import { DistributionTypeObj, type DistContentsData, type Distribution, type DistributionContentsType } from '$types';
    import {
        closeMsgDisplay,
        convertColorString,
        createDistDataDesc,
        createDistDataTitle,
        getDistItemsData,
        ManageDistribution,
        msgClosed,
        onSubmit,
        prepareModal,
        timeOut,
        tooltip,
    } from '$utils/client';
    import DistributionList from './DistributionList.svelte';
    import NumberInput from '$lib/common/NumberInput.svelte';
    import { fade } from 'svelte/transition';

    interface Props {
        distributions: Distribution[];
        charactersIdName: string[];
        isMobile: boolean;
        updatedContentsData: string;
        distAddMode: boolean;
    }
    let { distributions, charactersIdName, isMobile, updatedContentsData, distAddMode = $bindable() }: Props = $props();
    let previewDeadline = $state('');
    let previewTitle = $state('');
    let isValidPreviewTitle = $state(true);
    let inputElement: HTMLInputElement | undefined = $state();
    let isInputFocused = $state(false);
    let textAreaElement: HTMLTextAreaElement | undefined = $state();
    let previewDescription = $state('');
    let mobileSubmitDescHtml = $derived(previewDescription.replace(/<br>/g, '\n')); // モバイル用提出HTML文字列、PCはエディターを使用する
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
    let distributionContentsData = $state<DistContentsData[]>([
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
    ]);
    let selectedDistContentsData = [''];
    let distFilterOption = $state(['']);

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
</script>

{#if distAddMode}
    <h2>
        <span class="material-symbols-outlined">post_add</span>
        Add New Distribution
    </h2>

    <div class="console_contents">
        <form
            action="?/createDistData"
            method="POST"
            use:enhance={() => {
                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        // TODO: 対象の配布物データを追加する処理
                        distAddMode = false;
                    }
                };
            }}
        >
            <dl class="console_contents_list">
                {#if isMobile}
                    <dt class="contents_term">Type <span class="contents_term_required">[Required]</span></dt>
                {:else}
                    <dt class="contents_term">Type<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}
                <dd class="contents_desc">
                    <select name="type">
                        <option value="" disabled style="display:none;" selected>Select distribution-type.</option>
                        {#each Object.entries(DistributionTypeObj) as [key, _value]}
                            <option value={key}>{key}</option>
                        {/each}
                    </select>
                </dd>

                <dt class="contents_term">
                    Deadline
                    <span
                        class="help_btn material-symbols-outlined"
                        use:tooltip={'The date you set here should be based on "your local time." The date is converted to UTC and stored in the database and used in the game as UTC+9 (Japan Standard Time).<br />The converted date actually used in the game is the one shown as the "True Date."'}
                        >help</span
                    >
                </dt>
                <dd class="contents_desc">
                    <input type="datetime-local" name="deadline" bind:value={previewDeadline} />
                    <input type="hidden" name="zonename" value={DateTime.local().zoneName} />

                    <dl>
                        <!-- UTC変換してから日本時間+9される処理を再現 -->
                        <dt style="padding-top: 20px;">True Date</dt>
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
                </dd>

                {#if isMobile}
                    <dt class="contents_term">
                        Title <span class="contents_term_required">[Required]</span>
                        <span
                            class="help_btn material-symbols-outlined"
                            use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p class="console_contents_note">* Text must be 32 characters or less.</p>'}
                            >help</span
                        >
                    </dt>
                {:else}
                    <dt class="contents_term">Title<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}
                <dd class="contents_desc">
                    {#if !isMobile}
                        <input type="hidden" name="event_name" value={$createDistDataTitle} />

                        <button
                            class="normal_btn"
                            class:disabled_elm={isMobile}
                            type="button"
                            onclick={() => prepareModal('distTitleEditor', { distId: 0, contents: $createDistDataTitle || '', showCharacterId: false })}
                        >
                            <span class="btn_icon material-symbols-outlined">open_in_browser</span>
                            <span class="btn_text">Open Editor</span>
                        </button>
                    {:else}
                        <div class="color_palette" style="justify-items: center;">
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

                        {#if previewTitle}
                            <dl>
                                <dt style="padding-top: 20px;">Preview</dt>
                                <dd>
                                    <p class="preview_title">{@html convertColorString('html', previewTitle, 'event_name')}</p>
                                </dd>
                            </dl>
                        {/if}
                    {/if}
                </dd>

                {#if isMobile}
                    <dt class="contents_term">
                        Description <span class="contents_term_required">[Required]</span>
                        <span
                            class="help_btn material-symbols-outlined"
                            use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p>"&lt;br&gt;" means a line break. Line break operation can\'t be performed in this form, but "&lt;br&gt;" is inserted automatically intead.</p>'}
                            >help</span
                        >
                    </dt>
                {:else}
                    <dt class="contents_term">Description<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}
                <dd class="contents_desc">
                    {#if !isMobile}
                        <input type="hidden" name="description" value={$createDistDataDesc} />

                        <button
                            class="normal_btn"
                            class:disabled_elm={isMobile}
                            type="button"
                            onclick={() => prepareModal('distDescEditor', { distId: 0, contents: $createDistDataDesc || '', showCharacterId: false })}
                        >
                            <span class="btn_icon material-symbols-outlined">open_in_browser</span>
                            <span class="btn_text">Open Editor</span>
                        </button>
                    {:else}
                        <div class="color_palette" style="justify-items: center;">
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
                    {/if}
                </dd>

                {#if isMobile}
                    <dt class="contents_term">Remaining Claims <span class="contents_term_required">[Required]</span></dt>
                {:else}
                    <dt class="contents_term">Remaining Claims<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}
                <dd class="contents_desc">
                    <NumberInput value={1} max={999} name="times_acceptable" input={() => 0} />
                </dd>

                <dt class="contents_term">Scope of Distribution</dt>
                <dd class="contents_desc">
                    <dl class="console_contents_list nested">
                        <dt class="contents_term">
                            Character
                            <span
                                class="help_btn material-symbols-outlined"
                                use:tooltip={'Option Format: [Character ID] Name<p class="console_contents_note">* You can\'t specify multiple characters.</p><p class="console_contents_note">* If you specify one character, items are distributed only to that character. If left blank, items are distributed to all characters.</p>'}
                                >help</span
                            >
                        </dt>
                        <dd class="contents_desc">
                            <!-- 送信されるデータ -->
                            <input id="selected_char" type="hidden" name="character_id" value="" />

                            <!-- ユーザーが閲覧可能仮データ -->
                            <input
                                id="selected_char_tentative"
                                type="text"
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
                                <ul class="select_area_list" style={!isMobile ? 'width: 60%;' : 'width: 90%;'}>
                                    {#if targetCharFilteredOption.length > 0}
                                        <Svroller width="100%" alwaysVisible={true}>
                                            {#each targetCharFilteredOption as option}
                                                <!-- onblurイベントでshowDropdown=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                                <button
                                                    class="select_area_list_item"
                                                    onmousedown={(e) => {
                                                        // 閲覧できる仮データはinput:textへ代入
                                                        (document.getElementById('selected_char_tentative') as HTMLInputElement).value = (e.target as HTMLButtonElement).innerText;

                                                        // 送信するデータ（ID）をinput:hiddenへ代入
                                                        (document.getElementById('selected_char') as HTMLInputElement).value = (e.target as HTMLButtonElement).innerText?.replace(
                                                            /^\[(\d+)\].*$/,
                                                            '$1',
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
                        </dd>
                    </dl>

                    <dl class="console_contents_list nested">
                        <dt class="contents_term">
                            Min. HR
                            <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}>help</span>
                        </dt>
                        <dd class="contents_desc">
                            <NumberInput value={0} min={0} max={7} name="min_hr" input={() => 0} />
                        </dd>
                    </dl>

                    <dl class="console_contents_list nested">
                        <dt class="contents_term">
                            Max. HR
                            <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}>help</span>
                        </dt>
                        <dd class="contents_desc">
                            <NumberInput value={0} min={0} max={7} name="max_hr" input={() => 0} />
                        </dd>
                    </dl>

                    <!--
                    <dl class="console_contents_list nested">
                        <dt class="contents_term">
                            Min. SR
                            <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                        </dt>
                        <dd class="contents_desc">
                            <NumberInput value={0} min={0} max={999} name="min_sr" input={() => 0} />
                        </dd>
                    </dl>
                    
                    <dl class="console_contents_list nested">
                        <dt class="contents_term">
                            Max. SR
                            <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                        </dt>
                        <dd class="contents_desc">
                            <NumberInput value={0} min={0} max={999} name="max_sr" input={() => 0} />
                        </dd>
                    </dl>
                    -->

                    <dl class="console_contents_list nested">
                        <dt class="contents_term">
                            Min. GR
                            <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                        </dt>
                        <dd class="contents_desc">
                            <NumberInput value={0} min={0} max={999} name="min_gr" input={() => 0} />
                        </dd>
                    </dl>

                    <dl class="console_contents_list nested">
                        <dt class="contents_term">
                            Max. GR
                            <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                        </dt>
                        <dd class="contents_desc">
                            <NumberInput value={0} min={0} max={999} name="max_gr" input={() => 0} />
                        </dd>
                    </dl>
                </dd>

                <dt class="contents_term">Contents Data</dt>
                <dd class="contents_desc">
                    <button
                        class="green_btn add_item"
                        type="button"
                        onclick={() => {
                            // リアクテイブ化のため、pushではなくスプレッド構文を使う
                            distributionContentsData = [
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
                                ...distributionContentsData,
                            ];
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">add</span>

                        {#if !isMobile}
                            <span class="btn_text">Add Dist. Contents</span>
                        {/if}
                    </button>

                    <!-- モバイル用スタイルの関係上、edit_area_box_wrapperがないとedit_area_box以降のスタイルが適用されない -->
                    <div class="edit_area_box_wrapper" style="overflow: auto;">
                        <ul class="edit_area_box dist_list">
                            <Svroller width="100%" height="100%" alwaysVisible={!isMobile}>
                                {#each distributionContentsData as content, i}
                                    <li class="dist_contents_data">
                                        <section class="dist_section" class:disabled_elm={content.disabled}>
                                            <select
                                                id={`${content.types}-${content.item_data.code}-[${content.item_data.name}]`}
                                                onchange={(e) => {
                                                    if (Number((e.target as HTMLSelectElement)?.value) === 16) {
                                                        // イメチェンポイントの場合
                                                        distributionContentsData[i].types = 16;
                                                        distributionContentsData[i].item_data.name = 'Restyle Point';
                                                        distributionContentsData[i].item_data.code = '0000';
                                                    } else {
                                                        // selectedContentsTypeへ一時的に格納しておく。ここで仮置きすることで、content.typesと差別化できselectだけ行ってsubmitをすることによるアイテムタイプとアイテムそのものが一致しないという不具合を防ぐ。typesへ代入するのはリストから選んだ時のみ
                                                        distributionContentsData[i].selectedContentsType = Number((e.target as HTMLSelectElement)?.value) as DistributionContentsType;
                                                    }
                                                }}
                                            >
                                                <!-- 以下65535チェックを行う理由は初期設定をtypes準拠で行い、ユーザー操作によるリアクテイブコンテンツ変化をselectedContentsTypeで行うため -->
                                                <option value="" disabled style="display:none;" selected={content.types === 65535}>Select contents-type.</option>
                                                <option value="0" selected={content.selectedContentsType === 65535 ? content.types === 0 : content.selectedContentsType === 0}>Leg Armor</option>
                                                <option value="1" selected={content.selectedContentsType === 65535 ? content.types === 1 : content.selectedContentsType === 1}>Head Armor</option>
                                                <option value="2" selected={content.selectedContentsType === 65535 ? content.types === 2 : content.selectedContentsType === 2}>Chest Armor</option>
                                                <option value="3" selected={content.selectedContentsType === 65535 ? content.types === 3 : content.selectedContentsType === 3}>Arm Armor</option>
                                                <option value="4" selected={content.selectedContentsType === 65535 ? content.types === 4 : content.selectedContentsType === 4}>Waist Armor</option>
                                                <option value="5" selected={content.selectedContentsType === 65535 ? content.types === 5 : content.selectedContentsType === 5}>Melee Weapon</option>
                                                <option value="6" selected={content.selectedContentsType === 65535 ? content.types === 6 : content.selectedContentsType === 6}>Ranged Weapon</option>
                                                <option value="7" selected={content.selectedContentsType === 65535 ? content.types === 7 : content.selectedContentsType === 7}>Items</option>
                                                <option value="15" selected={content.selectedContentsType === 65535 ? content.types === 15 : content.selectedContentsType === 15}>Poogie Outfit</option>
                                                <option value="16" selected={content.selectedContentsType === 65535 ? content.types === 16 : content.selectedContentsType === 16}>Restyle Point</option>
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
                                                            distFilterOption = selectedDistContentsData.filter((e) => e.toLowerCase().includes(fe.currentTarget.value.toLowerCase())).slice(0, 10);
                                                            distributionContentsData[i].showDropdown = true;

                                                            // モバイル端末ではedit_area_box_wrapper->hiddenによりリストが切れてしまうため、表示中はvisibleに変更
                                                            const wrapper = fe.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                            if (isMobile && wrapper) {
                                                                wrapper.style.overflow = 'visible';
                                                            }
                                                        }}
                                                        onblur={(fe) => {
                                                            distributionContentsData[i].showDropdown = false;

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
                                                                                distributionContentsData[i].types =
                                                                                    content.selectedContentsType === 65535 ? content.types : content.selectedContentsType;
                                                                                distributionContentsData[i].item_data.name = (e.target as HTMLButtonElement).innerText.replace(/^\w{4} - /, '');
                                                                                distributionContentsData[i].item_data.code = ManageDistribution.getCodeFromItemName(
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
                                                onclick={() => (distributionContentsData[i].disabled = !distributionContentsData[i].disabled)}
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
                    </div>
                </dd>
            </dl>

            <div class="group_btns">
                <button class="red_btn" type="button" onclick={() => (distAddMode = false)}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Cancel</span>
                </button>

                <button
                    onclick={() => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);
                    }}
                    class="blue_btn"
                    type="submit"
                >
                    <span class="btn_icon material-symbols-outlined">check</span>
                    <span class="btn_text">Save</span>
                </button>
            </div>
        </form>
    </div>
{:else}
    <DistributionList title="Common" helpText="Shows what was distributed to all characters." {distributions} {charactersIdName} {isMobile} {updatedContentsData} />

    <DistributionList
        title="Specific"
        helpText="Shows what was distributed for specific character.<br />(Filter by character-id, excluding Common distributions.)"
        {distributions}
        {charactersIdName}
        showCharacterId={true}
        {isMobile}
        {updatedContentsData}
    />
{/if}
