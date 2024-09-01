<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import {
        prepareModal,
        onSubmit,
        getCourseByDecimal,
        decToLittleEndian,
        getWpnTypeByDec,
        getWpnNameByDec,
        showTipHoverWpn,
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
        userCtrlPanel,
        setSelectedCharacter,
        updateUserCtrlPanel,
        initUserCtrlPanel,
        convHrpToHr,
        consoleContDisable,
        validateInput,
        downloadUserBinary,
    } from '$lib/utils';
    import type { PaginatedUsers, PaginationMeta } from '$lib/types';
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { fade, slide } from 'svelte/transition';
    import { register } from 'swiper/element/bundle';

    export let paginatedUsers: PaginatedUsers[];
    export let paginationMeta: PaginationMeta;
    let paginationBackClick = false;
    let paginationNextClick = false;
    let specifiedUser = true;
    let bindedValue: string = '';
    let bindedParam: string;
    let status = 'init';
    let cursor = 0;
    let btnStage = 1;
    let rightsData: Record<string, any> = {};
    let ids: number[];

    /* User Control Panel
    ====================================================*/
    const userCtrlIconList: string[] = ['description', 'group'];
    register();

    /* Related to Edit Mode
    ====================================================*/
    const adminCtrlTypes: { [key: string]: boolean } = {
        filter: false,
        courseCtrl: false,
    };

    // switch admin control contents
    const adminCtrlSwitch = (type: string): void | false => {
        // check if another cat type is already open
        const activeCat = Object.values(adminCtrlTypes).some((boolean) => boolean === true);

        // if an open cat is clicked (try to close it), close it
        if (adminCtrlTypes[type]) {
            adminCtrlTypes[type] = false;

            return false;
        }

        // if there is an open cat and a different category is cliked (try to open it)
        if (activeCat) {
            // set everything to false (close) in a loop.
            Object.keys(adminCtrlTypes).forEach((key) => {
                adminCtrlTypes[key] = false;
            });

            // set the category clicked to true (open)
            adminCtrlTypes[type] = true;

            return false;
        }

        // toggle true <-> false
        adminCtrlTypes[type] = !adminCtrlTypes[type];
    };

    /* Binary Functions
    ====================================================*/
    let input: HTMLInputElement;
    const validFileName = [
        'savedata.bin',
        'decomyset.bin',
        'hunternavi.bin',
        'otomoairou.bin',
        'partner.bin',
        'platebox.bin',
        'platedata.bin',
        'platemyset.bin',
        'rengokudata.bin',
        'savemercenary.bin',
        'skinhist.bin',
        'minidata.bin',
        'scenariodata.bin',
        'savefavoritequest.bin',
    ] as const;
    let binaryData: { [key in (typeof validFileName)[number]]: Uint8Array | null } = {
        'savedata.bin': null,
        'decomyset.bin': null,
        'hunternavi.bin': null,
        'otomoairou.bin': null,
        'partner.bin': null,
        'platebox.bin': null,
        'platedata.bin': null,
        'platemyset.bin': null,
        'rengokudata.bin': null,
        'savemercenary.bin': null,
        'skinhist.bin': null,
        'minidata.bin': null,
        'scenariodata.bin': null,
        'savefavoritequest.bin': null,
    };
    let validName = true;

    const convFileToUint8 = (e: Event): void => {
        const target = e.target as HTMLInputElement;
        const files = target.files as FileList;
        let isValidFiles = true;

        Array.from(files).forEach((file) => {
            if (!validFileName.includes(file.name as any)) {
                alert(`Invalid file name (${file.name}).`);
                isValidFiles = false; // set flag to false if any file is invalid
            }
        });

        // if any file is invalid, clear input and return
        if (!isValidFiles) {
            input.value = '';
            return;
        }

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (e) => {
                const buffer = e.target!.result as ArrayBuffer;
                binaryData[file.name as (typeof validFileName)[number]] = new Uint8Array(buffer);
            };
        });
    };

    const onChangeInputElm = (e: Event, type?: 'select' | 'hl1' | 'hl2' | 'ex1' | 'ex2') => {
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
</script>

<h2>
    <span class="material-icons">person</span>
    User List
</h2>

<div class="console_contents">
    <div id="admin_control" class="edit_area_box" style="margin-bottom: 2%;">
        <div class="edit_area enter">
            <p class="edit_area_title" style="margin: 0;">Admin Control Panel</p>
            <div class="group_btns" style="margin-bottom: 30px;">
                <button
                    class="blue_btn"
                    type="button"
                    on:click={() => {
                        adminCtrlSwitch('filter');
                    }}
                    class:active={adminCtrlTypes['filter']}
                >
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Filter</span>
                </button>

                <button
                    class="blue_btn"
                    type="button"
                    on:click={() => {
                        adminCtrlSwitch('courseCtrl');
                    }}
                    class:active={adminCtrlTypes['courseCtrl']}
                >
                    <span class="btn_icon material-symbols-outlined">confirmation_number</span>
                    <span class="btn_text">Course Control</span>
                </button>
            </div>

            {#if adminCtrlTypes['filter']}
                <div transition:slide class="edit_area_box_parts text admin_ctrl">
                    <form
                        id="getPaginatedUsers"
                        class="filter_form"
                        action="?/getPaginatedUsers"
                        method="POST"
                        use:enhance={() => {
                            // when clicking submit button
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
                                    paginatedUsersData.set(paginatedUsers);
                                    paginationMetaData.set(paginationMeta);
                                    initUserCtrlPanel(paginatedUsers);
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

                        <input id="filter_input" type="text" placeholder="Filter ..." bind:value={bindedValue} />
                        <span>By</span>
                        <select class="filter_select" bind:value={bindedParam}>
                            <option value="username">Username</option>
                            <option value="user_id">User ID</option>
                            <option value="character_name">Character Name</option>
                            <option value="character_id">Character ID</option>
                        </select>
                    </form>

                    <button
                        id="btn"
                        class="green_btn"
                        type="submit"
                        form="getPaginatedUsers"
                        on:click={() => {
                            $timeOut && closeMsgDisplay($timeOut);
                            filterUserValue.set(bindedValue);
                            filterUserParam.set(bindedParam);
                            status = 'init';
                        }}
                    >
                        {#if btnStage === 0}
                            <span in:fade class="loading"></span>
                        {:else if btnStage === 1}
                            <span in:fade={{ delay: 100 }} class="btn_icon material-icons">search</span>
                            <span in:fade={{ delay: 100 }} class="btn_text">Search</span>
                        {/if}
                    </button>
                </div>
            {/if}

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
                                <span class="material-icons-outlined select">radio_button_unchecked</span>
                                <input
                                    type="radio"
                                    name="target_u_radio"
                                    value="all"
                                    on:change={(e) => {
                                        specifiedUser = true;
                                        onChangeInputElm(e, 'select');
                                    }}
                                />All Users
                            </label>

                            <div style="width: calc(50% - 20px); margin: 0 10px 6%;">
                                <label style="cursor: pointer; white-space: nowrap;">
                                    <span class="material-icons-outlined select" style="font-size: 2.1rem; padding: 0 10px 2px 0;">radio_button_unchecked</span>
                                    <input
                                        type="radio"
                                        name="target_u_radio"
                                        value="specified"
                                        on:change={(e) => {
                                            specifiedUser = false;
                                            onChangeInputElm(e, 'select');
                                        }}
                                    />Specify User(s)
                                </label>
                                <input class:disabled_elm={specifiedUser} style="margin-left: 7%; width: 95%;" type="text" name="specified_u_text" placeholder="1364+1489+ ..." />
                            </div>

                            <p class="console_contents_note" style="margin: 0px 0px 3% 4%; text-indent: -1.2rem;">
                                * When specifying multiple users in the "Specify User(s)" text box, concatenate the IDs of those users with "+" and be careful not to exceed 10 users.
                            </p>
                        </dd>

                        <dt class="course_list_title">HL (Single Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if code === 'hlc' || code === 'rhlc' || code === 'frc'}
                                    <label class="course_item">
                                        <span class="material-icons-outlined hl1">radio_button_unchecked</span>
                                        <input type="radio" name="hl" value={code} on:change={(e) => onChangeInputElm(e, 'hl1')} />{courseName}
                                    </label>
                                {/if}
                            {/each}
                        </dd>

                        <dt class="course_list_title">EX (Single Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if code === 'exc' || code === 'rexc'}
                                    <label class="course_item">
                                        <span class="material-icons-outlined ex1">radio_button_unchecked</span>
                                        <input type="radio" name="ex" value={code} on:change={(e) => onChangeInputElm(e, 'ex1')} />{courseName}
                                    </label>
                                {/if}
                            {/each}
                        </dd>

                        <dt class="course_list_title">The Others (Multiple Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if code !== 'hlc' && code !== 'rhlc' && code !== 'frc' && code !== 'exc' && code !== 'rexc'}
                                    <label class="course_item" class:disabled_elm={courseName.includes('[Deprecated]')}>
                                        <span class="material-icons-outlined">check_box_outline_blank</span>
                                        <input type="checkbox" name={code} on:change={(e) => onChangeInputElm(e)} />{courseName}
                                    </label>
                                {/if}
                            {/each}
                        </dd>

                        <button
                            class="blue_btn"
                            type="submit"
                            style="margin-top: 0;"
                            on:click={() => {
                                onSubmit.set(true);
                                $timeOut && closeMsgDisplay($timeOut);
                                adminCtrlSwitch('courseCtrl');
                            }}
                        >
                            <span class="btn_icon material-icons">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </dl>
                </form>
            {/if}
        </div>
    </div>

    {#if !$paginatedUsersData}
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
                                paginatedUsersData.set(paginatedUsers);
                                paginationMetaData.set(paginationMeta);
                                initUserCtrlPanel(paginatedUsers);
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
                        on:click={() => {
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
                        on:click={() => {
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
                            // update each value of edited user data
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
                    {user.username}

                    <div class="user_ctrl_panel">
                        {#each userCtrlIconList as icon}
                            <button
                                class="material-symbols-outlined active"
                                class:active={$userCtrlPanel[user.id].icon === icon}
                                on:click={() => {
                                    ($userCtrlPanel[user.id].icon = icon),
                                        ($userCtrlPanel[user.id].selectedChar = user.characters[0]),
                                        ($userCtrlPanel[user.id].activeCategories = {
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
                                            binary: false,
                                        });
                                }}
                                type="button">{icon}</button
                            >
                        {/each}
                    </div>

                    <button
                        class="red_btn"
                        type="button"
                        on:click={() =>
                            prepareModal('suspendUser', {
                                title: '',
                                form_action: '',
                                user_id: user.id,
                                username: user.username,
                                char_name: user.characters.map((character) => character.name || 'Ready to Hunt'),
                            })}
                    >
                        <span class="btn_icon material-icons">delete</span>
                        <span class="btn_text">Action</span>
                    </button>
                </div>

                {#if $userCtrlPanel[user.id].icon === 'description'}
                    <input type="hidden" name="user_id" value={user.id} />

                    <dl class="console_contents_list">
                        {#if user.suspended_account}
                            <div class="banned_user_container">
                                <p class="banned_text">This user account has been {user.suspended_account.permanent ? 'permanently' : 'temporarily'} suspended.</p>
                                <button
                                    class="red_btn"
                                    type="button"
                                    style="margin-top: 5%;"
                                    on:click={() =>
                                        prepareModal('suspendUser', {
                                            title: 'Unsuspend the following user?',
                                            form_action: 'unsuspendUser',
                                            user_id: user.id,
                                            username: user.username,
                                            char_name: user.characters.map((character) => character.name || 'Ready to Hunt'),
                                            until_at: user.suspended_account?.until_at,
                                        })}
                                >
                                    {#if !user.suspended_account.permanent}
                                        <span class="btn_icon material-icons">restore_from_trash</span>
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

                            {#if $userCtrlPanel[user.id].activeCategories['username']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['username'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['username'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['username']}
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
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['username'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Hashed Password</dt>
                        <dd class="contents_desc">
                            {user.password}

                            {#if $userCtrlPanel[user.id].activeCategories['password']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['password'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['password'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['password']}
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
                                            <dt>Enter new<br />hashed password</dt>
                                            <dd>
                                                <input type="text" name="password" value={user.password} autocomplete="off" />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['password'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
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

                            {#if $userCtrlPanel[user.id].activeCategories['rights']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['rights'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['rights'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['rights']}
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
                                                            <span class="material-icons-outlined hl2">{enabled ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                                            <input type="radio" name="hl" value={code} checked={enabled} on:change={(e) => onChangeInputElm(e, 'hl2')} />{courseName}
                                                        </label>
                                                    {/if}
                                                {/each}
                                            </dd>

                                            <dt class="course_list_title">EX (Single Select)</dt>
                                            <dd class="course_list">
                                                {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                    {#if code === 'exc' || code === 'rexc'}
                                                        <label class="course_item">
                                                            <span class="material-icons-outlined ex2">{enabled ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                                            <input type="radio" name="ex" value={code} checked={enabled} on:change={(e) => onChangeInputElm(e, 'ex2')} />{courseName}
                                                        </label>
                                                    {/if}
                                                {/each}
                                            </dd>

                                            <dt class="course_list_title">The Others (Multiple Select)</dt>
                                            <dd class="course_list">
                                                {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                    {#if code !== 'hlc' && code !== 'rhlc' && code !== 'frc' && code !== 'exc' && code !== 'rexc'}
                                                        <label class="course_item" class:disabled_elm={courseName.includes('[Deprecated]')}>
                                                            <span class="material-icons-outlined">{enabled ? 'check_box' : 'check_box_outline_blank'}</span>
                                                            <input type="checkbox" name={code} checked={enabled} on:change={(e) => onChangeInputElm(e)} />{courseName}
                                                        </label>
                                                    {/if}
                                                {/each}
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['rights'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Character ID<br />(Last Played)</dt>
                        <dd class="contents_desc">{user.last_character}</dd>

                        <dt class="contents_term">Last Login Time</dt>
                        <dd class="contents_desc">
                            {!user.last_login
                                ? 'No Data'
                                : DateTime.fromJSDate(user.last_login)
                                      .setZone(DateTime.local().zoneName)
                                      .setLocale('en')
                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </dd>

                        <dt class="contents_term">Expiry Date for<br />Return Ward</dt>
                        <dd class="contents_desc">
                            {!user.return_expires
                                ? 'No Data'
                                : DateTime.fromJSDate(user.return_expires)
                                      .setZone(DateTime.local().zoneName)
                                      .setLocale('en')
                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}

                            {#if $userCtrlPanel[user.id].activeCategories['return_expires']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['return_expires'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['return_expires'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['return_expires']}
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
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['return_expires'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Premium Coin G</dt>
                        <dd class="contents_desc">
                            {#if !user.gacha_premium}
                                No coins.
                            {:else}
                                {user.gacha_premium} Coin(s)
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['gacha_premium']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['gacha_premium'] = false)}>
                                    <span style="margin: 1% 0%;" class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['gacha_premium'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['gacha_premium']}
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
                                                    placeholder="Enter the quantity"
                                                />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['gacha_premium'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Trial Coin G</dt>
                        <dd class="contents_desc">
                            {#if !user.gacha_trial}
                                No coins.
                            {:else}
                                {user.gacha_trial} Coin(s)
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['gacha_trial']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['gacha_trial'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['gacha_trial'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['gacha_trial']}
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
                                                    placeholder="Enter the quantity"
                                                />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['gacha_trial'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Frontier Points</dt>
                        <dd class="contents_desc">
                            {#if !user.frontier_points}
                                No points.
                            {:else}
                                {user.frontier_points} Point(s)
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['frontier_points']}
                                <button type="button" class="red_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['frontier_points'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button type="button" class="normal_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['frontier_points'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['frontier_points']}
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
                                                    placeholder="Enter the quantity"
                                                />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['frontier_points'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">PlayStation Network ID</dt>
                        <dd class="contents_desc">
                            {user.psn_id}

                            {#if $userCtrlPanel[user.id].activeCategories['psn_id']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['psn_id'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['psn_id'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['psn_id']}
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
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['psn_id'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Wii U Key</dt>
                        <dd class="contents_desc">
                            {user.wiiu_key}

                            {#if $userCtrlPanel[user.id].activeCategories['wiiu_key']}
                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['wiiu_key'] = false)}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['wiiu_key'] = true)}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if $userCtrlPanel[user.id].activeCategories['wiiu_key']}
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
                                            on:click={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                $userCtrlPanel[user.id].activeCategories['wiiu_key'] = false;
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>
                    </dl>
                {:else if $userCtrlPanel[user.id].icon === 'group'}
                    {#if user.characters.length === 0}
                        <p style="color: #ff8100; margin: 1% 0 3%;">This user doesn't have any characters.</p>
                    {:else}
                        <swiper-container
                            centered-slides={true}
                            effect={'coverflow'}
                            coverflow-effect-slide-shadows={false}
                            mousewheel={true}
                            direction={'horizontal'}
                            speed={500}
                            navigation={true}
                            space-between={50}
                            observer={true}
                            observe-parents={true}
                            on:swiperslidechange={setSelectedCharacter}
                        >
                            {#each user.characters as character}
                                <swiper-slide>
                                    <div
                                        class="character_item {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}"
                                        class:new={character.is_new_character}
                                        data-userId={user.id}
                                        data-charId={character.id}
                                    >
                                        <span class="name">{character.name || 'Ready to Hunt'}</span>

                                        {#if character.discord}
                                            <button
                                                class="green_btn linked_character"
                                                type="button"
                                                on:click={() =>
                                                    prepareModal('linkDiscord', {
                                                        title: 'Unlink the following characters?',
                                                        form_action: 'unlinkDiscord',
                                                        user_id: user.id,
                                                        username: user.username,
                                                        char_id: character.id,
                                                        char_name: character.name,
                                                        discord_id: character.discord?.discord_id,
                                                    })}
                                            >
                                                <span class="btn_icon material-icons">link</span>
                                                <span class="btn_text">Linked</span>
                                            </button>
                                        {:else}
                                            <button
                                                class="green_btn link_character"
                                                type="button"
                                                on:click={() =>
                                                    prepareModal('linkDiscord', {
                                                        title: 'Execute the linking process with the following user and character. Please confirm the target ID and Username, and enter the ID (18-digit) of Discord to be linked.',
                                                        form_action: 'linkDiscord',
                                                        user_id: user.id,
                                                        username: user.username,
                                                        char_id: character.id,
                                                        char_name: character.name,
                                                    })}
                                            >
                                                <span class="btn_icon material-icons">link</span>
                                                <span class="btn_text">Link</span>
                                            </button>
                                        {/if}

                                        {#if !character.is_new_character}
                                            <div class="wpn_icon {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}" />

                                            <p class="wpn_text">
                                                {getWpnTypeByDec(character.weapon_type, 'en')}
                                                <br />
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                <span class="wpn_name" on:click={() => showTipHoverWpn(character.id)}>
                                                    {#await getWpnNameByDec(character.weapon_id, character.weapon_type, 'en')}
                                                        Loading...
                                                    {:then wpnName}
                                                        {wpnName}
                                                    {/await}
                                                </span>
                                            </p>

                                            <span id={String(character.id)} class="little_endian {decToLittleEndian(character.weapon_id)}">
                                                [ Little Endian: {decToLittleEndian(character.weapon_id)} ]
                                                {#await getWpnNameByDec(character.weapon_id, character.weapon_type, 'en')}
                                                    <p>Loading...</p>
                                                {:then wpnName}
                                                    <p>{wpnName}</p>
                                                {/await}
                                            </span>

                                            {#if character.deleted}
                                                <button
                                                    class="red_btn deleted_character"
                                                    type="button"
                                                    on:click={() =>
                                                        prepareModal('deleteCharacter', {
                                                            title: 'Restore the following character?',
                                                            form_action: 'restoreCharacter',
                                                            char_id: character.id,
                                                            char_name: character.name,
                                                        })}
                                                >
                                                    <span class="btn_icon material-icons">delete</span>
                                                    <span class="btn_text">Deleted</span>
                                                </button>
                                            {:else}
                                                <button
                                                    class="red_btn delete_character"
                                                    type="button"
                                                    on:click={() =>
                                                        prepareModal('deleteCharacter', {
                                                            title: 'Delete the following character?',
                                                            form_action: 'deleteCharacter',
                                                            char_id: character.id,
                                                            char_name: character.name,
                                                        })}
                                                    class:disabled_elm={user.characters.length === 1}
                                                >
                                                    <span class="btn_icon material-icons">delete</span>
                                                    <span class="btn_text">Delete</span>
                                                </button>
                                            {/if}
                                        {:else}
                                            <div class="wpn_icon" />
                                            <p class="wpn_text">
                                                No Data
                                                <br />
                                                <span class="wpn_name">No Data</span>
                                            </p>
                                        {/if}

                                        <span class="rank">HR: {convHrpToHr(character.hrp)} / GR: {character.gr}</span>
                                        <span class="char_id">Character ID: {character.id}</span>
                                        <span class="last_login"
                                            >Last Login: {!character.last_login
                                                ? 'No Data'
                                                : DateTime.fromSeconds(character.last_login)
                                                      .setZone(DateTime.local().zoneName)
                                                      .setLocale('en')
                                                      .toLocaleString({ year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span
                                        >
                                    </div>
                                </swiper-slide>
                            {/each}
                        </swiper-container>

                        {#if $userCtrlPanel[user.id].selectedChar.is_new_character}
                            <p style="color: #ff8100; padding-top: 1%;">New character can't be edited.</p>
                        {:else}
                            <form
                                action="?/updateCharacterData"
                                method="POST"
                                enctype="multipart/form-data"
                                use:enhance={({ formData }) => {
                                    const data = conv2DArrayToObject([...formData.entries()]);
                                    const userId = Number(data.user_id);
                                    const charId = Number(data.character_id);
                                    const column = Object.keys(data)[2];
                                    const value = Object.values(data)[2];

                                    return async ({ result }) => {
                                        msgClosed.set(false);
                                        onSubmit.set(false);
                                        await applyAction(result);

                                        if (result.type === 'success') {
                                            updateUserCtrlPanel(userId, charId, column, value);

                                            switch (column) {
                                                case 'name': {
                                                    $paginatedUsersData = $paginatedUsersData.map((user) => {
                                                        // update name
                                                        user.characters = user.characters.map((character) => {
                                                            const bounty = !character.discord?.bounty ? 0 : character.discord?.bounty - 50000;

                                                            if (character.id === charId && character.discord)
                                                                return {
                                                                    ...character,
                                                                    name: value,
                                                                    discord: {
                                                                        ...character.discord,
                                                                        bounty,
                                                                    },
                                                                };

                                                            return character;
                                                        });

                                                        return user;
                                                    });

                                                    break;
                                                }

                                                case 'bounty': {
                                                    $paginatedUsersData = $paginatedUsersData.map((user) => {
                                                        // update quantity of coins
                                                        user.characters = user.characters.map((character) => {
                                                            if (character.id === charId && character.discord)
                                                                return {
                                                                    ...character,
                                                                    discord: {
                                                                        ...character.discord,
                                                                        bounty: value,
                                                                    },
                                                                };

                                                            return character;
                                                        });

                                                        return user;
                                                    });

                                                    break;
                                                }

                                                case 'clan': {
                                                    $paginatedUsersData = $paginatedUsersData.map((user) => {
                                                        // delete guild_characters data
                                                        user.characters = user.characters.map((character) => {
                                                            if (character.id === charId)
                                                                return {
                                                                    ...character,
                                                                    guild_characters: null,
                                                                };

                                                            return character;
                                                        });

                                                        return user;
                                                    });

                                                    break;
                                                }

                                                case 'binary': {
                                                    break;
                                                }

                                                default: {
                                                    throw new Error('Invalid Column');
                                                }
                                            }
                                        }
                                    };
                                }}
                            >
                                <input type="hidden" name="user_id" value={user.id} />
                                <input type="hidden" name="character_id" value={$userCtrlPanel[user.id].selectedChar.id} />

                                <dl class="console_contents_list">
                                    <dt class="contents_term">Name</dt>
                                    <dd class="contents_desc">
                                        {$userCtrlPanel[user.id].selectedChar.name || 'Ready to Hunt'}

                                        {#if $userCtrlPanel[user.id].activeCategories['name']}
                                            <button type="button" class="red_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['name'] = false)}>
                                                <span class="btn_icon material-icons">close</span>
                                                <span class="btn_text">Cancel</span>
                                            </button>
                                        {:else}
                                            <button
                                                type="button"
                                                class="normal_btn"
                                                on:click={() => {
                                                    $userCtrlPanel[user.id].activeCategories['name'] = true;
                                                    validName = true;
                                                }}
                                            >
                                                <span class="btn_icon material-icons">mode_edit</span>
                                                <span class="btn_text">Edit</span>
                                            </button>
                                        {/if}

                                        {#if $userCtrlPanel[user.id].activeCategories['name']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">Change Character Name</p>
                                                    <p class="console_contents_note">* 50K coins are automatically cut from the user's bounty coin owned.</p>
                                                    <p class="console_contents_note">
                                                        * Empty isn't allowed, and only name containing the following characters is allowed:<br />
                                                        <span style="color: rgb(125, 125, 125); border-bottom: 1px solid black;">
                                                            ー Japanese: Hiragana, Katakana, Kanji<br />
                                                            ー English: Uppercase, Lowercase, and Half-width digits<br />
                                                            ー Symbols: &#33; &quot; &#35; &#36; &#37; &#38; &#39; &#40; &#41; &#42; &#43; &#44; &#45; &#46; &#47; &#58; &#59; &#60; &#61; &#62; &#63; &#64;
                                                            &#91; &#92; &#93; &#94; &#95; &#96; &#123; &#124; &#125; &#126;<br />
                                                        </span>
                                                    </p>

                                                    <dl class="edit_area_box_parts text">
                                                        <dt>Enter new name</dt>
                                                        <dd>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={$userCtrlPanel[user.id].selectedChar.name || 'Ready to Hunt'}
                                                                on:input={(e) => (validName = validateInput(e))}
                                                                autocomplete="off"
                                                            />
                                                            <input type="hidden" name="not_linked" value={!$userCtrlPanel[user.id].selectedChar.discord} />
                                                            <input type="hidden" name="bounty_coin" value={$userCtrlPanel[user.id].selectedChar.discord?.bounty} />
                                                        </dd>
                                                    </dl>

                                                    <button
                                                        class="blue_btn"
                                                        class:disabled_elm={!validName}
                                                        type="submit"
                                                        on:click={() => {
                                                            $userCtrlPanel[user.id].activeCategories['name'] = false;
                                                            $timeOut && closeMsgDisplay($timeOut);
                                                            onSubmit.set(true);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-icons">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                </div>
                                            </div>
                                        {/if}
                                    </dd>

                                    <dt class="contents_term">Bounty Coin</dt>
                                    <dd class="contents_desc">
                                        {#if !$userCtrlPanel[user.id].selectedChar.discord}
                                            No account linked.
                                        {:else}
                                            {$userCtrlPanel[user.id].selectedChar.discord?.bounty === 0 ? 'No coins.' : `${$userCtrlPanel[user.id].selectedChar.discord?.bounty} Coin(s)`}

                                            {#if $userCtrlPanel[user.id].activeCategories['bounty']}
                                                <button class="red_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['bounty'] = false)}>
                                                    <span class="btn_icon material-icons">close</span>
                                                    <span class="btn_text">Cancel</span>
                                                </button>
                                            {:else}
                                                <button class="normal_btn" type="button" on:click={() => ($userCtrlPanel[user.id].activeCategories['bounty'] = true)}>
                                                    <span class="btn_icon material-icons">mode_edit</span>
                                                    <span class="btn_text">Edit</span>
                                                </button>
                                            {/if}

                                            {#if $userCtrlPanel[user.id].activeCategories['bounty']}
                                                <div transition:slide class="edit_area_box">
                                                    <div class="edit_area enter">
                                                        <p class="edit_area_title">Change the Quantity of Coins</p>
                                                        <dl class="edit_area_box_parts text">
                                                            <dt>Enter the quantity</dt>
                                                            <dd>
                                                                <input
                                                                    type="text"
                                                                    name="bounty"
                                                                    inputmode="numeric"
                                                                    pattern="\d*"
                                                                    value={!$userCtrlPanel[user.id].selectedChar.discord?.bounty ? null : $userCtrlPanel[user.id].selectedChar.discord?.bounty}
                                                                    placeholder="Enter the quantity"
                                                                />
                                                            </dd>
                                                        </dl>

                                                        <button
                                                            class="blue_btn"
                                                            type="submit"
                                                            on:click={() => {
                                                                onSubmit.set(true);
                                                                $timeOut && closeMsgDisplay($timeOut);
                                                                $userCtrlPanel[user.id].activeCategories['bounty'] = false;
                                                            }}
                                                        >
                                                            <span class="btn_icon material-icons">check</span>
                                                            <span class="btn_text">Save</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            {/if}
                                        {/if}
                                    </dd>

                                    <dt class="contents_term">Clan Name</dt>
                                    <dd class="contents_desc">
                                        {$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.name || 'None'}

                                        <!-- {#if $userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.name}
                                            {#if $userCtrlPanel[user.id].activeCategories['clan']}
                                                <button type="button" class="red_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['clan'] = false)}>
                                                    <span class="btn_icon material-icons">close</span>
                                                    <span class="btn_text">Cancel</span>
                                                </button>
                                            {:else}
                                                <button type="button" class="normal_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['clan'] = true)}>
                                                    <span class="btn_icon material-icons">mode_edit</span>
                                                    <span class="btn_text">Edit</span>
                                                </button>
                                            {/if}
                                        {/if} -->

                                        {#if $userCtrlPanel[user.id].activeCategories['clan']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">Leave the Clan</p>
                                                    <p class="console_contents_note">* If this character is the last one in the clan, the clan itself will also be automatically deleted.</p>

                                                    <input type="hidden" name="clan" />
                                                    <input type="hidden" name="clan_length" value={$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.guild_characters?.length} />
                                                    <input type="hidden" name="clan_id" value={$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.id} />
                                                    <input type="hidden" name="clan_name" value={$userCtrlPanel[user.id].selectedChar.guild_characters?.guilds?.name} />

                                                    <button
                                                        class="blue_btn"
                                                        type="submit"
                                                        on:click={() => {
                                                            $userCtrlPanel[user.id].activeCategories['clan'] = false;
                                                            $timeOut && closeMsgDisplay($timeOut);
                                                            onSubmit.set(true);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-icons">check</span>
                                                        <span class="btn_text">Leave</span>
                                                    </button>
                                                </div>
                                            </div>
                                        {/if}
                                    </dd>

                                    <dt class="contents_term">Binary Data</dt>
                                    <dd class="contents_desc">
                                        <!-- re-upload binary -->
                                        {#if $userCtrlPanel[user.id].activeCategories['binary']}
                                            <button type="button" class="red_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['binary'] = false)}>
                                                <span class="btn_icon material-icons">close</span>
                                                <span class="btn_text">Cancel</span>
                                            </button>
                                        {:else}
                                            <button type="button" class="normal_btn" on:click={() => ($userCtrlPanel[user.id].activeCategories['binary'] = true)}>
                                                <span class="btn_icon material-icons">upload_file</span>
                                                <span class="btn_text">Re-upload</span>
                                            </button>
                                        {/if}

                                        {#if $userCtrlPanel[user.id].activeCategories['binary']}
                                            <div transition:slide class="edit_area_box">
                                                <div class="edit_area enter">
                                                    <p class="edit_area_title">Re-upload Binary Data</p>
                                                    <p class="console_contents_note">* Once re-uploaded, the original binary data will be overwritten.</p>
                                                    <p class="console_contents_note">
                                                        * You can upload any file you want, as long as it's one of the 14 files listed below. The remaining files that aren't uploaded won't be changed.
                                                        Of course, uploading all 14 files at once is no problem.
                                                    </p>
                                                    <p class="console_contents_note">
                                                        * Each file must have the following name resspectively.<br /><span style="color: #7d7d7d; border-bottom: 1px solid black;">
                                                            ー {@html validFileName.join('<br>ー ')}
                                                        </span>
                                                    </p>
                                                    <dl class="edit_area_box_parts text">
                                                        <dt>Select new files</dt>
                                                        <dd>
                                                            <input type="hidden" name="binary" />
                                                            <input name="savedata" type="hidden" bind:value={binaryData['savedata.bin']} />
                                                            <input name="decomyset" type="hidden" bind:value={binaryData['decomyset.bin']} />
                                                            <input name="hunternavi" type="hidden" bind:value={binaryData['hunternavi.bin']} />
                                                            <input name="otomoairou" type="hidden" bind:value={binaryData['otomoairou.bin']} />
                                                            <input name="partner" type="hidden" bind:value={binaryData['partner.bin']} />
                                                            <input name="platebox" type="hidden" bind:value={binaryData['platebox.bin']} />
                                                            <input name="platedata" type="hidden" bind:value={binaryData['platedata.bin']} />
                                                            <input name="platemyset" type="hidden" bind:value={binaryData['platemyset.bin']} />
                                                            <input name="rengokudata" type="hidden" bind:value={binaryData['rengokudata.bin']} />
                                                            <input name="savemercenary" type="hidden" bind:value={binaryData['savemercenary.bin']} />
                                                            <input name="skin_hist" type="hidden" bind:value={binaryData['skinhist.bin']} />
                                                            <input name="minidata" type="hidden" bind:value={binaryData['minidata.bin']} />
                                                            <input name="scenariodata" type="hidden" bind:value={binaryData['scenariodata.bin']} />
                                                            <input name="savefavoritequest" type="hidden" bind:value={binaryData['savefavoritequest.bin']} />
                                                            <input type="file" name="file" on:change={convFileToUint8} accept=".bin" bind:this={input} multiple />
                                                        </dd>
                                                    </dl>

                                                    <button
                                                        class="blue_btn"
                                                        type="submit"
                                                        on:click={() => {
                                                            $userCtrlPanel[user.id].activeCategories['binary'] = false;
                                                            $timeOut && closeMsgDisplay($timeOut);
                                                            onSubmit.set(true);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-icons">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                </div>
                                            </div>
                                        {/if}

                                        <!-- download binary -->
                                    </dd>
                                </dl>
                            </form>
                        {/if}
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
                                paginatedUsersData.set(paginatedUsers);
                                paginationMetaData.set(paginationMeta);
                                initUserCtrlPanel(paginatedUsers);
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
                        on:click={() => {
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
                        on:click={() => {
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
