<script lang="ts">
    import type { users } from '@prisma/client/edge';
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
        filterValue,
        filterParam,
    } from '$lib/utils';
    import type { PaginatedUsers, PaginationMeta } from '$lib/types';
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { fade, slide } from 'svelte/transition';

    export let paginatedUsers: PaginatedUsers[];
    export let paginationMeta: PaginationMeta;
    let paginationBackClick = false;
    let paginationNextClick = false;
    let specifiedUser = true;
    let bindedValue: string;
    let bindedParam: string;
    let status = 'init';
    let cursor = 0;
    let btnStage = 1;
    let rightsData: Record<string, any> = {};
    let ids: number[];

    /* Related to Edit Mode
    ====================================================*/
    let editingId: number;
    let editMode = false;
    let catTypes: { [key in keyof Omit<users, 'id' | 'item_box' | 'last_character' | 'last_login' | 'web_login_key'>]: boolean } = {
        username: false,
        password: false,
        rights: false,
        return_expires: false,
        gacha_premium: false,
        gacha_trial: false,
        frontier_points: false,
    };
    const adminCtrlTypes: { [key: string]: boolean } = {
        filter: false,
        courseCtrl: false,
    };

    // switch edit contents
    const editModeSwitch = <T extends number, U extends keyof Omit<users, 'id' | 'item_box' | 'last_character' | 'last_login' | 'web_login_key'>>(id: T, type: U): void | false => {
        // check if another cat type is already open
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // if there is an open cat and a different category is cliked (try to open it) + not cancel btn
        if (activeCat && id !== 0) {
            // set everything to false (close) in a loop.
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<users, 'id' | 'item_box' | 'last_character' | 'last_login' | 'web_login_key'>;
                catTypes[key] = false;
            });

            // set the category clicked to true (open), adn set editting u_id
            catTypes[type] = true;
            editingId = id;

            return false;
        }

        // toggle true <-> false
        if (!editMode) {
            // open a cat
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // close a cat
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
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
</script>

<h2>
    <span class="material-icons">person</span>
    User List
</h2>

<div class="console_contents">
    <div class="edit_area_box" style="margin-bottom: 2%;">
        <div class="edit_area enter">
            <p class="edit_area_title" style="margin: 0;">Admin Control Panel</p>
            <div class="group_btns" style="margin-bottom: 3%;">
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
                <div transition:slide class="edit_area_box_parts text">
                    <form
                        class="filter_form"
                        action="?/getPaginatedUsers"
                        method="POST"
                        use:enhance={() => {
                            // when clicking submit button
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
                                } else {
                                    msgClosed.set(false);
                                }
                            };
                        }}
                    >
                        <input name="filter_value" type="hidden" value={$filterValue} />
                        <input name="filter_param" type="hidden" value={$filterParam} />
                        <input name="status" type="hidden" bind:value={status} />

                        <input id="filter_input" type="text" placeholder="Filter ..." bind:value={bindedValue} />
                        By
                        <select class="filter_select" bind:value={bindedParam}>
                            <option value="username">Username</option>
                            <option value="character_name">Character Name</option>
                        </select>

                        <button
                            id="btn"
                            class="green_btn"
                            type="submit"
                            on:click={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                filterValue.set(bindedValue);
                                filterParam.set(bindedParam);
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
                    </form>
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
                        };
                    }}
                >
                    <dl class="edit_area_box_parts radio">
                        <dt class="course_list_title">Target User Type (Single Select)</dt>
                        <dd class="course_list">
                            <label class="course_item"><input type="radio" name="target_u_radio" value="all" on:change={() => (specifiedUser = true)} />All Users</label>

                            <div style="width: calc(50% - 20px); margin: 0 10px 6%;">
                                <label style="cursor: pointer;"><input type="radio" name="target_u_radio" value="specified" on:change={() => (specifiedUser = false)} />Specify User(s)</label>
                                <input style="margin-left: 7%; width: 95%;" type="text" name="specified_u_text" placeholder="1364+1489+ ..." disabled={specifiedUser} />
                            </div>
                            <p class="console_contents_note" style="margin: 0px 0px 3% 4%; text-indent: -1.2rem;">
                                * When specifying multiple users in the "Specify User(s)" text box, be sure to concatenate the IDs of those users with "+."
                            </p>
                        </dd>

                        <dt class="course_list_title">HL (Single Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if courseName === 'Hunter Life Course' || courseName === 'Hunter Life Continued Course' || courseName === 'Free Course'}
                                    <label class="course_item"><input type="radio" name="hl" value={code} />{courseName}</label>
                                {/if}
                            {/each}
                        </dd>

                        <dt class="course_list_title">EX (Single Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if courseName === 'Extra Course' || courseName === 'Extra Continued Course'}
                                    <label class="course_item"><input type="radio" name="ex" value={code} />{courseName}</label>
                                {/if}
                            {/each}
                        </dd>

                        <dt class="course_list_title">The Others (Multiple Select)</dt>
                        <dd class="course_list">
                            {#each _.sortBy(Object.entries(getCourseByDecimal(0, 'en')), 'id') as [courseName, { code }]}
                                {#if courseName !== 'Hunter Life Course' && courseName !== 'Hunter Life Continued Course' && courseName !== 'Free Course' && courseName !== 'Extra Course' && courseName !== 'Extra Continued Course'}
                                    <label class="course_item"><input type="checkbox" name={code} />{courseName}</label>
                                {/if}
                            {/each}
                        </dd>

                        <button
                            class="blue_btn"
                            type="submit"
                            style="margin-top: 0;"
                            on:click={() => {
                                onSubmit.set(true);
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
        <div class="pagination_btn_list">
            <form
                method="POST"
                action="?/getPaginatedUsers"
                use:enhance={() => {
                    return async ({ result }) => {
                        paginationBackClick = false;
                        paginationNextClick = false;
                        await applyAction(result);

                        if (result.type === 'success') {
                            paginatedUsersData.set(paginatedUsers);
                            paginationMetaData.set(paginationMeta);
                        }
                    };
                }}
            >
                <input name="filter_value" type="hidden" value={$filterValue} />
                <input name="filter_param" type="hidden" value={$filterParam} />
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
                                if (user.id === id) {
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
                                                    : value,
                                    };
                                }

                                return user;
                            });
                        }
                    };
                }}
            >
                <dl class="console_contents_list">
                    <p class="console_contents_list_title">
                        {user.username}

                        <button
                            class="red_btn"
                            type="button"
                            on:click={() =>
                                prepareModal('suspendUser', {
                                    title: 'Suspend the following user?',
                                    form_action: 'suspendUser',
                                    user_id: user.id,
                                    username: user.username,
                                    char_name: user.characters.map((character) => character.name || 'Ready to Hunt'),
                                })}
                        >
                            <span class="btn_icon material-icons">delete</span>
                            <span class="btn_text">Suspend</span>
                        </button>
                    </p>

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
                                    <span style="font-size: 2.8rem;" class="btn_icon material-icons">restore_from_trash</span>
                                    <span style="font-size: 2rem; padding-top: 2px;" class="btn_text">Unsuspend</span>
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
                            <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'username')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" on:click={() => editModeSwitch(user.id, 'username')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editingId === user.id && catTypes['username']}
                            <div transition:slide class="edit_area_box">
                                <input type="hidden" name="user_id" value={editingId} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change Username</p>
                                    <p class="console_contents_note">* Editing without the user's permission is strictly prohibited.</p>
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
                                            editModeSwitch(0, 'username');
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

                        {#if editingId === user.id && catTypes['password']}
                            <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'password')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" on:click={() => editModeSwitch(user.id, 'password')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editingId === user.id && catTypes['password']}
                            <div transition:slide class="edit_area_box">
                                <input type="hidden" name="user_id" value={editingId} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change Password</p>
                                    <p class="console_contents_note">* Editing without the user's permission is strictly prohibited.</p>
                                    <p class="console_contents_note">* Empty isn't allowed.</p>
                                    <dl class="edit_area_box_parts text">
                                        <dt>Enter new<br />hashed password</dt>
                                        <dd>
                                            <input type="text" name="password" value={user.password} autocomplete="off" />
                                        </dd>
                                        <p style="margin: 2% 0 0 2%; padding: 1%; user-select: text; border: 2px solid rgb(255 164 164);">
                                            <span style="font-weight: 700;">Editing Procedure:</span><br />
                                            [1] Tell the user the following.<br />
                                            "Go to the following site, enter the new password in the String field and press Encrypt. Then send the generated password to me. (https://bcrypt-generator.com/)"<br
                                            />
                                            [2] Receive the generated hashed password from the user via DM.<br />
                                            [3] Enter the hashed password in the text box above and press Save.
                                        </p>
                                    </dl>

                                    <button
                                        class="blue_btn"
                                        type="submit"
                                        on:click={() => {
                                            onSubmit.set(true);
                                            editModeSwitch(0, 'password');
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
                            {#each Object.entries(getCourseByDecimal(user.rights, 'en')) as [course, { enabled }]}
                                {#if enabled}
                                    <li>{course}</li>
                                {/if}
                            {/each}
                        </ul>

                        {#if editingId === user.id && catTypes['rights']}
                            <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'rights')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" on:click={() => editModeSwitch(user.id, 'rights')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editingId === user.id && catTypes['rights']}
                            <div transition:slide class="edit_area_box">
                                <input type="hidden" name="user_id" value={editingId} />
                                <input type="hidden" name="rights" />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change Courses</p>
                                    <dl class="edit_area_box_parts radio">
                                        <dt class="course_list_title">HL (Single Select)</dt>
                                        <dd class="course_list">
                                            {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                {#if courseName === 'Hunter Life Course' || courseName === 'Hunter Life Continued Course' || courseName === 'Free Course'}
                                                    <label class="course_item"><input type="radio" name="hl" value={code} checked={enabled} />{courseName}</label>
                                                {/if}
                                            {/each}
                                        </dd>

                                        <dt class="course_list_title">EX (Single Select)</dt>
                                        <dd class="course_list">
                                            {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                {#if courseName === 'Extra Course' || courseName === 'Extra Continued Course'}
                                                    <label class="course_item"><input type="radio" name="ex" value={code} checked={enabled} />{courseName}</label>
                                                {/if}
                                            {/each}
                                        </dd>

                                        <dt class="course_list_title">The Others (Multiple Select)</dt>
                                        <dd class="course_list">
                                            {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights, 'en')), 'id') as [courseName, { enabled, code }]}
                                                {#if courseName !== 'Hunter Life Course' && courseName !== 'Hunter Life Continued Course' && courseName !== 'Free Course' && courseName !== 'Extra Course' && courseName !== 'Extra Continued Course'}
                                                    <label class="course_item"><input type="checkbox" name={code} checked={enabled} />{courseName}</label>
                                                {/if}
                                            {/each}
                                        </dd>
                                    </dl>

                                    <button
                                        class="blue_btn"
                                        type="submit"
                                        on:click={() => {
                                            onSubmit.set(true);
                                            editModeSwitch(0, 'rights');
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

                        {#if editingId === user.id && catTypes['return_expires']}
                            <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'return_expires')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" on:click={() => editModeSwitch(user.id, 'return_expires')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editingId === user.id && catTypes['return_expires']}
                            <div transition:slide class="edit_area_box">
                                <input type="hidden" name="user_id" value={editingId} />

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
                                            <input type="hidden" name="zoneName" value={DateTime.local().zoneName} />
                                        </dd>
                                    </dl>

                                    <button
                                        class="blue_btn"
                                        type="submit"
                                        on:click={() => {
                                            onSubmit.set(true);
                                            editModeSwitch(0, 'return_expires');
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

                        {#if editingId === user.id && catTypes['gacha_premium']}
                            <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'gacha_premium')}>
                                <span style="margin: 1% 0%;" class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" on:click={() => editModeSwitch(user.id, 'gacha_premium')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editingId === user.id && catTypes['gacha_premium']}
                            <div transition:slide class="edit_area_box">
                                <input type="hidden" name="user_id" value={editingId} />
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
                                            editModeSwitch(0, 'gacha_premium');
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

                        {#if editingId === user.id && catTypes['gacha_trial']}
                            <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'gacha_trial')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" on:click={() => editModeSwitch(user.id, 'gacha_trial')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editingId === user.id && catTypes['gacha_trial']}
                            <div transition:slide class="edit_area_box">
                                <input type="hidden" name="user_id" value={editingId} />
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
                                            editModeSwitch(0, 'gacha_trial');
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

                        {#if editingId === user.id && catTypes['frontier_points']}
                            <button type="button" class="red_btn" on:click={() => editModeSwitch(0, 'frontier_points')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button type="button" class="normal_btn" on:click={() => editModeSwitch(user.id, 'frontier_points')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editingId === user.id && catTypes['frontier_points']}
                            <div transition:slide class="edit_area_box">
                                <input type="hidden" name="user_id" value={editingId} />
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
                                            editModeSwitch(0, 'frontier_points');
                                        }}
                                    >
                                        <span class="btn_icon material-icons">check</span>
                                        <span class="btn_text">Save</span>
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </dd>

                    <dt class="contents_term">Character List</dt>
                    <dd class="contents_desc">
                        {#if user.characters.length === 0}
                            <p style="color: #ff8100;">This user doesn't have any characters.</p>
                        {:else}
                            {#each user.characters as character}
                                <div class="character_item {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}" class:new={character.is_new_character}>
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
                                            <span class="wpn_name" on:mouseenter={() => showTipHoverWpn(character.id)} on:mouseleave={() => showTipHoverWpn(character.id)}>
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
                                            No Data
                                        </p>
                                    {/if}

                                    <span class="rank">HR: {character.hrp} / GR: {character.gr}</span>
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
                            {/each}
                        {/if}
                    </dd>
                </dl>
            </form>
        {/each}

        <div class="pagination_btn_list">
            <form
                method="POST"
                action="?/getPaginatedUsers"
                use:enhance={() => {
                    return async ({ result }) => {
                        paginationBackClick = false;
                        paginationNextClick = false;
                        await applyAction(result);

                        if (result.type === 'success') {
                            paginatedUsersData.set(paginatedUsers);
                            paginationMetaData.set(paginationMeta);
                        }
                    };
                }}
            >
                <input name="filter_value" type="hidden" value={$filterValue} />
                <input name="filter_param" type="hidden" value={$filterParam} />
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
</div>
