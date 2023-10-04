<script lang="ts">
    import { page } from '$app/stores';
    import _ from 'lodash';
    import { slide } from 'svelte/transition';
    import { convUnixToDate, editMode, prepareModal, clicked_submit, getCourseByDecimal, convRFCToISOWithTime, decToLittleEndian, getWpnTypeByDec, getWpnNameByDec, showTipHoverWpn } from '$ts/main';

    export let usersData: Users[];
    export let charactersData: Characters[];
    export let bannedUsersData: BannedUser[];

    interface Users {
        id: number;
        username: string;
        password: string;
        rights: number;
        last_character: number | null;
        last_login: Date | null;
        return_expires: Date | null;
        gacha_premium: number | null;
        gacha_trial: number | null;
        frontier_points: number | null;
    }
    interface Characters {
        id: number;
        user_id: number | null;
        is_female: boolean | null;
        is_new_character: boolean | null;
        name: string | null;
        unk_desc_string: string | null;
        gr: number | null;
        hrp: number | null;
        weapon_type: number | null;
        last_login: number | null;
        restrict_guild_scout: boolean;
        daily_time: Date | null;
        kouryou_point: number | null;
        gcp: number | null;
        guild_post_checked: Date;
        time_played: number;
        weapon_id: number;
        friends: string | null;
        blocked: string | null;
        deleted: boolean;
        cafe_time: number | null;
        netcafe_points: number | null;
        boost_time: Date | null;
        cafe_reset: Date | null;
        bonus_quests: number;
        daily_quests: number;
        promo_points: number;
        rasta_id: number | null;
        pact_id: number | null;
        stampcard: number;
    }
    interface BannedUser {
        user_id: number;
        username: string;
        reason: string;
        date: number;
    }

    /* Related to Edit Mode
====================================================*/
    let editId: number;
    interface CategoryType {
        [key: string]: boolean;
    }
    const catTypes: CategoryType = {
        username: false,
        password: false,
        rights: false,
        return_expires: false,
        gacha_premium: false,
        gacha_trial: false,
        frontier_points: false,
    };
    const adminCtrlTypes: CategoryType = {
        filter: false,
        courseCtrl: false,
    };

    // switch edit contents
    const editModeSwitch = (id: number, type: keyof CategoryType) => {
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
    const adminCtrlSwitch = (type: keyof CategoryType) => {
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

    /* Related to Pagination
====================================================*/
    const itemsPerPage = 5;
    let filterParam = '';
    $: filterValue = '';
    $: filterRegExp = new RegExp(String(filterValue), 'i');

    // set currentPage from the query parameter or default value (1)
    let currentPage = Number($page.url.searchParams.get('userPage')) || 1;

    // switch the display data with pagination button
    const switchPagination = (index: number, filterMode: boolean = false) => {
        currentPage = index;
        const currentURL = $page.url;
        currentURL.searchParams.set('userPage', String(currentPage));
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        currentUsers = paginatedUsers(filterMode);
    };

    // return what is actually displayed
    const paginatedUsers = (filterMode: boolean = false): Users[] => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // returns filtered data if filter mode is true, raw data if normal
        return filterMode ? _.sortBy(filteredUsers, 'id').slice(startIndex, endIndex) : _.sortBy(usersData, 'id').slice(startIndex, endIndex);
    };

    // filtering data based on param
    const calculateFilter = (): Users[] => {
        return _.sortBy(
            _.filter(usersData, (u_data) => {
                switch (filterParam) {
                    case 'id':
                        return filterRegExp.test(u_data.id.toString());

                    case 'username':
                        return filterRegExp.test(u_data.username);

                    default:
                        return u_data.id === u_data.id;
                }
            }),
            'id'
        );
    };

    // reset pagination to prevent malfunctions (when select filterParam or input filterValue)
    const resetPagination = (filterMode: boolean = false) => {
        currentPage = 1;
        const currentURL = $page.url;
        currentURL.searchParams.delete('userPage');
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        currentUsers = paginatedUsers(filterMode);
    };

    // clear input area
    const clearFilterInput = () => {
        const filter_input = document.getElementById('filter_input') as HTMLInputElement;
        filter_input.value = '';
        filterValue = '';
    };

    // initialize
    let currentUsers = paginatedUsers();
    let filteredUsers = calculateFilter();

    let specifiedText = true;
</script>

<h2>
    <span class="material-icons">person</span>
    User List
</h2>

<div class="console_contents">
    <form class="edit_area_form" method="POST">
        <div class="edit_area enter">
            <div class="group_btns" style="margin-bottom: 3%;">
                <button
                    on:click={() => {
                        adminCtrlSwitch('filter'), resetPagination(), clearFilterInput(), (filterParam = '');
                    }}
                    class="save_btn"
                    class:active={adminCtrlTypes['filter']}
                    type="button"
                >
                    <span class="btn_icon material-symbols-outlined">search</span>
                    <span class="btn_text">Filter</span>
                </button>

                <button
                    on:click={() => {
                        adminCtrlSwitch('courseCtrl'), (specifiedText = true);
                    }}
                    class="save_btn"
                    class:active={adminCtrlTypes['courseCtrl']}
                    type="button"
                >
                    <span class="btn_icon material-symbols-outlined">confirmation_number</span>
                    <span class="btn_text">Course Control</span>
                </button>
            </div>
            <p class="edit_area_title">Admin Control Panel</p>

            {#if adminCtrlTypes['filter']}
                <div transition:slide class="edit_area_form_parts text">
                    <input
                        id="filter_input"
                        type="text"
                        bind:value={filterValue}
                        placeholder="Filter ..."
                        on:input={() => (resetPagination(true), (filteredUsers = calculateFilter()), (currentUsers = paginatedUsers(true)))}
                        disabled={filterParam === ''}
                    />
                    By
                    <select
                        class="filter_select"
                        bind:value={filterParam}
                        on:change={() => {
                            resetPagination(), clearFilterInput();
                        }}
                    >
                        <option value="">Unselected (Default)</option>
                        <option value="id">ID</option>
                        <option value="username">Username</option>
                    </select>
                    <p class="console_contents_note" style="margin-top: 3%;">* Once this tab is closed, the filter input is cleared and the select box returns to default.</p>
                </div>
            {/if}

            {#if adminCtrlTypes['courseCtrl']}
                <dl transition:slide class="edit_area_form_parts radio">
                    <dt class="course_list_title">Target Users (Single Select)</dt>
                    <dd class="course_list">
                        <label class="course_item"><input type="radio" name="target_u_radio" value="all" on:change={() => (specifiedText = true)} />All Users</label>

                        <div style="width: calc(50% - 20px); margin: 0 10px 6%;">
                            <label style="cursor: pointer;"><input type="radio" name="target_u_radio" value="specified" on:change={() => (specifiedText = false)} />Specify User(s)</label>
                            <input style="margin-left: 7%; width: 95%;" type="text" name="specified_u_text" placeholder="Ex) 1364+1489+ ..." disabled={specifiedText} />
                        </div>
                        <p class="console_contents_note" style="margin: 0px 0px 3% 4%; text-indent: -1.2rem;">
                            * When specifying multiple users in the "Specify Users" text box, be sure to join the User IDs with "+".
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

                    <button formaction="?/updateUserData" style="margin-top: 0;" on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Save</span>
                    </button>
                </dl>
            {/if}
        </div>
    </form>

    {#if currentUsers.length === 0}
        <p class="console_contents_note">No User Found.</p>
    {:else}
        <div class="pagination_btn_list">
            {#if filterValue === ''}
                {#each Array(Math.ceil(usersData.length / 5)) as _, i}
                    <button class="pagination_btn_item" class:active={currentPage === i + 1} on:click={() => switchPagination(i + 1)}>{i + 1}</button>
                {/each}
            {:else}
                {#each Array(Math.ceil(filteredUsers.length / 5)) as _, i}
                    <button class="pagination_btn_item" class:active={currentPage === i + 1} on:click={() => switchPagination(i + 1, true)}>{i + 1}</button>
                {/each}
            {/if}
        </div>

        {#each currentUsers as user}
            <dl class="console_contents_list">
                <p class="console_contents_list_title">User Data</p>
                <button class="del_btn" on:click={() => prepareModal('banUser', 'Are you sure you want to ban the following user?', 'banUser', user.id, user.username, user.last_character)}>
                    <span style="left: 6%;" class="material-icons">delete</span>
                    <span>Ban This User</span>
                </button>

                {#each bannedUsersData as banned_user}
                    {#if user.id === banned_user.user_id}
                        <div class="banned_user_container">
                            <input type="hidden" name="user_id" value={user.id} />
                            {#each _.filter(charactersData, (c_data) => c_data.user_id === user.id) as character}
                                <input type="hidden" name="character_id" value={character.id} />
                            {/each}

                            <p class="banned_text">This user has been banned.</p>
                            <button
                                type="submit"
                                class="remove_ban_btn"
                                on:click={() => prepareModal('banUser', 'Are you sure you want to remove the ban of the following user?', 'removeBanUser', user.id, user.username, user.last_character)}
                                >Revome the Ban
                            </button>
                        </div>
                    {/if}
                {/each}

                <dt class="contents_term">User ID</dt>
                <dd class="contents_desc">{user.id}</dd>

                <dt class="contents_term">Username</dt>
                <dd class="contents_desc">
                    {user.username}

                    {#if editId === user.id && catTypes['username']}
                        <button class="cancel_btn" on:click={() => editModeSwitch(0, 'username')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editModeSwitch(user.id, 'username')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
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

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
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
                        <button class="cancel_btn" on:click={() => editModeSwitch(0, 'password')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editModeSwitch(user.id, 'password')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['password']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="password" value={editId} />
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
                                        "Go to the following site, enter the new password in the String field and press Encrypt. Then send the generated password to me. (https://bcrypt-generator.com/)"<br />
                                        [2] Receive the generated hashed password from the user via DM.<br />
                                        [3] Enter the hashed password in the text box above and press Save.
                                    </p>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
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
                        <button class="cancel_btn" on:click={() => editModeSwitch(0, 'rights')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editModeSwitch(user.id, 'rights')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
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

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Character ID<br />(Last Played)</dt>
                <dd class="contents_desc">{user.last_character}</dd>

                <dt class="contents_term">Last Login Time (Zulu)</dt>
                <dd class="contents_desc">{convRFCToISOWithTime(user.last_login)}</dd>

                <dt class="contents_term">Expiry Date for<br />Return Ward (Zulu)</dt>
                <dd class="contents_desc">
                    {convRFCToISOWithTime(user.return_expires)}

                    {#if editId === user.id && catTypes['return_expires']}
                        <button class="cancel_btn" on:click={() => editModeSwitch(0, 'return_expires')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editModeSwitch(user.id, 'return_expires')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
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
                                        <input type="datetime-local" name="return_expires" value={convRFCToISOWithTime(user.return_expires)} />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
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
                        <button class="cancel_btn" on:click={() => editModeSwitch(0, 'gacha_premium')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editModeSwitch(user.id, 'gacha_premium')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['gacha_premium']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Number of Coins</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Enter the number</dt>
                                    <dd>
                                        <input
                                            type="text"
                                            name="gacha_premium"
                                            inputmode="numeric"
                                            pattern="\d*"
                                            value={user.gacha_premium === 0 ? null : user.gacha_premium}
                                            placeholder="Enter the number"
                                        />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
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
                        <button class="cancel_btn" on:click={() => editModeSwitch(0, 'gacha_trial')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editModeSwitch(user.id, 'gacha_trial')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['gacha_trial']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Number of Coins</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Enter the number</dt>
                                    <dd>
                                        <input
                                            type="text"
                                            name="gacha_trial"
                                            inputmode="numeric"
                                            pattern="\d*"
                                            value={user.gacha_trial === 0 ? null : user.gacha_trial}
                                            placeholder="Enter the number"
                                        />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
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
                        <button class="cancel_btn" on:click={() => editModeSwitch(0, 'frontier_points')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editModeSwitch(user.id, 'frontier_points')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
                        </button>
                    {/if}

                    {#if editId === user.id && catTypes['frontier_points']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={editId} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Number of Points</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Enter the number</dt>
                                    <dd>
                                        <input
                                            type="text"
                                            name="frontier_points"
                                            inputmode="numeric"
                                            pattern="\d*"
                                            value={user.frontier_points === 0 ? null : user.frontier_points}
                                            placeholder="Enter the number"
                                        />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                                    <span class="btn_icon material-icons">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Character List</dt>
                <dd class="contents_desc">
                    {#if _.filter(charactersData, (c_data) => c_data.user_id === user.id).length === 0}
                        <p style="color: #ff8100;">This user doesn't have any characters.</p>
                    {:else}
                        {#each _.sortBy( _.filter(charactersData, (c_data) => c_data.user_id === user.id), 'id' ) as character}
                            {#if character.deleted}
                                <p style="color: #f56044;">This user's character has been deleted.</p>
                            {:else if !character.is_new_character}
                                <div class="character_item {getWpnTypeByDec(character.weapon_type).replace(/\s+/g, '')}">
                                    <span class="name">{character.name}</span>
                                    <div class="wpn_icon {getWpnTypeByDec(character.weapon_type).replace(/\s+/g, '')}" />
                                    <p class="wpn_text">
                                        {getWpnTypeByDec(character.weapon_type)}
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
                                    <span class="rank">HR: {character.hrp} / GR: {character.gr}</span>
                                    <span class="char_id">Character ID: {character.id}</span>
                                    <span class="last_login">Last Login: {convUnixToDate(character.last_login, false)}</span>
                                </div>
                            {:else}
                                <div class="character_item new" style="cursor: not-allowed;">
                                    <span class="name">Ready to Hunt</span>
                                </div>
                            {/if}
                        {/each}
                    {/if}
                </dd>
            </dl>

            <!--
            
                <dl transition:slide class="console_contents_list">
                    {#if characters_data.every((character) => character.user_id !== user.id)}
                        <p class="no_character_msg">This user doesn't have any characters.</p>
                    {:else}
                        {#each characters_data as character}
                            {#if user.id === character.user_id && character.is_new_character}
                                <p>New Hunter</p>
                            {/if}
                            
                            {#if user.id === character.user_id && !character.is_new_character}
                                <dt class="contents_term">Character ID</dt>
                                <dd class="contents_desc">{character.id}</dd>

                                <dt class="contents_term">Gender</dt>
                                <dd class="contents_desc">
                                    {#if !character.is_female}
                                        Male
                                    {:else}
                                        Female
                                    {/if}
                                </dd>

                                <dt class="contents_term">Character Name</dt>
                                <dd class="contents_desc">{character.name}</dd>

                                <dt class="contents_term">HR</dt>
                                <dd class="contents_desc">{character.hrp}</dd>

                                <dt class="contents_term">GR</dt>
                                <dd class="contents_desc">{character.gr}</dd>

                                <dt class="contents_term">Last Login Date</dt>
                                <dd class="contents_desc">{convUnixToDate(character.last_login, false)}</dd>
                            {/if}
                        {/each}
                    {/if}
                </dl>
            -->
        {/each}
    {/if}
</div>
