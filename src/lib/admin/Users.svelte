<script lang="ts">
    import _ from 'lodash';
    import { fade, slide } from 'svelte/transition';
    import { applyAction, enhance } from '$app/forms';
    import { editMode, prepareModal, clicked_submit, getCourseByDecimal, decToLittleEndian, getWpnTypeByDec, getWpnNameByDec, showTipHoverWpn, switchBtnInAuth } from '$ts/main';
    import { DateTime } from 'luxon';
    import type { ActionData } from '../../routes/admin/$types';

    export let form: ActionData;
    let paginationBackClick = false;
    let paginationNextClick = false;
    let specifiedUser = true;
    let filterValue: string;
    let filterParam: string;
    let btnStage = 1;

    /* Related to Edit Mode
    ====================================================*/
    let editId: number;
    const catTypes: { [key: string]: boolean } = {
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
    const editModeSwitch = (id: number, type: keyof { [key: string]: boolean }) => {
        // check if another cat type is already open
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // if there is an open cat and a different category is cliked (try to open it) + not cancel btn
        if (activeCat && id !== 0) {
            // set everything to false (close) in a loop.
            Object.keys(catTypes).forEach((key) => {
                catTypes[key] = false;
            });

            // set the category clicked to true (open), adn set editting u_id
            catTypes[type] = true;
            editId = id;

            return false;
        }

        // toggle true <-> false
        if (!$editMode) {
            // open a cat
            editMode.set(true);
            editId = id;
            catTypes[type] = true;
        } else {
            // close a cat
            editMode.set(false);
            editId = id;
            catTypes[type] = false;
        }
    };

    // switch admin control contents
    const adminCtrlSwitch = (type: keyof { [key: string]: boolean }) => {
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
    <form class="edit_area_form" method="POST" style="margin-bottom: 2%;">
        <div class="edit_area enter">
            <p class="edit_area_title" style="margin: 0;">Admin Control Panel</p>
            <div class="group_btns" style="margin-bottom: 3%;">
                <button
                    on:click={() => {
                        adminCtrlSwitch('filter');
                    }}
                    class="blue_btn"
                    class:active={adminCtrlTypes['filter']}
                    type="button"
                >
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Filter</span>
                </button>

                <button
                    on:click={() => {
                        adminCtrlSwitch('courseCtrl');
                    }}
                    class="blue_btn"
                    class:active={adminCtrlTypes['courseCtrl']}
                    type="button"
                >
                    <span class="btn_icon material-symbols-outlined">confirmation_number</span>
                    <span class="btn_text">Course Control</span>
                </button>
            </div>

            {#if adminCtrlTypes['filter']}
                <div transition:slide class="edit_area_form_parts text">
                    <form
                        class="filter_form"
                        action="?/getFirstQueryResults"
                        method="POST"
                        use:enhance={() => {
                            // when clicking submit button
                            const btnElm = document.getElementById('btn');
                            const inputElm = document.querySelectorAll('#filter_input');
                            switchBtnInAuth(false, btnElm, null, inputElm);
                            btnStage = 0;

                            return async ({ result }) => {
                                console.log(result);
                                await applyAction(result);
                                switchBtnInAuth(true, btnElm, null, inputElm);
                                btnStage = 1;
                            };
                        }}
                    >
                        <input name="filter_value" id="filter_input" type="text" placeholder="Filter ..." bind:value={filterValue} />
                        By
                        <select name="filter_param" class="filter_select" bind:value={filterParam}>
                            <option value="username">Username</option>
                            <option value="web_login_key">Web Login Key</option>
                        </select>

                        <button id="btn" class="green_btn" type="submit">
                            {#if btnStage === 0}
                                <span in:fade class="loading"></span>
                            {:else if btnStage === 1}
                                <span in:fade={{ delay: 100 }} class="btn_icon material-icons">search</span>
                                <span in:fade={{ delay: 100 }} class="btn_text">Search</span>
                            {/if}
                        </button>
                    </form>
                    <p class="console_contents_note" style="margin-top: 3%;">* Once this tab is closed, the filter input is cleared and the select box returns to default.</p>
                </div>
            {/if}

            {#if adminCtrlTypes['courseCtrl']}
                <dl transition:slide class="edit_area_form_parts radio">
                    <dt class="course_list_title">Target Users (Single Select)</dt>
                    <dd class="course_list">
                        <label class="course_item"><input type="radio" name="target_u_radio" value="all" on:change={() => (specifiedUser = true)} />All Users</label>

                        <div style="width: calc(50% - 20px); margin: 0 10px 6%;">
                            <label style="cursor: pointer;"><input type="radio" name="target_u_radio" value="specified" on:change={() => (specifiedUser = false)} />Specify User(s)</label>
                            <input style="margin-left: 7%; width: 95%;" type="text" name="specified_u_text" placeholder="Ex) 1364+1489+ ..." disabled={specifiedUser} />
                        </div>
                        <p class="console_contents_note" style="margin: 0px 0px 3% 4%; text-indent: -1.2rem;">
                            * When specifying multiple users in the "Specify Users" text box, be sure to join User IDs with "+".
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

                    <button formaction="?/updateUserData" style="margin-top: 0;" on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Save</span>
                    </button>
                </dl>
            {/if}
        </div>
    </form>

    {#if form?.users.length === 0}
        <p class="console_contents_note">No User Found.</p>
    {:else if form?.users}
        <div class="pagination_btn_list">
            <form
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        paginationBackClick = false;
                        paginationNextClick = false;

                        await applyAction(result);
                    };
                }}
            >
                <input type="hidden" name="filter_value" value={filterValue} />
                <input type="hidden" name="filter_param" value={filterParam} />
                <input type="hidden" name="start_cursor" value={form?.meta.startCursor} />
                <input type="hidden" name="end_cursor" value={form?.meta.endCursor} />

                <button
                    class="pagination_btn_item"
                    on:click|once={() => {
                        paginationBackClick = true;
                    }}
                    class:active={paginationBackClick}
                    class:disabled_elm={!form?.meta.hasPreviousPage || paginationBackClick}
                    formaction="?/userPaginateBack">Back</button
                >
                <button
                    class="pagination_btn_item"
                    on:click|once={() => {
                        paginationNextClick = true;
                    }}
                    class:active={paginationNextClick}
                    class:disabled_elm={!form?.meta.hasNextPage || paginationNextClick}
                    formaction="?/userPaginateNext">Next</button
                >
            </form>
        </div>

        {#each form?.users as user}
            <dl class="console_contents_list">
                <p class="console_contents_list_title">
                    {user.username}

                    <button
                        class="red_btn"
                        on:click={() =>
                            prepareModal('suspendUser', {
                                title: 'Suspend the following user?',
                                form_action: 'suspendUser',
                                user_id: user.id,
                                username: user.username,
                                char_name: user.char_name_array,
                            })}
                    >
                        <span class="btn_icon material-icons">delete</span>
                        <span class="btn_text">Suspend</span>
                    </button>
                </p>

                {#if !user.not_suspended}
                    <div class="banned_user_container">
                        <p class="banned_text">This user account has been suspended.</p>
                        <button
                            class="red_btn"
                            on:click={() =>
                                prepareModal('suspendUser', {
                                    title: 'Unsuspend the following user?',
                                    form_action: 'unsuspendUser',
                                    user_id: user.id,
                                    username: user.username,
                                    char_name: user.char_name_array,
                                })}
                        >
                            <span style="font-size: 2.8rem;" class="btn_icon material-icons">restore_from_trash</span>
                            <span style="font-size: 2rem; padding-top: 2px;" class="btn_text">Unsuspend</span>
                        </button>
                    </div>
                {/if}

                <dt class="contents_term">User ID</dt>
                <dd class="contents_desc">{user.id}</dd>

                <dt class="contents_term">Username</dt>
                <dd class="contents_desc">
                    {user.username}

                    {#if editId === user.id && catTypes['username']}
                        <button class="red_btn" on:click={() => editModeSwitch(0, 'username')}>
                            <span class="btn_icon material-icons">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" on:click={() => editModeSwitch(user.id, 'username')}>
                            <span class="btn_icon material-icons">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['username']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Username</p>
                                <dl class="edit_area_form_parts text">
                                    <p class="console_contents_note">Editing without the user's permission is strictly prohibited.</p>
                                    <dt>Enter new username</dt>
                                    <dd>
                                        <input type="text" name="username" value={user.username} autocomplete="off" />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Hashed Password</dt>
                <dd class="contents_desc">
                    {user.password}

                    {#if editId === user.id && catTypes['password']}
                        <button class="red_btn" on:click={() => editModeSwitch(0, 'password')}>
                            <span class="btn_icon material-icons">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" on:click={() => editModeSwitch(user.id, 'password')}>
                            <span class="btn_icon material-icons">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['password']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Password</p>
                                <dl class="edit_area_form_parts text">
                                    <p class="console_contents_note">Editing without the user's permission is strictly prohibited.</p>
                                    <dt>Enter new<br />hashed password</dt>
                                    <dd>
                                        <input type="text" name="password" value={user.password} autocomplete="off" />
                                    </dd>
                                    <p style="margin: 2% 0 0 2%; padding: 1%; user-select: text; border: 2px solid #c7a1a1;">
                                        <span style="font-weight: 700;">Editing Procedure:</span><br />
                                        [1] Tell the user the following.<br />
                                        "Go to the following site, enter the new password in the String field and press Encrypt. Then send the generated password to me. (https://bcrypt-generator.com/)"<br
                                        />
                                        [2] Receive the generated hashed password from the user via DM.<br />
                                        [3] Enter the hashed password in the text box above and press Save.
                                    </p>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
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

                    {#if editId === user.id && catTypes['rights']}
                        <button class="red_btn" on:click={() => editModeSwitch(0, 'rights')}>
                            <span class="btn_icon material-icons">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" on:click={() => editModeSwitch(user.id, 'rights')}>
                            <span class="btn_icon material-icons">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['rights']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Courses</p>
                                <dl class="edit_area_form_parts radio">
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

                                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
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

                    {#if editId === user.id && catTypes['return_expires']}
                        <button class="red_btn" on:click={() => editModeSwitch(0, 'return_expires')}>
                            <span class="btn_icon material-icons">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" on:click={() => editModeSwitch(user.id, 'return_expires')}>
                            <span class="btn_icon material-icons">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['return_expires']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Date</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Set new date</dt>
                                    <dd>
                                        <p class="console_contents_note">The date and time to be set are automatically converted to UTC.</p>
                                        <input
                                            type="datetime-local"
                                            name="return_expires"
                                            value={!user.return_expires ? '' : DateTime.fromJSDate(user.return_expires).toFormat("yyyy-MM-dd'T'HH:mm")}
                                        />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Premium Coin G</dt>
                <dd class="contents_desc">
                    {#if user.gacha_premium === null || user.gacha_premium === 0}
                        No coins.
                    {:else}
                        {user.gacha_premium}
                    {/if}

                    {#if editId === user.id && catTypes['gacha_premium']}
                        <button class="red_btn" on:click={() => editModeSwitch(0, 'gacha_premium')}>
                            <span style="margin: 1% 0%;" class="btn_icon material-icons">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" on:click={() => editModeSwitch(user.id, 'gacha_premium')}>
                            <span class="btn_icon material-icons">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['gacha_premium']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Quantity of Coins</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Enter the quantity</dt>
                                    <dd>
                                        <input
                                            type="text"
                                            name="gacha_premium"
                                            inputmode="numeric"
                                            pattern="\d*"
                                            value={user.gacha_premium === 0 ? null : user.gacha_premium}
                                            placeholder="Enter the quantity"
                                        />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Trial Coin G</dt>
                <dd class="contents_desc">
                    {#if user.gacha_trial === null || user.gacha_trial === 0}
                        No coins.
                    {:else}
                        {user.gacha_trial}
                    {/if}

                    {#if editId === user.id && catTypes['gacha_trial']}
                        <button class="red_btn" on:click={() => editModeSwitch(0, 'gacha_trial')}>
                            <span class="btn_icon material-icons">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" on:click={() => editModeSwitch(user.id, 'gacha_trial')}>
                            <span class="btn_icon material-icons">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['gacha_trial']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Quantity of Coins</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Enter the quantity</dt>
                                    <dd>
                                        <input
                                            type="text"
                                            name="gacha_trial"
                                            inputmode="numeric"
                                            pattern="\d*"
                                            value={user.gacha_trial === 0 ? null : user.gacha_trial}
                                            placeholder="Enter the quantity"
                                        />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Frontier Points</dt>
                <dd class="contents_desc">
                    {#if user.frontier_points === null || user.frontier_points === 0}
                        No points.
                    {:else}
                        {user.frontier_points}
                    {/if}

                    {#if editId === user.id && catTypes['frontier_points']}
                        <button class="red_btn" on:click={() => editModeSwitch(0, 'frontier_points')}>
                            <span class="btn_icon material-icons">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                    {:else}
                        <button class="normal_btn" on:click={() => editModeSwitch(user.id, 'frontier_points')}>
                            <span class="btn_icon material-icons">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['frontier_points']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Quantity of Points</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Enter the quantity</dt>
                                    <dd>
                                        <input
                                            type="text"
                                            name="frontier_points"
                                            inputmode="numeric"
                                            pattern="\d*"
                                            value={user.frontier_points === 0 ? null : user.frontier_points}
                                            placeholder="Enter the quantity"
                                        />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Character List</dt>
                <dd class="contents_desc">
                    {#if user?.characters.length === 0}
                        <p style="color: #ff8100;">This user doesn't have any characters.</p>
                    {:else}
                        {#each user?.characters as character}
                            <div class="character_item {getWpnTypeByDec(character.weapon_type, 'en').replace(/\s+/g, '').replace('&', 'And')}" class:new={character.is_new_character}>
                                <span class="name">{character.name || 'Ready to Hunt'}</span>

                                {#if character.discord}
                                    <button
                                        class="green_btn linked_character"
                                        on:click={() =>
                                            prepareModal('linkDiscord', {
                                                title: 'Unlink the following characters?',
                                                form_action: 'unlinkDiscord',
                                                user_id: user.id,
                                                username: user.username,
                                                char_id: character.id,
                                                char_name: character.name,
                                                discord_id: character.discord.discord_id,
                                            })}
                                    >
                                        <span class="btn_icon material-icons">link</span>
                                        <span class="btn_text">Linked</span>
                                    </button>
                                {:else}
                                    <button
                                        class="green_btn link_character"
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
                                            on:click={() =>
                                                prepareModal('deleteCharacter', {
                                                    title: 'Delete the following character?',
                                                    form_action: 'deleteCharacter',
                                                    char_id: character.id,
                                                    char_name: character.name,
                                                })}
                                            class:disabled_btn={user?.characters.length === 1}
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
        {/each}

        <div class="pagination_btn_list">
            <form
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        paginationBackClick = false;
                        paginationNextClick = false;

                        await applyAction(result);
                    };
                }}
            >
                <input type="hidden" name="filter_value" value={filterValue} />
                <input type="hidden" name="filter_param" value={filterParam} />
                <input type="hidden" name="start_cursor" value={form?.meta.startCursor} />
                <input type="hidden" name="end_cursor" value={form?.meta.endCursor} />

                <button
                    class="pagination_btn_item"
                    on:click|once={() => {
                        paginationBackClick = true;
                    }}
                    class:active={paginationBackClick}
                    class:disabled_elm={!form?.meta.hasPreviousPage || paginationBackClick}
                    formaction="?/userPaginateBack">Back</button
                >
                <button
                    class="pagination_btn_item"
                    on:click|once={() => {
                        paginationNextClick = true;
                    }}
                    class:active={paginationNextClick}
                    class:disabled_elm={!form?.meta.hasNextPage || paginationNextClick}
                    formaction="?/userPaginateNext">Next</button
                >
            </form>
        </div>
    {/if}
</div>
