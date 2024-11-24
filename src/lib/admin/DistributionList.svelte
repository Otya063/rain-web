<script lang="ts">
    import { DateTime } from 'luxon';
    import { slide } from 'svelte/transition';
    import { Svroller } from 'svrollbar';
    import { applyAction, enhance } from '$app/forms';
    import { DistributionTypeObj, type Distribution, type DistributionTypeName } from '$types';
    import { closeMsgDisplay, tooltip, convertColorCodeString, conv2DArrayToObject, msgClosed, onSubmit, getDistributionTypeName, ManageDistribution, timeOut } from '$utils/client';
    import NumberInput from '$lib/common/NumberInput.svelte';

    interface Props {
        title: string;
        helpText: string;
        distributions: Distribution[];
        showCharacterId?: boolean; // Individual用
        charactersIdName: string[];
    }
    let { title, helpText, distributions, showCharacterId = false, charactersIdName }: Props = $props();
    let sortedDistributions: Distribution[] | undefined = $state();
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
    let previewRemaining = $state(0);
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
    let filterText = $state('');
    let showDropdown = $state(false);
    let filteredOption = $state(['']);

    /**
     * 編集モードを切り替える
     *
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
     */
    const insertColorTagAtCursor = (text: string): void => {
        if (!inputElement || !isInputFocused) {
            return;
        }

        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        const currentValue = inputElement.value;
        if (!start || !end) {
            return;
        }

        // 新しい文字列を生成
        const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);

        // 新しい値をセットし、カーソル位置を調整
        inputElement.value = newValue;
        inputElement.setSelectionRange(start + text.length, start + text.length);
        previewTitle = newValue;
    };

    // 配布コンテンツ検索時ドロップダウンフィルター
    $effect(() => {
        if (filterText && charactersIdName) {
            filteredOption = charactersIdName.filter((e) => e.toLowerCase().includes(filterText.toLowerCase())).slice(0, 10);
        }
    });

    // 入力フィールド欄空白になったら選択肢消す
    $effect(() => {
        !filterText && (filteredOption = []);
    });

    // 配布物配列を変数sortedDistributionsへ格納
    // 別ファイルで使用する際は、$commonDistributionData、$individualDistributionDataにその都度代入すること
    if (showCharacterId) {
        // 個人別配布物フィルター（リアクテイブ）
        $effect(() => {
            if (filterCharId) {
                sortedDistributions = distributions
                    .map((distribution) => {
                        return {
                            ...distribution,
                            event_name: convertColorCodeString('colorTag', distribution.event_name),
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
        sortedDistributions = distributions
            .map((distribution) => {
                return {
                    ...distribution,
                    event_name: convertColorCodeString('colorTag', distribution.event_name),
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
                    sortedDistributions = [];
                }
            }}
        />
    {/if}
</h2>

<div class="console_contents">
    {#if sortedDistributions && sortedDistributions.length > 0}
        {#each sortedDistributions as distribution}
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
                            sortedDistributions = sortedDistributions!.map((distribution) => {
                                if (distribution.id === id) {
                                    return {
                                        ...distribution,
                                        [column]:
                                            column === 'type'
                                                ? DistributionTypeObj[value as DistributionTypeName]
                                                : column === 'event_name'
                                                  ? convertColorCodeString('colorTag', convertColorCodeString('colorCode', value!)) // 無効なカラー番号上書きのため、一度カラーコードに戻してからカラータグに再変換
                                                  : column === 'deadline'
                                                    ? !value
                                                        ? null // 無期限
                                                        : DateTime.fromISO(value).toJSDate()
                                                    : column === 'times_acceptable'
                                                      ? Number(value) // number型なので変換必要
                                                      : value,
                                    };
                                }
                                return distribution;
                            });
                        }
                    };
                }}
            >
                <input type="hidden" name="dist_id" value={editingId} />

                <p class="console_contents_list_title">Distribution Data ({distribution.id})</p>

                <dl class="console_contents_list">
                    <dt class="contents_term">ID</dt>
                    <dd class="contents_desc">{distribution.id}</dd>

                    {#if showCharacterId}
                        <dt class="contents_term">Character of<br />Distribution Target</dt>
                        <dd class="contents_desc">
                            {charactersIdName.filter((e) => e.toLowerCase().includes(`[${distribution.character_id}] `))[0] || 'Unknown Character'}

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
                                            <p class="edit_area_title">Change Distribution Target</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Select new target</dt>
                                                <dd>
                                                    <!-- Distribution.svelte内のセレクションを流用 -->
                                                    <!-- slideアニメーションバグのせいでhiddenにしているものをリスト表示のため、一時的にvisibleにする必要がある -->
                                                    <section class="dist_section" style="display: block;">
                                                        <div class="dist_select_area">
                                                            <input
                                                                type="text"
                                                                bind:value={filterText}
                                                                oninput={(e) => {
                                                                    showDropdown = true;
                                                                    const wrapper = e.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                                    if (wrapper) {
                                                                        wrapper.style.overflow = 'visible';
                                                                    }
                                                                }}
                                                                onfocus={(e) => {
                                                                    showDropdown = true;
                                                                    const wrapper = e.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                                    if (wrapper) {
                                                                        wrapper.style.overflow = 'visible';
                                                                    }
                                                                }}
                                                                onblur={(e) => {
                                                                    showDropdown = false;
                                                                    const wrapper = e.currentTarget.closest('.edit_area_box_wrapper') as HTMLDivElement | null;
                                                                    if (wrapper) {
                                                                        wrapper.style.overflow = 'hidden';
                                                                    }
                                                                }}
                                                                placeholder="Filter value..."
                                                            />

                                                            <!-- TODO: リストオプションクリックでキャラクター名を表示する、それまではsubmitボタン無効 -->
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
                    {/if}

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
                                                use:tooltip={'The date you set here should be based on "your local time." The date will be converted to UTC and stored in the database and displayed in the game as UTC+9 (Japan Standard Time).<br />The converted date actually used in the game is the "True date" below.'}
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
                                            <dt>True date used in-game</dt>
                                            <dd>
                                                <input
                                                    style="pointer-events: none;"
                                                    type="datetime-local"
                                                    value={DateTime.fromISO(previewDeadline).setZone('utc').plus({ hours: 9 }).toFormat("yyyy-MM-dd'T'HH:mm")}
                                                    readonly
                                                />
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
                    <dd class="contents_desc">
                        <p class="contenteditable">{@html convertColorCodeString('html', distribution.event_name)}</p>

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
                                    previewTitle = distribution.event_name;
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
                                                use:tooltip={'<p>Enter "&lt;Color** /&gt;" or select a color from the color-palette below to color the text after the color-tag. "**" will contain the following numbers. If any other number is specified or only text is entered, the color will be marked as white (default).</p><p style="display: grid; row-gap: 10px; grid-template-columns: repeat(3, 1fr);"><span>00 - White</span><span>01 - Black</span><span>02 - Red</span><span>03 - Green</span><span>04 - Cyan</span><span>05 - Yellow</span><span>06 - Orange</span><span>07 - Pink</span><span>16 - Blue</span></p><hr /><p class="console_contents_note">* Empty isn\'t allowed.</p><p class="console_contents_note">* Text must be 32 characters or less.</p><p class="console_contents_note">* Only uppercase and lowercase letters, single-byte numbers, and symbols (&#33; &quot; &#35; &#36; &#37; &#38; &#39; &#40; &#41; &#42; &#43; &#44; &#45; &#46; &#47; &#58; &#59; &#60; &#61; &#62; &#63; &#64; &#91; &#92; &#93; &#94; &#95; &#96; &#123; &#124; &#125; &#126;) can be entered.</p><p class="console_contents_note">* Before selecting a color from the color-palette, move the text cursor position just before the text to be colored.</p>'}
                                                >help</span
                                            >
                                        </p>
                                        <dl class="edit_area_box_parts text">
                                            <div class="color_palette">
                                                {#each Object.entries(colorPalette) as [colorName, code]}
                                                    <button
                                                        class={`color_palette_btn ${colorName.toLowerCase()}`}
                                                        type="button"
                                                        onclick={() => insertColorTagAtCursor(`<Color${code} />`)}
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
                                                    onblur={() => {
                                                        // ボタン押す際に、そのままだとinsertColorTagAtCursor実行前にfalseになってしまうため少し遅らせる
                                                        setTimeout(() => {
                                                            isInputFocused = false;
                                                        }, 500);
                                                    }}
                                                    oninput={() => {
                                                        // <Color** /> の部分を正規表現で除外
                                                        const sanitized = previewTitle.replace(/<Color\d{2} \/>/g, '');

                                                        // 使用可能文字
                                                        const allowedCharacters = /^[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]*$/;

                                                        // 許可された文字のみを含み、32文字以下かどうかを確認し、結果を変数に格納
                                                        isValidPreviewTitle = allowedCharacters.test(sanitized) && sanitized.length <= 32;
                                                    }}
                                                />
                                            </dd>
                                        </dl>

                                        <dl class="edit_area_box_parts text">
                                            <dt>Preview</dt>
                                            <dd>
                                                <p class="contenteditable">{@html convertColorCodeString('html', previewTitle)}</p>
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
                    </dd>

                    <dt class="contents_term">Description</dt>
                    <dd class="contents_desc">{distribution.description}</dd>

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
                                    previewRemaining = distribution.times_acceptable;
                                }}
                            >
                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        <div class="edit_area_box_wrapper">
                            {#if editingId === distribution.id && catTypes['times_acceptable']}
                                <div transition:slide class="edit_area_box">
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">
                                            Change Remaining Claims
                                            <span class="help_btn material-symbols-outlined" use:tooltip={'TODO'}>help</span>
                                        </p>
                                        <dl class="edit_area_box_parts text">
                                            <dt>Set new remaining count</dt>
                                            <dd style="width: auto;"><NumberInput bind:value={previewRemaining} max={999} name="times_acceptable" input={(value) => (previewRemaining = value)} /></dd>
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

                    <dt class="contents_term">Minimum HR</dt>
                    <dd class="contents_desc">{distribution.min_hr}</dd>

                    <dt class="contents_term">Maximum HR</dt>
                    <dd class="contents_desc">{distribution.max_hr}</dd>

                    <dt class="contents_term">Minimum SR</dt>
                    <dd class="contents_desc">{distribution.min_hr}</dd>

                    <dt class="contents_term">Maximum SR</dt>
                    <dd class="contents_desc">{distribution.min_sr}</dd>

                    <dt class="contents_term">Minimum GR</dt>
                    <dd class="contents_desc">{distribution.min_gr}</dd>

                    <dt class="contents_term">Maximum GR</dt>
                    <dd class="contents_desc">{distribution.max_gr}</dd>

                    <dt class="contents_term">Contents Data</dt>
                    <dd class="contents_desc" style="padding: 1% 0 1%;">
                        {#if editingId === distribution.id && catTypes['data']}
                            <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'data')}>
                                <span class="btn_icon material-symbols-outlined">collapse_all</span>
                                <span class="btn_text">Hide</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" onclick={() => editModeSwitch(distribution.id, 'data')}>
                                <span class="btn_icon material-symbols-outlined">expand_all</span>
                                <span class="btn_text">Show</span>
                            </button>
                        {/if}

                        <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                        <div class="edit_area_box_wrapper">
                            {#if editingId === distribution.id && catTypes['data']}
                                <div transition:slide class="edit_area_box">
                                    {#each ManageDistribution.parseHexString(distribution.data) as content}
                                        <hr />
                                        <p>Type: {content.types}</p>
                                        <p>Code: {content.item_data.code}</p>
                                        <p>Name: {content.item_data.name}</p>
                                        <p>Amount: {content.amount}</p>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </dd>
                </dl>
            </form>
        {/each}
    {:else if showCharacterId && !filterCharId}
        <p class="console_contents_note">* Enter the character ID of the search target in the "ID" field above.</p>
    {:else}
        <p class="console_contents_note">No Distributions Data</p>
    {/if}
</div>
