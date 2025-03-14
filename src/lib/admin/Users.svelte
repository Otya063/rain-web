<script lang="ts">
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { fade, slide } from 'svelte/transition';
    import { register } from 'swiper/element/bundle';
    import { applyAction, enhance } from '$app/forms';
    import type { PaginatedUsersResult, UserEditableItemType } from '$types';
    import {
        openModal,
        onSubmit,
        getCourseByDecimal,
        switchBtnInAuth,
        msgClosed,
        timeOut,
        closeMsgDisplay,
        conv2DArrayToObject,
        paginatedUsersData,
        paginationMetaData,
        getCourseByObjData,
        filterUserValue,
        filterUserParam,
        userDisplayState,
        initUserDisplayState,
        consoleContDisable,
        tooltip,
        editModeSwitch,
    } from '$utils/client';
    import Characters from './CharacterComp/Characters.svelte';
    import ClaimedDistribution from './CharacterComp/ClaimedDistribution.svelte';

    register(); // キャラクター用swiper登録
    interface Props {
        searchResult: PaginatedUsersResult;
        isMobile: boolean;
    }
    let { searchResult, isMobile }: Props = $props();
    let paginationBackClick = $state(false);
    let paginationNextClick = $state(false);
    let specifiedUser = $state(true);
    let bindedValue: string = $state('');
    let bindedParam: string = $state('username');
    let status = $state('init');
    let cursor = $state(0);
    let btnStage = $state(1);
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
    let stage = $state(0); // キャラクターページ画面切り替えフラグ（0: メインページ, 1: 配布物受取済み履歴ページ）
    let scrollY = $state(0);
    let scrollYBeforeClickClaimedDist = $state(0);
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
        more_actions: false,
        name: false,
        bounty: false,
        clan: false,
        reupload_binary: false,
        link: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    let editingId = $state(0); // 編集対象のユーザーID

    /**
     * 管理者コントロールの内容を切り替える
     *
     * @param {string} type 切り替えたいカテゴリのタイプ
     */
    const adminCtrlSwitch = (type: string): void => {
        // 別のカテゴリタイプがすでに開いているかどうかを確認
        const activeCat = Object.values(adminCtrlTypes).some((boolean) => boolean === true);

        // 開いているカテゴリがクリックされた場合（閉じる処理）、そのカテゴリを閉じる
        if (adminCtrlTypes[type]) {
            adminCtrlTypes[type] = false;

            return;
        }

        // すでに開いているカテゴリがあり、異なるカテゴリがクリックされた場合（開こうとする場合）
        if (activeCat) {
            // 全てのカテゴリを閉じる（falseに設定）
            Object.keys(adminCtrlTypes).forEach((key) => {
                adminCtrlTypes[key] = false;
            });

            // クリックされたカテゴリを開く（trueに設定）
            adminCtrlTypes[type] = true;

            return;
        }

        // 開閉をトグルする（true ⇔ false）
        adminCtrlTypes[type] = !adminCtrlTypes[type];
    };

    /**
     * 入力要素の変更に応じて利用権選択UIを更新する
     *
     * @param {Event} e 入力イベント
     * @param {'select' | 'hl1' | 'hl2' | 'ex1' | 'ex2'} [type] 更新する要素のタイプ、指定がない場合はデフォルト処理が実行される
     */
    const handleCourseInput = (e: Event, type?: 'select' | 'hl1' | 'hl2' | 'ex1' | 'ex2') => {
        switch (type) {
            case 'select': {
                document.getElementsByClassName('select')[0].textContent = 'radio_button_unchecked';
                document.getElementsByClassName('select')[1].textContent = 'radio_button_unchecked';
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = 'radio_button_checked';

                break;
            }

            case 'hl1': {
                document.getElementsByClassName('hl1')[0].textContent = 'radio_button_unchecked';
                document.getElementsByClassName('hl1')[1].textContent = 'radio_button_unchecked';
                document.getElementsByClassName('hl1')[2].textContent = 'radio_button_unchecked';
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = 'radio_button_checked';

                break;
            }

            case 'hl2': {
                document.getElementsByClassName('hl2')[0].textContent = 'radio_button_unchecked';
                document.getElementsByClassName('hl2')[1].textContent = 'radio_button_unchecked';
                document.getElementsByClassName('hl2')[2].textContent = 'radio_button_unchecked';
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = 'radio_button_checked';

                break;
            }

            case 'ex1': {
                document.getElementsByClassName('ex1')[0].textContent = 'radio_button_unchecked';
                document.getElementsByClassName('ex1')[1].textContent = 'radio_button_unchecked';
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = 'radio_button_checked';

                break;
            }

            case 'ex2': {
                document.getElementsByClassName('ex2')[0].textContent = 'radio_button_unchecked';
                document.getElementsByClassName('ex2')[1].textContent = 'radio_button_unchecked';
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = 'radio_button_checked';

                break;
            }

            default: {
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = elm!.textContent === 'check_box_outline_blank' ? 'check_box' : 'check_box_outline_blank';
            }
        }
    };

    /**
     * 編集モードを切り替える
     *
     * @param {number} userId 編集対象のユーザーID
     * @param {UserEditableItemType} type 切り替えたいカテゴリのタイプ
     */
    const handleEditModeSwitch = (userId: number, type: UserEditableItemType): void => {
        const { updatedCatTypes, updatedEditingId } = editModeSwitch<typeof type>(userId, type, catTypes);
        catTypes = updatedCatTypes;
        editingId = updatedEditingId;
    };
</script>

<svelte:window
    bind:scrollY
    onclick={(e) => {
        const target = e.target as HTMLElement;

        // その他のアクションエリア外をクリック時、全メニュー閉じる
        if (!(target.tagName === 'BUTTON' && target.classList.contains('material-symbols-outlined') && target.innerText === 'more_vert')) {
            userDisplayState.update((state) => {
                const newState = { ...state };

                for (const userId in newState) {
                    newState[userId] = {
                        ...newState[userId],
                        enableMoreActions: false,
                    };
                }

                return newState;
            });
        }
    }}
/>

{#if stage === 0}
    <h2>
        <span class="material-symbols-outlined">person</span>
        User List
    </h2>

    <div class="console_contents">
        <!-- 「div.edit_area_box_wrapper」は必要ないが、モバイル用スタイルが崩れる関係上ワラップしておく -->
        <div class="edit_area_box_wrapper">
            <div class="edit_area_box" style="margin-bottom: 2%;">
                <div class="edit_area enter">
                    <p class="edit_area_title" style="margin: 0;">Admin Control Panel</p>
                    <div class="group_btns" style="margin-bottom: 30px;">
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
                                adminCtrlSwitch('courseCtrl');
                            }}
                            class:active={adminCtrlTypes['courseCtrl']}
                        >
                            <span class="btn_icon material-symbols-outlined">confirmation_number</span>
                            <span class="btn_text">Course</span>
                        </button>
                    </div>

                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                    <div class="edit_area_box_wrapper">
                        {#if adminCtrlTypes['filter']}
                            <div transition:slide class="edit_area_box_parts text admin_ctrl">
                                <form
                                    id="getPaginatedUsers"
                                    class="filter_form"
                                    action="?/getPaginatedUsers"
                                    method="POST"
                                    use:enhance={() => {
                                        // 送信ボタンクリック時
                                        consoleContDisable(true);
                                        const btnElm = document.getElementById('btn');
                                        const inputElm = document.querySelectorAll('#filter_input');
                                        switchBtnInAuth(false, btnElm, null, inputElm);
                                        btnStage = 0;

                                        return async ({ result }) => {
                                            await applyAction(result);
                                            switchBtnInAuth(true, btnElm, null, inputElm);
                                            btnStage = 1;

                                            if (result.type === 'success') {
                                                paginatedUsersData.set(searchResult.users);
                                                paginationMetaData.set(searchResult.meta);
                                                initUserDisplayState(searchResult.users);
                                            } else {
                                                msgClosed.set(false);
                                            }

                                            consoleContDisable(false);
                                        };
                                    }}
                                >
                                    <input name="filter_value" type="hidden" value={$filterUserValue} />
                                    <input name="filter_param" type="hidden" value={$filterUserParam} />
                                    <input name="status" type="hidden" bind:value={status} />

                                    <select class="filter_select" bind:value={bindedParam}>
                                        <option value="username">Username</option>
                                        <option value="user_id">User ID</option>
                                        <option value="character_name">Character Name</option>
                                        <option value="character_id">Character ID</option>
                                    </select>
                                    ：
                                    <input id="filter_input" type="text" placeholder="Filter value." bind:value={bindedValue} />
                                </form>

                                <button
                                    id="btn"
                                    class="green_btn"
                                    type="submit"
                                    form="getPaginatedUsers"
                                    onclick={() => {
                                        $timeOut && closeMsgDisplay($timeOut);
                                        filterUserValue.set(bindedValue);
                                        filterUserParam.set(bindedParam);
                                        status = 'init';
                                    }}
                                >
                                    {#if btnStage === 0}
                                        <span in:fade class="loading"></span>
                                    {:else if btnStage === 1}
                                        <span in:fade={{ delay: 100 }} class="btn_icon material-symbols-outlined">search</span>
                                        <span in:fade={{ delay: 100 }} class="btn_text">Search</span>
                                    {/if}
                                </button>
                            </div>
                        {/if}
                    </div>

                    <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                    <div class="edit_area_box_wrapper">
                        {#if adminCtrlTypes['courseCtrl']}
                            <form
                                transition:slide
                                action="?/courseControl"
                                method="POST"
                                use:enhance={({ formData }) => {
                                    const data = conv2DArrayToObject([...formData.entries()]);
                                    const target = String(data.target_u_radio);

                                    return async ({ result }) => {
                                        msgClosed.set(false);
                                        onSubmit.set(false);
                                        await applyAction(result);

                                        if (result.type === 'success') {
                                            delete data.target_u_radio;

                                            if ($paginatedUsersData) {
                                                switch (target) {
                                                    case 'all': {
                                                        $paginatedUsersData = $paginatedUsersData.map((user) => ({
                                                            ...user,
                                                            rights: getCourseByObjData(data),
                                                        }));

                                                        break;
                                                    }

                                                    case 'specified': {
                                                        ids = data.specified_u_text.split('+').map(Number);
                                                        delete data.specified_u_text;

                                                        $paginatedUsersData = $paginatedUsersData.map((user) => ({
                                                            ...user,
                                                            rights: ids.includes(user.id) ? getCourseByObjData(data) : user.rights,
                                                        }));

                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    };
                                }}
                            >
                                <dl class="edit_area_box_parts radio">
                                    <dt class="course_list_title">Target User Type (Single Select)</dt>
                                    <dd class="course_list">
                                        <label class="course_item">
                                            <span class="material-symbols-outlined select">radio_button_unchecked</span>
                                            <input
                                                type="radio"
                                                name="target_u_radio"
                                                value="all"
                                                onchange={(e) => {
                                                    specifiedUser = true;
                                                    handleCourseInput(e, 'select');
                                                }}
                                            />All Users
                                        </label>

                                        <div class="course_list_user_ids">
                                            <label class="course_item">
                                                <span class="material-symbols-outlined select">radio_button_unchecked</span>
                                                <input
                                                    type="radio"
                                                    name="target_u_radio"
                                                    value="specified"
                                                    onchange={(e) => {
                                                        specifiedUser = false;
                                                        handleCourseInput(e, 'select');
                                                    }}
                                                />User ID(s)
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
                                                    <span class="material-symbols-outlined hl1">radio_button_unchecked</span>
                                                    <input type="radio" name="hl" value={code} onchange={(e) => handleCourseInput(e, 'hl1')} />{courseName}
                                                </label>
                                            {/if}
                                        {/each}
                                    </dd>

                                    <dt class="course_list_title">EX (Single Select)</dt>
                                    <dd class="course_list">
                                        {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                            {#if code === 'exc' || code === 'rexc'}
                                                <label class="course_item">
                                                    <span class="material-symbols-outlined ex1">radio_button_unchecked</span>
                                                    <input type="radio" name="ex" value={code} onchange={(e) => handleCourseInput(e, 'ex1')} />{courseName}
                                                </label>
                                            {/if}
                                        {/each}
                                    </dd>

                                    <dt class="course_list_title">The Others (Multiple Select)</dt>
                                    <dd class="course_list">
                                        {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                            {#if code !== 'hlc' && code !== 'rhlc' && code !== 'frc' && code !== 'exc' && code !== 'rexc'}
                                                <label class="course_item" class:disabled_elm={courseName.includes('[Unused]')}>
                                                    <span class="material-symbols-outlined">check_box_outline_blank</span>
                                                    <input type="checkbox" name={code} onchange={(e) => handleCourseInput(e)} />{courseName}
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
                                            adminCtrlSwitch('courseCtrl');
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
            </div>
        </div>

        {#if !$paginatedUsersData.length}
            <p class="console_contents_note">Searched user(s) will be displayed here.</p>
        {:else}
            {#if $paginationMetaData.hasPrevPage || $paginationMetaData.hasNextPage}
                <div class="pagination_btn_list">
                    <form
                        method="POST"
                        action="?/getPaginatedUsers"
                        use:enhance={() => {
                            consoleContDisable(true);

                            return async ({ result }) => {
                                paginationBackClick = false;
                                paginationNextClick = false;
                                await applyAction(result);

                                if (result.type === 'success') {
                                    paginatedUsersData.set(searchResult.users);
                                    paginationMetaData.set(searchResult.meta);
                                    initUserDisplayState(searchResult.users);
                                } else {
                                    msgClosed.set(false);
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterUserValue} />
                        <input name="filter_param" type="hidden" value={$filterUserParam} />
                        <input name="status" type="hidden" bind:value={status} />
                        <input type="hidden" name="cursor" bind:value={cursor} />

                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationBackClick = true;
                                status = 'back';
                                cursor = $paginationMetaData.prevCursor;
                            }}
                            class:active={paginationBackClick}
                            class:disabled_elm={!$paginationMetaData.hasPrevPage}>Back</button
                        >
                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationNextClick = true;
                                status = 'next';
                                cursor = $paginationMetaData.nextCursor;
                            }}
                            class:active={paginationNextClick}
                            class:disabled_elm={!$paginationMetaData.hasNextPage}>Next</button
                        >
                    </form>
                </div>
            {/if}

            {#each $paginatedUsersData as user}
                <form
                    action="?/updateUserData"
                    method="POST"
                    use:enhance={({ formData }) => {
                        const data = conv2DArrayToObject([...formData.entries()]);
                        const id = Number(data.user_id);
                        const column = Object.keys(data)[1];
                        const value = Object.values(data)[1];

                        return async ({ result }) => {
                            msgClosed.set(false);
                            onSubmit.set(false);
                            await applyAction(result);

                            if (result.type === 'success') {
                                // 編集したユーザーデータの各値を更新
                                if (column === 'rights') {
                                    const keys = Object.keys(data);
                                    const rightsKeys = keys.slice(2);
                                    rightsKeys.forEach((key) => {
                                        rightsData[key] = data[key];
                                    });
                                }

                                $paginatedUsersData = $paginatedUsersData.map((user) => {
                                    if (user.id === id)
                                        return {
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
                                        };

                                    return user;
                                });
                            }
                        };
                    }}
                >
                    <div class="console_contents_list_title">
                        <div class="user_ctrl_panel">
                            <p class="console_contents_list_title_text">{user.username}</p>

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
                        </div>

                        <button
                            class="material-symbols-outlined"
                            type="button"
                            use:tooltip={'More Actions'}
                            onclick={() => ($userDisplayState[user.id].enableMoreActions = !$userDisplayState[user.id].enableMoreActions)}
                        >
                            more_vert
                        </button>

                        {#if $userDisplayState[user.id].enableMoreActions}
                            <ul class="more_actions_list">
                                <li class="more_actions_list_item">
                                    <button
                                        class="menu_btn"
                                        type="button"
                                        onmousedown={() =>
                                            openModal('suspendUser', {
                                                label: 'suspendUser',
                                                type: 0,
                                                userId: user.id,
                                                username: user.username,
                                                charName: user.characters.map((character) => (!character ? 'No Characters' : character.name || 'Ready to Hunt')),
                                                // キャラクター未保有なら'No Characters'表示
                                            })}
                                    >
                                        <span class="btn_icon material-symbols-outlined">lock</span>
                                        <span class="btn_text">Suspend</span>
                                    </button>
                                </li>

                                <li class="more_actions_list_item">
                                    <button
                                        class="menu_btn"
                                        type="button"
                                        onmousedown={() =>
                                            openModal('deleteUser', {
                                                label: 'deleteUser',
                                                userId: user.id,
                                                username: user.username,
                                            })}
                                    >
                                        <span class="btn_icon material-symbols-outlined">delete</span>
                                        <span class="btn_text">Delete</span>
                                    </button>
                                </li>
                            </ul>
                        {/if}
                    </div>

                    {#if $userDisplayState[user.id].icon === 'description'}
                        <input type="hidden" name="user_id" value={user.id} />

                        <dl class="console_contents_list">
                            {#if user.suspended_status.is_suspended}
                                <div class="banned_user_container">
                                    <p class="banned_text">This user account has been {user.suspended_status.permanent ? 'permanently' : 'temporarily'} suspended.</p>
                                    <button
                                        class="red_btn"
                                        type="button"
                                        style="margin-top: 5%;"
                                        onclick={() =>
                                            openModal('suspendUser', {
                                                label: 'suspendUser',
                                                type: 1,
                                                userId: user.id,
                                                username: user.username,
                                                charName: user.characters.map((character) => character.name || 'Ready to Hunt'),
                                                untilAt: user.suspended_status.until_at,
                                            })}
                                    >
                                        {#if !user.suspended_status.permanent}
                                            <span class="btn_icon material-symbols-outlined">restore_from_trash</span>
                                            <span class="btn_text">Unsuspend</span>
                                        {/if}
                                    </button>
                                </div>
                            {/if}

                            <dt class="contents_term">User ID</dt>
                            <dd class="contents_desc">{user.id}</dd>

                            <dt class="contents_term">Username</dt>
                            <dd class="contents_desc">
                                {user.username}

                                {#if editingId === user.id && catTypes['username']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'username')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'username')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['username']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change Username</p>
                                                <p class="console_contents_note">* Empty isn't allowed.</p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Enter new username</dt>
                                                    <dd>
                                                        <input type="text" name="username" value={user.username} autocomplete="off" />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'username'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            <dt class="contents_term">Hashed Password</dt>
                            <dd class="contents_desc">
                                {user.password}

                                {#if editingId === user.id && catTypes['password']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'password')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'password')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['password']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change Password</p>
                                                <p class="console_contents_note">* Empty isn't allowed.</p>
                                                <p class="console_contents_note">
                                                    * To manually generate a hashed password, click <a
                                                        href="https://bcrypt-generator.com/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style="text-decoration: underline;">here</a
                                                    >.
                                                </p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Enter new hashed password</dt>
                                                    <dd>
                                                        <input type="text" name="password" value={user.password} autocomplete="off" />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'password'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            <dt class="contents_term">Course</dt>
                            <dd class="contents_desc">
                                <ul>
                                    {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [course, { enabled }]}
                                        {#if enabled}
                                            <li>{course}</li>
                                        {/if}
                                    {/each}
                                </ul>

                                {#if editingId === user.id && catTypes['rights']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'rights')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'rights')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

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
                                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                            {#if code === 'hlc' || code === 'rhlc' || code === 'frc'}
                                                                <label class="course_item">
                                                                    <span class="material-symbols-outlined hl2">{enabled ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                                                    <input type="radio" name="hl" value={code} checked={enabled} onchange={(e) => handleCourseInput(e, 'hl2')} />{courseName}
                                                                </label>
                                                            {/if}
                                                        {/each}
                                                    </dd>

                                                    <dt class="course_list_title">EX (Single Select)</dt>
                                                    <dd class="course_list">
                                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                            {#if code === 'exc' || code === 'rexc'}
                                                                <label class="course_item">
                                                                    <span class="material-symbols-outlined ex2">{enabled ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                                                    <input type="radio" name="ex" value={code} checked={enabled} onchange={(e) => handleCourseInput(e, 'ex2')} />{courseName}
                                                                </label>
                                                            {/if}
                                                        {/each}
                                                    </dd>

                                                    <dt class="course_list_title">The Others (Multiple Select)</dt>
                                                    <dd class="course_list">
                                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                            {#if code !== 'hlc' && code !== 'rhlc' && code !== 'frc' && code !== 'exc' && code !== 'rexc'}
                                                                <label class="course_item" class:disabled_elm={courseName.includes('[Deprecated]')}>
                                                                    <span class="material-symbols-outlined">{enabled ? 'check_box' : 'check_box_outline_blank'}</span>
                                                                    <input type="checkbox" name={code} checked={enabled} onchange={(e) => handleCourseInput(e)} />{courseName}
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
                                                        handleEditModeSwitch(0, 'rights'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            {#if isMobile}
                                <dt class="contents_term">Character ID (Last Played)</dt>
                            {:else}
                                <dt class="contents_term">Character ID<br />(Last Played)</dt>
                            {/if}

                            <dd class="contents_desc">{user.last_character}</dd>

                            <dt class="contents_term">Last Login Time</dt>
                            <dd class="contents_desc">
                                {DateTime.fromJSDate(user.last_login || new Date(0))
                                    .setZone(DateTime.local().zoneName)
                                    .setLocale('en')
                                    .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </dd>

                            {#if isMobile}
                                <dt class="contents_term">Expiry Date for Return Ward</dt>
                            {:else}
                                <dt class="contents_term">Expiry Date for<br />Return Ward</dt>
                            {/if}

                            <dd class="contents_desc">
                                {DateTime.fromJSDate(user.return_expires || new Date(0))
                                    .setZone(DateTime.local().zoneName)
                                    .setLocale('en')
                                    .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}

                                {#if editingId === user.id && catTypes['return_expires']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'return_expires')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'return_expires')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['return_expires']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change Date</p>
                                                <p class="console_contents_note">* The date and time to be set are automatically converted to UTC.</p>
                                                <p class="console_contents_note">* Empty isn't allowed.</p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Set new date</dt>
                                                    <dd>
                                                        <input
                                                            type="datetime-local"
                                                            name="return_expires"
                                                            value={!user.return_expires ? '' : DateTime.fromJSDate(user.return_expires).toFormat("yyyy-MM-dd'T'HH:mm")}
                                                        />
                                                        <input type="hidden" name="zonename" value={DateTime.local().zoneName} />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'return_expires'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            <dt class="contents_term">Premium Coin G</dt>
                            <dd class="contents_desc">
                                {user.gacha_premium || 0} Coin(s)

                                {#if editingId === user.id && catTypes['gacha_premium']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'gacha_premium')}>
                                        <span style="margin: 1% 0%;" class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'gacha_premium')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['gacha_premium']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change the Quantity of Coins</p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Enter the quantity</dt>
                                                    <dd>
                                                        <input
                                                            type="text"
                                                            name="gacha_premium"
                                                            inputmode="numeric"
                                                            pattern="\d*"
                                                            value={!user.gacha_premium ? null : user.gacha_premium}
                                                            placeholder="Enter the quantity."
                                                        />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'gacha_premium'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            <dt class="contents_term">Trial Coin G</dt>
                            <dd class="contents_desc">
                                {user.gacha_trial || 0} Coin(s)

                                {#if editingId === user.id && catTypes['gacha_trial']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'gacha_trial')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'gacha_trial')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['gacha_trial']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change the Quantity of Coins</p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Enter the quantity</dt>
                                                    <dd>
                                                        <input
                                                            type="text"
                                                            name="gacha_trial"
                                                            inputmode="numeric"
                                                            pattern="\d*"
                                                            value={!user.gacha_trial ? null : user.gacha_trial}
                                                            placeholder="Enter the quantity."
                                                        />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'gacha_trial'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            <dt class="contents_term">Frontier Points</dt>
                            <dd class="contents_desc">
                                {user.frontier_points || 0} Point(s)

                                {#if editingId === user.id && catTypes['frontier_points']}
                                    <button type="button" class="red_btn" onclick={() => handleEditModeSwitch(0, 'frontier_points')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button type="button" class="normal_btn" onclick={() => handleEditModeSwitch(user.id, 'frontier_points')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['frontier_points']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change the Quantity of Points</p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Enter the quantity</dt>
                                                    <dd>
                                                        <input
                                                            type="text"
                                                            name="frontier_points"
                                                            inputmode="numeric"
                                                            pattern="\d*"
                                                            value={!user.frontier_points ? null : user.frontier_points}
                                                            placeholder="Enter the quantity."
                                                        />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'frontier_points'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            <dt class="contents_term">PlayStation Network ID</dt>
                            <dd class="contents_desc">
                                {user.psn_id || 'None'}

                                {#if editingId === user.id && catTypes['psn_id']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'psn_id')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'psn_id')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['psn_id']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change PSN ID</p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Enter new PSN ID</dt>
                                                    <dd>
                                                        <input type="text" name="psn_id" value={user.psn_id} autocomplete="off" />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'psn_id'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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

                            <dt class="contents_term">Wii U Key</dt>
                            <dd class="contents_desc">
                                {user.wiiu_key || 'None'}

                                {#if editingId === user.id && catTypes['wiiu_key']}
                                    <button class="red_btn" type="button" onclick={() => handleEditModeSwitch(0, 'wiiu_key')}>
                                        <span class="btn_icon material-symbols-outlined">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" onclick={() => handleEditModeSwitch(user.id, 'wiiu_key')}>
                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                                <div class="edit_area_box_wrapper">
                                    {#if editingId === user.id && catTypes['wiiu_key']}
                                        <div transition:slide class="edit_area_box">
                                            <div class="edit_area enter">
                                                <p class="edit_area_title">Change Wii U Key</p>
                                                <dl class="edit_area_box_parts text">
                                                    <dt>Enter new Wii U Key</dt>
                                                    <dd>
                                                        <input type="text" name="wiiu_key" value={user.wiiu_key} autocomplete="off" />
                                                    </dd>
                                                </dl>

                                                <button
                                                    class="blue_btn"
                                                    type="submit"
                                                    onclick={() => {
                                                        onSubmit.set(true);
                                                        $timeOut && closeMsgDisplay($timeOut);
                                                        handleEditModeSwitch(0, 'wiiu_key'); // フォーム送信にeditingIdは使用していないため、リセットを遅らせる必要はない
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
                    {:else if $userDisplayState[user.id].icon === 'group'}
                        <!-- キャラクターを保有しているか確認する（未保有ならcharactersが[null]になる） -->
                        {#if !user.characters[0]}
                            <p style="color: #ff8100; margin: 1% 0 3%;">This user doesn't have any characters.</p>
                        {:else}
                            <Characters {user} bind:stage bind:scrollY bind:scrollYBeforeClickClaimedDist {catTypes} {editingId} {handleEditModeSwitch} />
                        {/if}
                    {/if}
                </form>
            {/each}

            {#if $paginationMetaData.hasPrevPage || $paginationMetaData.hasNextPage}
                <div class="pagination_btn_list">
                    <form
                        method="POST"
                        action="?/getPaginatedUsers"
                        use:enhance={() => {
                            consoleContDisable(true);

                            return async ({ result }) => {
                                paginationBackClick = false;
                                paginationNextClick = false;
                                await applyAction(result);

                                if (result.type === 'success') {
                                    paginatedUsersData.set(searchResult.users);
                                    paginationMetaData.set(searchResult.meta);
                                    initUserDisplayState(searchResult.users);
                                } else {
                                    msgClosed.set(false);
                                }

                                consoleContDisable(false);
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterUserValue} />
                        <input name="filter_param" type="hidden" value={$filterUserParam} />
                        <input name="status" type="hidden" bind:value={status} />
                        <input type="hidden" name="cursor" bind:value={cursor} />

                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationBackClick = true;
                                status = 'back';
                                cursor = $paginationMetaData.prevCursor;
                            }}
                            class:active={paginationBackClick}
                            class:disabled_elm={!$paginationMetaData.hasPrevPage || paginationBackClick}>Back</button
                        >
                        <button
                            class="pagination_btn_item"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                paginationNextClick = true;
                                status = 'next';
                                cursor = $paginationMetaData.nextCursor;
                            }}
                            class:active={paginationNextClick}
                            class:disabled_elm={!$paginationMetaData.hasNextPage || paginationNextClick}>Next</button
                        >
                    </form>
                </div>
            {/if}
        {/if}
    </div>
{:else if stage === 1}
    <ClaimedDistribution bind:stage bind:scrollYBeforeClickClaimedDist {isMobile} />
{/if}
