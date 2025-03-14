<script lang="ts">
    import { DateTime } from 'luxon';
    import { Svroller } from 'svrollbar';
    import { applyAction, enhance } from '$app/forms';
    import NumberInput from '$lib/common/NumberInput.svelte';
    import { DistributionCategoryObj, type Distribution } from '$types';
    import {
        closeMsgDisplay,
        allDistributionData,
        convertColorString,
        createDistDataDesc,
        createDistDataTitle,
        msgClosed,
        onSubmit,
        openModal,
        timeOut,
        tooltip,
        insertTextAtCursor,
        handleKeyDownInTextArea,
        dateTimeJSTBase,
        encodeToShiftJIS,
    } from '$utils/client';
    import DistributionContents from './DistributionContentsData.svelte';

    interface Props {
        charactersIdName: string[];
        isMobile: boolean;
        distAddMode: boolean;
        createdDistribution: Distribution;
    }
    let { charactersIdName, isMobile, distAddMode = $bindable(false), createdDistribution }: Props = $props();
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
    let submitMobileTitle = $derived(convertColorString('colorNum', previewTitle, 'event_name'));
</script>

<h2>
    <span class="material-symbols-outlined">post_add</span>
    Add New Distribution
</h2>

<div class="console_contents">
    <form
        action="?/createDistribution"
        method="POST"
        use:enhance={() => {
            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allDistributionData.update((distribution) => {
                        return [...distribution, createdDistribution];
                    }); // common/specificの元データを更新
                    // 新規作成後はDistributionListコンポーネントがマウントされるのでscript内が自動発火

                    // 各変数値リセット
                    createDistDataTitle.set('');
                    createDistDataDesc.set('');
                    distAddMode = false;
                }
            };
        }}
    >
        <dl class="console_contents_list">
            <dt class="contents_term">
                Category{#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <label class="custom_select_box">
                            <select name="category">
                                <option value="" disabled style="display:none;" selected>Select distribution category.</option>
                                {#each Object.keys(DistributionCategoryObj) as typeName}
                                    <option value={typeName}>{typeName}</option>
                                {/each}
                            </select>
                        </label>
                    </p>
                </div>
            </dd>

            <dt class="contents_term">
                Expiry
                <span class="help_btn material-symbols-outlined" use:tooltip={$dateTimeJSTBase}>help</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
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
                    </p>
                </div>
            </dd>

            <dt class="contents_term">
                Title{#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
                {#if isMobile}
                    <span
                        class="help_btn material-symbols-outlined"
                        use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p class="console_contents_note">* Text must be 32 characters or less.</p>'}
                    >
                        help
                    </span>
                {/if}
            </dt>
            <dd class="contents_desc vertical_center">
                {#if !isMobile}
                    <input type="hidden" name="event_name" value={$createDistDataTitle} />

                    <button
                        class="normal_btn"
                        class:disabled_elm={isMobile}
                        type="button"
                        onclick={() => openModal('distributionEditor', { label: 'distributionEditor', type: 0, distId: 0, contents: $createDistDataTitle || '', showCharacterId: false })}
                    >
                        <span class="btn_icon material-symbols-outlined">open_in_browser</span>
                        <span class="btn_text">Open Editor</span>
                    </button>
                {:else}
                    <div class="edit_area_box">
                        <div class="edit_area enter">
                            <dl class="edit_area_box_parts text">
                                <div class="color_palette">
                                    {#each Object.entries(colorPalette) as [colorName, code]}
                                        <!-- onblurイベントでisInputFocused=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                        <button
                                            class={`color_palette_btn ${colorName.toLowerCase()}`}
                                            type="button"
                                            onmousedown={() => insertTextAtCursor(`<Color${code} />`, inputElement, isInputFocused, (newValue) => (previewTitle = newValue))}
                                            aria-label="Color Palette Button"
                                        ></button>
                                    {/each}
                                </div>

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
                        </div>
                    </div>
                {/if}
            </dd>

            <dt class="contents_term">
                Description{#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
                {#if isMobile}
                    <span
                        class="help_btn material-symbols-outlined"
                        use:tooltip={'<p>"&lt;Color** /&gt;" is a color tag, and text after this tag is colored based on the two-digit color number in the tag. The color tag is inserted at the cursor position when you press the color button in the color palette below. Manual input is also possible. The expected color numbers are as follows:</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p>"&lt;br&gt;" means a line break. Line break operation can\'t be performed in this form, but "&lt;br&gt;" is inserted automatically instead.</p>'}
                    >
                        help
                    </span>
                {/if}
            </dt>
            <dd class="contents_desc vertical_center">
                {#if !isMobile}
                    <input type="hidden" name="description" value={$createDistDataDesc} />

                    <button
                        class="normal_btn"
                        class:disabled_elm={isMobile}
                        type="button"
                        onclick={() => openModal('distributionEditor', { label: 'distributionEditor', type: 1, distId: 0, contents: $createDistDataDesc || '', showCharacterId: false })}
                    >
                        <span class="btn_icon material-symbols-outlined">open_in_browser</span>
                        <span class="btn_text">Open Editor</span>
                    </button>
                {:else}
                    <div class="edit_area_box">
                        <div class="edit_area enter">
                            <dl class="edit_area_box_parts text">
                                <div class="color_palette">
                                    {#each Object.entries(colorPalette) as [colorName, code]}
                                        <!-- onblurイベントでisInputFocused=falseになる方がonclickより早いので使用できない。onmousedownで対応する -->
                                        <button
                                            class={`color_palette_btn ${colorName.toLowerCase()}`}
                                            type="button"
                                            onmousedown={() => insertTextAtCursor(`<Color${code} />`, textAreaElement, isInputFocused, (newValue) => (previewDescription = newValue))}
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
                                    onkeydown={(e) => handleKeyDownInTextArea(e, textAreaElement, isInputFocused, (newValue) => (previewDescription = newValue))}
                                ></textarea>
                            </dl>
                        </div>
                    </div>
                {/if}
            </dd>

            <dt class="contents_term">
                Remaining Claims{#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <NumberInput value={1} max={999} name="times_acceptable" />
                    </p>
                </div>
            </dd>

            <dt class="contents_term">Scope of Distribution</dt>
            <dd class="contents_desc nested">
                <dl class="console_contents_list">
                    <dt class="contents_term">
                        Character
                        <span
                            class="help_btn material-symbols-outlined"
                            use:tooltip={'Option Format: [Character ID] Name<p class="console_contents_note">* You can\'t specify multiple characters.</p><p class="console_contents_note">* If you specify one character, items are distributed only to that character. If left blank, items are distributed to all characters.</p>'}
                        >
                            help
                        </span>
                    </dt>
                    <dd class="contents_desc">
                        <div class="contents_desc_item">
                            <div class="contents_desc_item_text no_overflow">
                                <div class="custom_select_with_filter_wrapper">
                                    <!-- 送信されるデータ -->
                                    <input id="selected_char" type="hidden" name="character_id" value="" />

                                    <!-- ユーザーが閲覧可能仮データ -->
                                    <input
                                        id="selected_char_tentative"
                                        class="custom_select_with_filter_input"
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
                                </div>
                            </div>
                        </div>
                    </dd>
                </dl>

                <dl class="console_contents_list">
                    <dt class="contents_term">
                        Min. HR
                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}>help</span>
                    </dt>
                    <dd class="contents_desc">
                        <div class="contents_desc_item">
                            <p class="contents_desc_item_text">
                                <NumberInput value={0} min={0} max={7} name="min_hr" />
                            </p>
                        </div>
                    </dd>
                </dl>

                <dl class="console_contents_list">
                    <dt class="contents_term">
                        Max. HR
                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 7<br />0 means no requirement.'}>help</span>
                    </dt>
                    <dd class="contents_desc">
                        <div class="contents_desc_item">
                            <p class="contents_desc_item_text">
                                <NumberInput value={0} min={0} max={7} name="max_hr" />
                            </p>
                        </div>
                    </dd>
                </dl>

                <!--
                <dl class="console_contents_list">
                    <dt class="contents_term">
                        Min. SR
                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                    </dt>
                    <dd class="contents_desc">
                        <div class="contents_desc_item">
                            <p class="contents_desc_item_text">
                                <NumberInput value={0} min={0} max={999} name="min_sr"  />
                            </p>
                        </div>
                    </dd>
                </dl>

                <dl class="console_contents_list">
                    <dt class="contents_term">
                        Max. SR
                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                    </dt>
                    <dd class="contents_desc">
                        <div class="contents_desc_item">
                            <p class="contents_desc_item_text">
                                <NumberInput value={0} min={0} max={999} name="max_sr"  />
                            </p>
                        </div>
                    </dd>
                </dl>
                -->

                <dl class="console_contents_list">
                    <dt class="contents_term">
                        Min. GR
                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                    </dt>
                    <dd class="contents_desc">
                        <div class="contents_desc_item">
                            <p class="contents_desc_item_text">
                                <NumberInput value={0} min={0} max={999} name="min_gr" />
                            </p>
                        </div>
                    </dd>
                </dl>

                <dl class="console_contents_list">
                    <dt class="contents_term">
                        Max. GR
                        <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 1 - 999<br />0 means no requirement.'}>help</span>
                    </dt>
                    <dd class="contents_desc">
                        <div class="contents_desc_item">
                            <p class="contents_desc_item_text">
                                <NumberInput value={0} min={0} max={999} name="max_gr" />
                            </p>
                        </div>
                    </dd>
                </dl>
            </dd>

            <dt class="contents_term">Contents Data</dt>
            <dd class="contents_desc">
                <DistributionContents {isMobile} />
            </dd>
        </dl>

        <div class="group_btns">
            <button
                class="red_btn"
                type="button"
                onclick={() => {
                    // 各変数値リセット
                    createDistDataTitle.set('');
                    createDistDataDesc.set('');
                    distAddMode = false;
                }}
            >
                <span class="btn_icon material-symbols-outlined">close</span>
                <span class="btn_text">Cancel</span>
            </button>

            <button
                class="blue_btn"
                type="submit"
                class:disabled_elm={!isValidPreviewTitle}
                disabled={!isValidPreviewTitle}
                onclick={() => {
                    onSubmit.set(true);
                    $timeOut && closeMsgDisplay($timeOut);
                }}
            >
                <span class="btn_icon material-symbols-outlined">{!isValidPreviewTitle ? 'close' : 'check'}</span>
                <span class="btn_text">{!isValidPreviewTitle ? 'Invalid Title' : 'Save'}</span>
            </button>
        </div>
    </form>
</div>
