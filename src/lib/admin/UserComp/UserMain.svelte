<script lang="ts">
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import ScrollHint from 'scroll-hint';
    import { onDestroy } from 'svelte';
    import { get } from 'svelte/store';
    import { fade, slide } from 'svelte/transition';
    import { register } from 'swiper/element/bundle';
    import { applyAction, enhance } from '$app/forms';
    import type { User, UserEditableItemType, CharacterEditableItemType, UserMainProps } from '$types';
    import {
        openModal,
        onSubmit,
        getCourseByDecimal,
        msgClosed,
        timeOut,
        closeMsgDisplay,
        conv2DArrayToObject,
        getCourseByObjData,
        filterUserValue,
        filterUserParam,
        userDisplayState,
        initUserDisplayState,
        tooltip,
        editModeSwitch as _editModeSwitch,
        pagerUserData,
        lastSearchUsersResult,
        sortId,
        Pager,
        handleCommonEditField,
        tooltipWhenOverflowText,
        preventHorizScrollOnDetailRow,
        generatePaginationBtn,
        scrollHintFlag,
        suspendReasonLabels,
    } from '$utils/client';
    import NumberInput from '$lib/common/NumberInput.svelte';
    import Character from './CharacterComp/Character.svelte';

    register(); // キャラクター用swiper登録
    let { stage = $bindable(0), scrollY, scrollYBeforeClickClaimedDist = $bindable(), openUserEditField = $bindable(), searchedUsers, isMobile }: UserMainProps = $props();
    let bindedValue = $state('');
    let bindedParam = $state('username');
    // courseControlフォーム用ラジオ pending state
    const courseCtrlPending = $state({ target: '', hl: '', ex: '' });
    let courseCtrlCheckboxes = $state<Record<string, boolean>>({});

    const resetCourseCtrl = (): void => {
        courseCtrlPending.target = '';
        courseCtrlPending.hl = '';
        courseCtrlPending.ex = '';
        courseCtrlCheckboxes = {};
    };
    let specifiedUser = $derived(courseCtrlPending.target !== 'specified');
    // rights編集フォーム用 pending state（同時に1ユーザーのみ編集可）
    let pendingRightsHl = $state('');
    let pendingRightsEx = $state('');
    let pendingRightsOther = $state<Record<string, boolean>>({});
    let rightsData: Record<string, any> = $state({});
    let ids: number[] = $state([0]);
    const userCtrlIconList = {
        'description': 'User Data',
        'group': 'Character Data',
    }; // ユーザーセクション表示切替リスト
    const adminCtrlTypes: { [key: string]: boolean } = $state({
        filter: false,
        courseCtrl: false,
    }); // 管理者コントロールパネル制御、state使用でスイッチできるように
    let catTypes: Record<UserEditableItemType, boolean> = $state({
        username: false,
        password: false,
        rights: false,
        return_expires: false,
        gacha_premium: false,
        gacha_trial: false,
        frontier_points: false,
        psn_id: false,
        wiiu_key: false,
        name: false,
        bounty: false,
        clan: false,
        reupload_binary: false,
        link: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    let editingId = $state(0); // 編集対象のユーザーID
    let searching = $state(false); // 検索中フラグ
    let selectedRowCount = $state(0); // 選択された削除行数
    let checkAll = $state(false); // 全行選択フラグ
    let isChecked: boolean[] = $state(new Array($pagerUserData.length).fill(false)); // 各行選択状態
    let pager: Pager<User> = $state(new Pager<User>([])); // pager検索後代入->$effect内でのメソッド呼び出しを可能にするためにstateで定義
    let currentPage = $state(1);
    let maxPage = $state(0);
    let filterType: 'id' | 'username' | 'psn_id' = $state('id');
    let userFilterText = $state('');
    let generatedPaginationBtn = $derived(generatePaginationBtn(currentPage, maxPage, 7)); // ページネーション用ボタン生成

    const adminCtrlSwitch = (type: string): void => {
        const isOpen = adminCtrlTypes[type];
        Object.keys(adminCtrlTypes).forEach((k) => (adminCtrlTypes[k] = false));

        if (!isOpen) {
            adminCtrlTypes[type] = true;
        }

        return;
    };

    const handleUserDelete = (): void => {
        const users = $pagerUserData.filter((_, i) => isChecked[i]).map((u) => ({ id: u.id, username: u.username }));
        openModal('deleteUsers', {
            label: 'deleteUsers',
            users,
            onSuccess: (ids) => {
                pager.deleteItem(ids);
                maxPage = pager.max;
                currentPage = Math.min(currentPage, maxPage);
            },
        });

        return;
    };

    const handleUserSuspend = (): void => {
        const users = $pagerUserData.filter((_, i) => isChecked[i]).map((u) => ({ id: u.id, username: u.username }));
        openModal('suspendUsers', {
            label: 'suspendUsers',
            type: 0,
            users,
            onSuccess: (entries) => {
                entries.forEach(({ id, permanent, reason, otherReason, suspendedBy }) => {
                    pager.updateItem(id, (u) => ({
                        ...u,
                        suspended_status: {
                            is_suspended: true as const,
                            permanent,
                            username: u.username,
                            user_id: u.id,
                            reason,
                            until_at: new Date(),
                            other_reason: otherReason,
                            by_whom: suspendedBy?.id ?? 0,
                            by_whom_username: suspendedBy?.username ?? null,
                        },
                    }));
                });
            },
        });

        return;
    };

    const handleUserUnsuspend = (user: User): void => {
        openModal('suspendUsers', {
            label: 'suspendUsers',
            type: 1,
            users: [
                {
                    id: user.id,
                    username: user.username,
                    charName: user.characters.map((character) => character.name || 'Ready to Hunt'),
                    untilAt: user.suspended_status.until_at,
                },
            ],
            onSuccess: () => {
                pager.updateItem(user.id, (u) => ({
                    ...u,
                    suspended_status: {
                        is_suspended: false as const,
                        username: null,
                        user_id: null,
                        reason: null,
                        until_at: null,
                        permanent: null,
                        other_reason: null,
                        by_whom: null,
                        by_whom_username: null,
                    },
                }));
            },
        });

        return;
    };

    const initRightsPendingState = (userId: number): void => {
        const editingUser = $pagerUserData.find((u) => u.id === userId);
        if (editingUser) {
            const courses = Object.entries(getCourseByDecimal(editingUser.rights, 'en'));
            pendingRightsHl = courses.find(([, { enabled, code }]) => enabled && ['hlc', 'rhlc', 'frc'].includes(code))?.[1].code ?? '';
            pendingRightsEx = courses.find(([, { enabled, code }]) => enabled && ['exc', 'rexc'].includes(code))?.[1].code ?? '';
            pendingRightsOther = Object.fromEntries(courses.filter(([, { code }]) => !['hlc', 'rhlc', 'frc', 'exc', 'rexc'].includes(code)).map(([, { enabled, code }]) => [code, enabled]));
        }

        return;
    };

    const editModeSwitch = (userId: number, type: UserEditableItemType): void => {
        const { updatedCatTypes, updatedEditingId } = _editModeSwitch<typeof type>(userId, type, catTypes);
        catTypes = updatedCatTypes;
        editingId = updatedEditingId;

        if (type === 'rights' && userId !== 0) {
            initRightsPendingState(userId);
        }

        return;
    };

    const handleLinkDiscord = (charId: number, discordId: string | null): void => {
        // 異なるユーザー間の連携移行に備えて全ユーザーを更新前にスキャンしてbounty残高取得（処理順に依存しない）
        // updateItems だけでは Array.map で順番に処理するため、ターゲットユーザー（UserB）がソースユーザー（UserA）より前にある場合、スキャン前に bounty_coin が null のままになる不具合があった
        let transferredBountyCoin: number | null = null;
        if (discordId) {
            for (const u of pager.getItems()) {
                const source = u.characters.find((c) => c && c.linked_discord_id === discordId && c.id !== charId);
                if (source) {
                    transferredBountyCoin = source.bounty_coin;

                    break;
                }
            }
        }

        pager.updateItems((u) => ({
            ...u,
            characters: u.characters.map((c) => {
                if (!c) {
                    return c;
                }

                if (discordId && c.linked_discord_id === discordId && c.id !== charId) {
                    return { ...c, linked_discord_id: null, bounty_coin: null };
                }

                if (c.id === charId) {
                    return {
                        ...c,
                        linked_discord_id: discordId,
                        bounty_coin: discordId ? (transferredBountyCoin ?? c.bounty_coin) : null,
                    };
                }

                return c;
            }),
        }));

        return;
    };

    const handleDeleteCharacter = (charId: number, type: 0 | 1, permanent: boolean): void => {
        pager.updateItems((u) => ({
            ...u,
            characters: type === 0 && permanent ? u.characters.filter((c) => c.id !== charId) : u.characters.map((c) => (c.id !== charId ? c : { ...c, deleted: type === 0 })),
        }));

        return;
    };

    const onCharacterUpdate = (userId: number, charIndex: number, column: CharacterEditableItemType, value: string): void => {
        pager.updateItem(userId, (u) => ({
            ...u,
            characters: u.characters.map((char, i) => {
                if (i !== charIndex || !char) {
                    return char;
                }

                switch (column) {
                    case 'name': {
                        return { ...char, name: String(value), bounty_coin: (char.bounty_coin ?? 0) - 50000 };
                    }

                    case 'bounty': {
                        return { ...char, bounty_coin: Number(value) };
                    }

                    case 'clan': {
                        return { ...char, clan: { id: 0, name: null, members: 0 } };
                    }

                    default: {
                        return char;
                    }
                }
            }),
        }));

        return;
    };

    /**
     * Pagerの初期化処理
     *
     * @param users 初期化に使用するユーザーデータ。検索結果がある場合はそのデータ、ない場合は前回の検索結果を使用
     */
    const initPager = (users: User[]) => {
        pager = new Pager(users);
        lastSearchUsersResult.set(users); // 再マウント時の復元用に保存
        pager.bindStore((data) => pagerUserData.set(data)); // 格納先ストアバインド
        maxPage = pager.max; // 最大ページ数設定

        return;
    };

    // フィルター時リアクティブ処理
    let filterInitialized = false; // マウント時の初回実行でopenUserEditFieldをリセットしないためのフラグ
    $effect(() => {
        // 依存関係はuserFilterText、filterType
        pager.clearFilters(['exact_id', 'text_username', 'text_psn_id']); // 既存のフィルターをクリア
        // filterTypeでフィルターするのは１つだけなので、クリアしないと混ざってしまう

        if (userFilterText) {
            if (filterType === 'id') {
                pager.filterExactMatch('id', Number(userFilterText));
            } else {
                pager.filterStringInclude(filterType, userFilterText.toLowerCase());
            }
        }

        currentPage = 1; // 初期ページ設定
        maxPage = pager.max; // 最大ページ数再設定
        if (filterInitialized) {
            openUserEditField = []; // 展開済み編集フィールドリセット
        }

        filterInitialized = true;
    });

    // 「表示ページ切替、フィルター、IDソート、各編集データ更新」時に、各処理リセット
    $effect(() => {
        // 依存関係は$pagerUserData
        if ($pagerUserData) {
            isChecked = new Array($pagerUserData.length).fill(false); // 各行選択状態全解除
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

    // 検索結果が既にある場合pager初期化。searchedUsersがundefined（他のform処理後の再マウント）の場合は保存済みデータで復元
    const initUsers = searchedUsers ?? get(lastSearchUsersResult);
    if (initUsers) {
        initPager(initUsers);
    }

    // 破棄時に現在のpager状態を保存（ユーザー削除・更新等の変更を次回再マウント時に反映するため）
    onDestroy(() => {
        const items = pager.getItems();
        if (items.length > 0) {
            lastSearchUsersResult.set(items);
        }
    });
</script>

{#snippet fieldButtons(col: UserEditableItemType, userId: number)}
    {#if editingId === userId && catTypes[col]}
        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, col)}>
            <span class="btn_icon material-symbols-outlined">close</span>
            <span class="btn_text">Cancel</span>
        </button>

        <button
            class="blue_btn"
            type="submit"
            onclick={() => {
                onSubmit.set(true);
                $timeOut && closeMsgDisplay($timeOut);
            }}
        >
            <span class="btn_icon material-symbols-outlined">check</span>
            <span class="btn_text">Save</span>
        </button>
    {:else}
        <button class="normal_btn" type="button" onclick={() => editModeSwitch(userId, col)}>
            <span class="btn_icon material-symbols-outlined">mode_edit</span>
            <span class="btn_text">Edit</span>
        </button>
    {/if}
{/snippet}

{#snippet cancelEditButtons(col: UserEditableItemType, userId: number)}
    {#if editingId === userId && catTypes[col]}
        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, col)}>
            <span class="btn_icon material-symbols-outlined">close</span>
            <span class="btn_text">Cancel</span>
        </button>
    {:else}
        <button class="normal_btn" type="button" onclick={() => editModeSwitch(userId, col)}>
            <span class="btn_icon material-symbols-outlined">mode_edit</span>
            <span class="btn_text">Edit</span>
        </button>
    {/if}
{/snippet}

<h2>
    <span class="material-symbols-outlined">person</span>
    User
</h2>

<div class="console_contents">
    <div class="edit_area_box" style="margin-bottom: 2%;">
        <div class="edit_area enter">
            <p class="edit_area_title" style="margin: 0;">Control Panel</p>
            <div class="group_btns" class:disabled_elm={searching} style="margin-bottom: 30px;">
                <button
                    class="blue_btn"
                    type="button"
                    onclick={() => {
                        adminCtrlSwitch('filter');
                    }}
                    class:active={adminCtrlTypes['filter']}
                >
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">User</span>
                </button>

                <button
                    class="blue_btn"
                    type="button"
                    onclick={() => {
                        if (adminCtrlTypes['courseCtrl']) {
                            resetCourseCtrl();
                        }

                        adminCtrlSwitch('courseCtrl');
                    }}
                    class:active={adminCtrlTypes['courseCtrl']}
                >
                    <span class="btn_icon material-symbols-outlined">confirmation_number</span>
                    <span class="btn_text">Course</span>
                </button>
            </div>

            {#if adminCtrlTypes['filter']}
                <div class="edit_area_box_parts text ctrl_panel">
                    <form
                        id="getPaginatedUsers"
                        action="?/getPaginatedUsers"
                        method="POST"
                        use:enhance={() => {
                            return async ({ result }) => {
                                await applyAction(result);
                                searching = false;

                                if (result.type === 'success') {
                                    initUserDisplayState(searchedUsers);
                                    openUserEditField = []; // 展開済み編集フィールドリセット（再検索時フィールド展開想定）
                                    initPager(searchedUsers);

                                    // モバイル端末の場合かつスクロールヒント既出でなければ、スクロールヒント出す
                                    if (!$scrollHintFlag && isMobile) {
                                        setTimeout(() => {
                                            new ScrollHint('.console_contents_table_wrapper', {
                                                remainingTime: '5000', // 5秒後に自動消除
                                            });
                                        }, 500); // 少し実行をずらすことで、ヒントが最初チラつくのを防ぐ

                                        scrollHintFlag.set(true);
                                    }
                                } else {
                                    msgClosed.set(false);
                                }
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterUserValue} />
                        <input name="filter_param" type="hidden" value={$filterUserParam} />

                        <div class="temp_operation_area" class:disabled_elm={searching}>
                            <label class="custom_select_box">
                                <select bind:value={bindedParam}>
                                    <option value="username">Username</option>
                                    <option value="user_id">User ID</option>
                                    <option value="character_name">Character Name</option>
                                    <option value="character_id">Character ID</option>
                                </select>
                            </label>

                            <label class="temp_operation_area_search">
                                <span class="material-symbols-outlined">search</span>
                                <input type="text" bind:value={bindedValue} placeholder="Keywords..." autocomplete="off" />
                            </label>
                        </div>
                    </form>

                    <button
                        id="btn"
                        class="green_btn"
                        class:loading_btn={searching}
                        style={!searching ? '' : 'cursor: not-allowed; pointer-events: none;'}
                        type="submit"
                        form="getPaginatedUsers"
                        onclick={() => {
                            if (!searching) {
                                searching = true;
                                (document.activeElement as HTMLInputElement).blur(); // input要素からEnterキーで検索した際に、フォーカスがinput要素に残るのを防ぐ
                                $timeOut && closeMsgDisplay($timeOut);
                                filterUserValue.set(bindedValue);
                                filterUserParam.set(bindedParam);
                            }
                        }}
                    >
                        {#if searching}
                            <span in:fade class="loading"></span>
                        {/if}

                        <span class="btn_icon material-symbols-outlined">search</span>
                        <span class="btn_text">Search</span>
                    </button>
                </div>
            {/if}

            {#if adminCtrlTypes['courseCtrl']}
                <form
                    action="?/courseControl"
                    method="POST"
                    use:enhance={({ formData }) => {
                        const data = conv2DArrayToObject([...formData.entries()]);
                        const target = String(data.target_u_radio);
                        adminCtrlSwitch('courseCtrl');
                        resetCourseCtrl();

                        return async ({ result }) => {
                            msgClosed.set(false);
                            onSubmit.set(false);
                            await applyAction(result);

                            if (result.type === 'success') {
                                delete data.target_u_radio;

                                switch (target) {
                                    case 'all': {
                                        pager.updateItems((user) => ({
                                            ...user,
                                            rights: getCourseByObjData(data),
                                        }));

                                        break;
                                    }

                                    case 'specified': {
                                        ids = data.specified_u_text.split('+').map(Number);
                                        delete data.specified_u_text;

                                        pager.updateItems((user) => ({
                                            ...user,
                                            rights: ids.includes(user.id) ? getCourseByObjData(data) : user.rights,
                                        }));

                                        break;
                                    }
                                }

                                if (editingId !== 0 && catTypes['rights']) {
                                    initRightsPendingState(editingId);
                                }
                            }
                        };
                    }}
                >
                    <dl class="edit_area_box_parts radio">
                        <dt class="course_list_title">Target User Type (Single Select)</dt>
                        <dd class="course_list">
                            <label class="course_item">
                                <span class="material-symbols-outlined">{courseCtrlPending.target === 'all' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                <input type="radio" name="target_u_radio" value="all" bind:group={courseCtrlPending.target} />All Users
                            </label>

                            <div class="course_list_user_ids">
                                <label class="course_item">
                                    <span class="material-symbols-outlined">{courseCtrlPending.target === 'specified' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                    <input type="radio" name="target_u_radio" value="specified" bind:group={courseCtrlPending.target} />User ID(s)
                                </label>
                                <span
                                    class="help_btn material-symbols-outlined"
                                    use:tooltip={'<p class="console_contents_note">* When specifying multiple user-ids in a text box, be sure to concatenate the ids with "+" and don\'t exceed 10 users.</p>'}
                                    >help</span
                                >
                                <input class:disabled_elm={specifiedUser} type="text" name="specified_u_text" placeholder="1364+1489+ ..." />
                            </div>
                        </dd>

                        <dt class="course_list_title">HL (Single Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if code === 'hlc' || code === 'rhlc' || code === 'frc'}
                                    <label class="course_item">
                                        <span class="material-symbols-outlined">{courseCtrlPending.hl === code ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="hl" value={code} bind:group={courseCtrlPending.hl} />{courseName}
                                    </label>
                                {/if}
                            {/each}
                        </dd>

                        <dt class="course_list_title">EX (Single Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if code === 'exc' || code === 'rexc'}
                                    <label class="course_item">
                                        <span class="material-symbols-outlined">{courseCtrlPending.ex === code ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="ex" value={code} bind:group={courseCtrlPending.ex} />{courseName}
                                    </label>
                                {/if}
                            {/each}
                        </dd>

                        <dt class="course_list_title">The Others (Multiple Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if code !== 'hlc' && code !== 'rhlc' && code !== 'frc' && code !== 'exc' && code !== 'rexc'}
                                    <label class="course_item" class:disabled_elm={courseName.includes('[Unused]')}>
                                        <span class="material-symbols-outlined">{courseCtrlCheckboxes[code] ? 'check_box' : 'check_box_outline_blank'}</span>
                                        <input type="checkbox" name={code} onchange={() => (courseCtrlCheckboxes[code] = !courseCtrlCheckboxes[code])} />{courseName}
                                    </label>
                                {/if}
                            {/each}
                        </dd>

                        <button
                            class="blue_btn"
                            type="submit"
                            style="margin-top: 0;"
                            onclick={() => {
                                onSubmit.set(true);
                                $timeOut && closeMsgDisplay($timeOut);
                            }}
                        >
                            <span class="btn_icon material-symbols-outlined">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </dl>
                </form>
            {/if}
        </div>
    </div>

    <div class="temp_operation_area">
        <label class="custom_select_box">
            <select bind:value={filterType}>
                <option value="id" title="The user ID.">User ID</option>
                <option value="username" title="The username.">Username</option>
                <option value="psn_id" title="The playstation network id.">PSN ID</option>
            </select>
        </label>

        <label class="temp_operation_area_search">
            <span class="material-symbols-outlined">search</span>
            <input type="text" bind:value={userFilterText} placeholder="Keywords..." autocomplete="off" />
        </label>

        <button class="red_btn" class:disabled_elm={selectedRowCount === 0} type="button" onclick={handleUserSuspend}>
            <span class="btn_icon material-symbols-outlined">lock</span>
            <span class="btn_text">Suspend</span>
        </button>

        <button class="red_btn" class:disabled_elm={selectedRowCount === 0} type="button" onclick={handleUserDelete}>
            <span class="btn_icon material-symbols-outlined">delete</span>
            <span class="btn_text">Delete</span>
        </button>
    </div>

    <div class="console_contents_table_wrapper">
        <table class="console_contents_table" class:no_mobile_scroll={isMobile && !$pagerUserData.length}>
            <thead class="console_contents_table_head user">
                <tr class="table_row" class:hide_text={!$pagerUserData.length}>
                    <th class="console_contents_table_head_header select center">
                        <button
                            class="material-symbols-outlined"
                            type="button"
                            use:tooltip={isMobile ? '' : selectedRowCount >= 1 ? `Deselect ${selectedRowCount} user(s).` : 'Select all users to delete / suspend.'}
                            onclick={() => {
                                if (!checkAll && selectedRowCount >= 1) {
                                    // 選択行全解除ボタンクリック時
                                    selectedRowCount = 0;
                                    isChecked.fill(false);
                                } else if (!checkAll) {
                                    // 全選択ボタン通常動作（停止済みユーザーを除く）
                                    isChecked = $pagerUserData.map((u) => !u.suspended_status.is_suspended);
                                    selectedRowCount = isChecked.filter(Boolean).length;
                                    checkAll = selectedRowCount > 0;
                                } else {
                                    // 全解除
                                    isChecked.fill(false);
                                    selectedRowCount = 0;
                                    checkAll = false;
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
                            openUserEditField = []; // 展開済み編集フィールドリセット
                        }}
                    >
                        User ID

                        <span class="material-symbols-outlined">sort</span>
                    </th>

                    <th class="console_contents_table_head_header username">Username</th>

                    <th class="console_contents_table_head_header last_login">Last Login</th>

                    <th class="console_contents_table_head_header other" class:center={isMobile} class:fixed_column={$pagerUserData.length}>
                        {#if openUserEditField.length}
                            <button class="material-symbols-outlined" type="button" use:tooltip={isMobile ? '' : 'Collapse all edit fields.'} onclick={() => (openUserEditField = [])}>
                                collapse_all
                            </button>
                        {/if}
                    </th>
                </tr>
            </thead>

            <tbody>
                {#each $pagerUserData as user, i}
                    <tr class="table_row" class:selected={isChecked[i]}>
                        <td class="console_contents_table_data center">
                            <button
                                class="material-symbols-outlined"
                                class:disabled_elm={user.suspended_status.is_suspended}
                                type="button"
                                use:tooltip={isMobile ? '' : !isChecked[i] ? 'Select a user to delete / suspend.' : 'Deselect a user.'}
                                onclick={() => {
                                    if (user.suspended_status.is_suspended) {
                                        return;
                                    }

                                    isChecked[i] = !isChecked[i];
                                    isChecked[i] ? selectedRowCount++ : selectedRowCount--;

                                    const nonSuspendedCount = $pagerUserData.filter((u) => !u.suspended_status.is_suspended).length;
                                    checkAll = nonSuspendedCount > 0 && selectedRowCount === nonSuspendedCount;
                                }}
                            >
                                {isChecked[i] ? 'check_box' : 'check_box_outline_blank'}
                            </button>
                        </td>

                        <td class="console_contents_table_data">{user.id}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={user.username}>
                            {user.username}
                        </td>

                        <td
                            class="console_contents_table_data"
                            use:tooltipWhenOverflowText={!user.last_login
                                ? 'None'
                                : DateTime.fromJSDate(user.last_login)
                                      .setZone(DateTime.local().zoneName)
                                      .setLocale('en')
                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        >
                            {!user.last_login
                                ? 'None'
                                : DateTime.fromJSDate(user.last_login)
                                      .setZone(DateTime.local().zoneName)
                                      .setLocale('en')
                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td class="console_contents_table_data user_tabs" class:center={isMobile} class:fixed_column={$pagerUserData.length}>
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !openUserEditField.includes(user.id) ? 'Show details.' : 'Hide details.'}
                                onclick={() => (openUserEditField = handleCommonEditField(openUserEditField, user.id))}
                            >
                                {openUserEditField.includes(user.id) ? 'close' : 'expand_circle_down'}
                            </button>

                            {#each Object.entries(userCtrlIconList) as [icon, tooltipText]}
                                <button
                                    class="material-symbols-outlined active"
                                    class:active={$userDisplayState[user.id].icon === icon}
                                    use:tooltip={tooltipText}
                                    onclick={() => {
                                        // 選択ボタンに応じてiconと表示内容更新（選択中のボタンは押下不可）
                                        if ($userDisplayState[user.id].icon !== icon) {
                                            userDisplayState.update((data) => {
                                                const userState = data[user.id];

                                                return {
                                                    ...data,
                                                    [user.id]: {
                                                        ...userState,
                                                        icon,
                                                    },
                                                };
                                            });
                                        }
                                    }}
                                    type="button">{icon}</button
                                >
                            {/each}
                        </td>
                    </tr>

                    {#if openUserEditField.includes(user.id)}
                        <tr class="detail_row">
                            <td colspan="100">
                                <form
                                    action="?/updateUser"
                                    method="POST"
                                    use:enhance={({ formData }) => {
                                        const data = conv2DArrayToObject([...formData.entries()]);
                                        const id = Number(data.user_id);
                                        const column = Object.keys(data)[1] as UserEditableItemType;
                                        const value = Object.values(data)[1];
                                        editModeSwitch(0, column);

                                        return async ({ result }) => {
                                            msgClosed.set(false);
                                            onSubmit.set(false);
                                            await applyAction(result);

                                            if (result.type === 'success') {
                                                if (column === 'rights') {
                                                    const keys = Object.keys(data);
                                                    const rightsKeys = keys.slice(2);
                                                    rightsKeys.forEach((key) => {
                                                        rightsData[key] = data[key];
                                                    });
                                                }

                                                pager.updateItem(id, (user) => ({
                                                    ...user,
                                                    [column]:
                                                        column === 'rights'
                                                            ? getCourseByObjData(rightsData)
                                                            : column === 'return_expires'
                                                              ? DateTime.fromISO(String(value)).toJSDate()
                                                              : column === 'frontier_points' || column === 'gacha_premium' || column === 'gacha_trial'
                                                                ? !value
                                                                    ? null
                                                                    : Number(value)
                                                                : (column === 'psn_id' || column === 'wiiu_key') && !value
                                                                  ? null
                                                                  : value,
                                                }));
                                            }
                                        };
                                    }}
                                >
                                    {#if $userDisplayState[user.id].icon === 'description'}
                                        <input type="hidden" name="user_id" value={user.id} />

                                        <dl class="console_contents_list">
                                            {#if user.suspended_status.is_suspended}
                                                <div class="banned_user_container">
                                                    <p class="banned_text">This user account has been {user.suspended_status.permanent ? 'permanently' : 'temporarily'} suspended.</p>
                                                    <p class="banned_detail">
                                                        Reason: {suspendReasonLabels[user.suspended_status.reason] ?? 'Unknown'}{#if user.suspended_status.reason === 0 && user.suspended_status.other_reason}
                                                            &nbsp;({user.suspended_status.other_reason})
                                                        {/if}
                                                    </p>
                                                    <p class="banned_detail">Suspended By: {user.suspended_status.by_whom_username ?? `User ID ${user.suspended_status.by_whom}`}</p>
                                                    <button class="red_btn" type="button" style="margin-top: 5%;" onclick={() => handleUserUnsuspend(user)}>
                                                        {#if !user.suspended_status.permanent}
                                                            <span class="btn_icon material-symbols-outlined">restore_from_trash</span>
                                                            <span class="btn_text">Unsuspend</span>
                                                        {/if}
                                                    </button>
                                                </div>
                                            {/if}

                                            <dt class="contents_term">User ID</dt>
                                            <dd class="contents_desc">{user.id}</dd>

                                            <dt class="contents_term">
                                                Username{#if isMobile}&nbsp;{:else}<br />{/if}
                                                <span class="contents_term_required">[Required]</span>
                                            </dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['username']}
                                                            <input class="long" type="text" name="username" value={user.username} placeholder="Enter username." autocomplete="off" />
                                                        {:else}
                                                            {user.username}
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('username', user.id)}
                                                </div>
                                            </dd>

                                            <dt class="contents_term">
                                                Hashed Password
                                                <span
                                                    class="help_btn material-symbols-outlined"
                                                    use:tooltip={'Passwords must be stored as a bcrypt hash.<br />Generate one at: <a href="https://bcrypt-generator.com/" target="_blank">bcrypt-generator.com</a>'}
                                                    >help</span
                                                >
                                                {#if isMobile}&nbsp;{:else}<br />{/if}
                                                <span class="contents_term_required">[Required]</span>
                                            </dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['password']}
                                                            <input class="long" type="text" name="password" value={user.password} placeholder="Enter hashed password." autocomplete="off" />
                                                        {:else}
                                                            {user.password}
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('password', user.id)}
                                                </div>
                                            </dd>

                                            <dt class="contents_term">Course</dt>
                                            <dd class="contents_desc">
                                                <ul>
                                                    {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [course, { enabled }]}
                                                        {#if enabled}
                                                            <li>{course}</li>
                                                        {/if}
                                                    {/each}
                                                </ul>

                                                {@render cancelEditButtons('rights', user.id)}

                                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                                <div class="edit_area_box_wrapper">
                                                    {#if editingId === user.id && catTypes['rights']}
                                                        <div transition:slide class="edit_area_box">
                                                            <input type="hidden" name="rights" />
                                                            <div class="edit_area enter">
                                                                <p class="edit_area_title">Change Courses</p>
                                                                <dl class="edit_area_box_parts radio">
                                                                    <dt class="course_list_title">HL (Single Select)</dt>
                                                                    <dd class="course_list">
                                                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { code }]}
                                                                            {#if code === 'hlc' || code === 'rhlc' || code === 'frc'}
                                                                                <label class="course_item">
                                                                                    <span class="material-symbols-outlined"
                                                                                        >{pendingRightsHl === code ? 'radio_button_checked' : 'radio_button_unchecked'}</span
                                                                                    >
                                                                                    <input type="radio" name="hl" value={code} bind:group={pendingRightsHl} />{courseName}
                                                                                </label>
                                                                            {/if}
                                                                        {/each}
                                                                    </dd>

                                                                    <dt class="course_list_title">EX (Single Select)</dt>
                                                                    <dd class="course_list">
                                                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { code }]}
                                                                            {#if code === 'exc' || code === 'rexc'}
                                                                                <label class="course_item">
                                                                                    <span class="material-symbols-outlined"
                                                                                        >{pendingRightsEx === code ? 'radio_button_checked' : 'radio_button_unchecked'}</span
                                                                                    >
                                                                                    <input type="radio" name="ex" value={code} bind:group={pendingRightsEx} />{courseName}
                                                                                </label>
                                                                            {/if}
                                                                        {/each}
                                                                    </dd>

                                                                    <dt class="course_list_title">The Others (Multiple Select)</dt>
                                                                    <dd class="course_list">
                                                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                                            {#if code !== 'hlc' && code !== 'rhlc' && code !== 'frc' && code !== 'exc' && code !== 'rexc'}
                                                                                <label class="course_item" class:disabled_elm={courseName.includes('[Unused]')}>
                                                                                    <span class="material-symbols-outlined"
                                                                                        >{(pendingRightsOther[code] ?? enabled) ? 'check_box' : 'check_box_outline_blank'}</span
                                                                                    >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        name={code}
                                                                                        checked={enabled}
                                                                                        onchange={() => (pendingRightsOther[code] = !pendingRightsOther[code])}
                                                                                    />{courseName}
                                                                                </label>
                                                                            {/if}
                                                                        {/each}
                                                                    </dd>
                                                                </dl>

                                                                <button
                                                                    class="blue_btn"
                                                                    type="submit"
                                                                    onclick={() => {
                                                                        onSubmit.set(true);
                                                                        $timeOut && closeMsgDisplay($timeOut);
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
                                                Character ID{#if isMobile}&nbsp;{:else}<br />{/if}(Last Played)
                                            </dt>
                                            <dd class="contents_desc">{user.last_character}</dd>

                                            <dt class="contents_term">Last Login Time</dt>
                                            <dd class="contents_desc">
                                                {!user.last_login
                                                    ? 'None'
                                                    : DateTime.fromJSDate(user.last_login)
                                                          .setZone(DateTime.local().zoneName)
                                                          .setLocale('en')
                                                          .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </dd>

                                            <dt class="contents_term">
                                                Expiry Date for{#if isMobile}&nbsp;{:else}<br />{/if}Return Ward{#if isMobile}&nbsp;{:else}<br />{/if}
                                                <span class="contents_term_required">[Required]</span>
                                            </dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['return_expires']}
                                                            <input
                                                                type="datetime-local"
                                                                name="return_expires"
                                                                value={!user.return_expires
                                                                    ? ''
                                                                    : DateTime.fromJSDate(user.return_expires).setZone(DateTime.local().zoneName).setLocale('en').toFormat("yyyy-MM-dd'T'HH:mm")}
                                                            />
                                                        {:else}
                                                            {!user.return_expires
                                                                ? 'None'
                                                                : DateTime.fromJSDate(user.return_expires)
                                                                      .setZone(DateTime.local().zoneName)
                                                                      .setLocale('en')
                                                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('return_expires', user.id)}
                                                </div>
                                            </dd>

                                            <dt class="contents_term">
                                                Premium Coin G
                                                <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 0 - 99999'}>help</span>
                                            </dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['gacha_premium']}
                                                            <NumberInput value={user.gacha_premium ?? 0} min={0} max={99999} name="gacha_premium" />
                                                        {:else}
                                                            {user.gacha_premium || 0} Coin(s)
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('gacha_premium', user.id)}
                                                </div>
                                            </dd>

                                            <dt class="contents_term">
                                                Trial Coin G
                                                <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 0 - 99999'}>help</span>
                                            </dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['gacha_trial']}
                                                            <NumberInput value={user.gacha_trial ?? 0} min={0} max={99999} name="gacha_trial" />
                                                        {:else}
                                                            {user.gacha_trial || 0} Coin(s)
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('gacha_trial', user.id)}
                                                </div>
                                            </dd>

                                            <dt class="contents_term">
                                                Frontier Points
                                                <span class="help_btn material-symbols-outlined" use:tooltip={'Valid value range: 0 - 999999'}>help</span>
                                            </dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['frontier_points']}
                                                            <NumberInput value={user.frontier_points ?? 0} min={0} max={999999} name="frontier_points" />
                                                        {:else}
                                                            {user.frontier_points || 0} Point(s)
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('frontier_points', user.id)}
                                                </div>
                                            </dd>

                                            <dt class="contents_term">PlayStation Network ID</dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['psn_id']}
                                                            <input class="long" type="text" name="psn_id" value={user.psn_id} autocomplete="off" />
                                                        {:else}
                                                            {user.psn_id || 'None'}
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('psn_id', user.id)}
                                                </div>
                                            </dd>

                                            <dt class="contents_term">Wii U Key</dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item">
                                                    <p class="contents_desc_item_text">
                                                        {#if editingId === user.id && catTypes['wiiu_key']}
                                                            <input class="long" type="text" name="wiiu_key" value={user.wiiu_key} autocomplete="off" />
                                                        {:else}
                                                            {user.wiiu_key || 'None'}
                                                        {/if}
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    {@render fieldButtons('wiiu_key', user.id)}
                                                </div>
                                            </dd>
                                        </dl>
                                    {:else if $userDisplayState[user.id].icon === 'group'}
                                        <!-- キャラクターを保有しているか確認する（未保有ならcharactersが[null]になる） -->
                                        {#if !user.characters[0]}
                                            <p style="color: #ff8100; margin: 1% 0 3%;">This user doesn't have any characters.</p>
                                        {:else}
                                            <Character
                                                {user}
                                                bind:stage
                                                bind:scrollY
                                                bind:scrollYBeforeClickClaimedDist
                                                {catTypes}
                                                {editingId}
                                                {editModeSwitch}
                                                {onCharacterUpdate}
                                                onDeleteCharacter={handleDeleteCharacter}
                                                onLinkDiscord={handleLinkDiscord}
                                                {isMobile}
                                            />
                                        {/if}
                                    {/if}
                                </form>
                            </td>
                        </tr>
                    {/if}
                {:else}
                    <tr class="table_row">
                        <td class="console_contents_table_data no_data" colspan="5">
                            {#if !searchedUsers}
                                Searched user(s) will be displayed here.
                            {:else}
                                No user data.
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="pagination_btn_area">
        {#if $pagerUserData.length}
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
                            openUserEditField = []; // 展開済み編集フィールドリセット
                        }
                    }}
                >
                    {page}
                </button>
            {/each}
        {/if}
    </div>
</div>
