<script lang="ts">
    import _ from 'lodash';
    import { slide } from 'svelte/transition';
    import { convUnixToDate, edit_mode, prepareUserBan, clicked_submit, getCourseByDecimal, convRFCToISOWithTime } from '$ts/main';

    export let users_data: Users[];
    export let characters_data: Characters[];
    export let banned_users_data: BannedUser[];

    interface Users {
        id: number;
        username: string;
        password: string;
        item_box: Buffer | null;
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

    /* Below is the edit mode script
    ====================================================*/
    let edit_id: number;
    interface CategoryType {
        [key: string]: boolean;
    }
    const cat_types: CategoryType = {
        user_name: false,
        rights: false,
        return_expires: false,
    };
    const editMode = (id: number, type: keyof CategoryType) => {
        // check if another category type is already in edit mode
        const active_editing = Object.values(cat_types).some((boolean) => boolean === true);

        // when another edit_btn is pressed while editing, the editing target is switched
        if (active_editing && id !== 0) {
            Object.keys(cat_types).forEach((key) => {
                cat_types[key] = false;
            });

            cat_types[type] = true;
            edit_id = id;

            return false;
        }

        if (!$edit_mode) {
            // when editing
            edit_mode.set(true);
            edit_id = id;
            cat_types[type] = true;
        } else {
            // when finished editing
            edit_mode.set(false);
            edit_id = id;
            cat_types[type] = false;
        }
    };

    const currentDate = new Date();
    const isoString = currentDate.toISOString();
</script>

<h2>
    <span class="material-icons">person</span>
    User List
</h2>

<div class="console_contents">
    {#if users_data.length === 0}
        <p class="console_contents_note">No User Found.</p>
    {:else}
        {#each _.sortBy(users_data, 'id') as user, i}
            <p class="console_contents_list_title">
                User Data [ {i + 1} ]
                <button style="width: 20%;" class="del_btn" on:click={() => prepareUserBan('Are you sure you want to ban the following user?', 'banUser', user.id, user.username, user.last_character)}>
                    <span style="left: 6%;" class="material-icons">delete</span>
                    <span>Ban This User</span>
                </button>
            </p>

            <dl class="console_contents_list">
                {#each banned_users_data as banned_user}
                    {#if user.id === banned_user.user_id}
                        <div class="banned_user_container">
                            <input type="hidden" name="user_id" value={user.id} />
                            {#each _.filter(characters_data, (each_data) => {
                                return each_data.user_id === user.id;
                            }) as character}
                                <input type="hidden" name="character_id" value={character.id} />
                            {/each}

                            <p class="banned_text">This user has been banned.</p>
                            <button
                                type="submit"
                                class="remove_ban_btn"
                                on:click={() => prepareUserBan('Are you sure you want to remove the ban of the following user?', 'removeBanUser', user.id, user.username, user.last_character)}
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

                    {#if edit_id === user.id && cat_types['user_name']}
                        <button class="cancel_btn" on:click={() => editMode(0, 'user_name')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editMode(user.id, 'user_name')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
                        </button>
                    {/if}

                    {#if edit_id === user.id && cat_types['user_name']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={edit_id} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Username</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Enter new username</dt>
                                    <dd>
                                        <input type="text" name="username" value={user.username} autocomplete="off" />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                                    <span class="material-icons">check</span>
                                    Save
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Course</dt>
                <dd class="contents_desc">
                    <ul>
                        {#each Object.entries(getCourseByDecimal(user.rights)) as [course, { enabled }]}
                            {#if enabled}
                                <li>{course}</li>
                            {/if}
                        {/each}
                    </ul>

                    {#if edit_id === user.id && cat_types['rights']}
                        <button class="cancel_btn" on:click={() => editMode(0, 'rights')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editMode(user.id, 'rights')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
                        </button>
                    {/if}

                    {#if edit_id === user.id && cat_types['rights']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={edit_id} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Courses</p>
                                <dl class="edit_area_form_parts radio">
                                    <dt>HL (Single Select)</dt>
                                    <dd class="course_list">
                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights)), "id") as [courseName, { enabled, code }]}
                                            {#if courseName === 'Hunter Life Course' || courseName === 'Hunter Life Continuation Course' || courseName === 'Free Course'}
                                                <label class="course_item"><input type="radio" name="hl" value={code} checked={enabled} />{courseName}</label>
                                            {/if}
                                        {/each}
                                    </dd>

                                    <dt>EX (Single Select)</dt>
                                    <dd class="course_list">
                                        {#each  _.sortBy(Object.entries(getCourseByDecimal(user.rights)), "id") as [courseName, { enabled, code }]}
                                            {#if courseName === 'Extra Course' || courseName === 'Extra Continuation Course'}
                                                <label class="course_item"><input type="radio" name="ex" value={code} checked={enabled} />{courseName}</label>
                                            {/if}
                                        {/each}
                                    </dd>

                                    <dt>Others (Multiple Select)</dt>
                                    <dd class="course_list">
                                        {#each _.sortBy(Object.entries(getCourseByDecimal(user.rights)), "id") as [courseName, { enabled, code }]}
                                            {#if courseName !== 'Hunter Life Course' && courseName !== 'Hunter Life Continuation Course' && courseName !== 'Free Course' && courseName !== 'Extra Course' && courseName !== 'Extra Continuation Course'}
                                                <label class="course_item"><input type="checkbox" name={code} checked={enabled} />{courseName}</label>
                                            {/if}
                                        {/each}
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                                    <span class="material-icons">check</span>
                                    Save
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <dt class="contents_term">Character ID<br />(Last Played)</dt>
                <dd class="contents_desc">{user.last_character}</dd>

                <dt class="contents_term">Last Login Time (Zulu)</dt>
                <dd class="contents_desc">{convRFCToISOWithTime(user.last_login)}</dd>

                <dt class="contents_term">Expiration Date for Return Ward (Zulu)</dt>
                <dd class="contents_desc">
                    {convRFCToISOWithTime(user.return_expires)}

                    {#if edit_id === user.id && cat_types['return_expires']}
                        <button class="cancel_btn" on:click={() => editMode(0, 'return_expires')}>
                            <span class="material-icons">close</span>
                            Cancel
                        </button>
                    {:else}
                        <button class="edit_btn" on:click={() => editMode(user.id, 'return_expires')}>
                            <span class="material-icons">mode_edit</span>
                            Edit
                        </button>
                    {/if}

                    {#if edit_id === user.id && cat_types['return_expires']}
                        <form transition:slide class="edit_area_form" action="?/updateUserData" method="POST">
                            <input type="hidden" name="user_id" value={edit_id} />
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change Date</p>
                                <dl class="edit_area_form_parts text">
                                    <dt>Set new date</dt>
                                    <dd>
                                        <input type="datetime-local" name="return_expires" value={convRFCToISOWithTime(user.return_expires)} />
                                    </dd>
                                </dl>

                                <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                                    <span class="material-icons">check</span>
                                    Save
                                </button>
                            </div>
                        </form>
                    {/if}
                </dd>

                <!-- {#if characters_data.every((character) => character.user_id !== user.id)}
                    <p class="no_character_msg">This user doesn't have any characters.</p>
                {:else}
                    {#each characters_data as character}
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
                        {:else}
                            <p>New Hunter</p>
                        {/if}
                    {/each}
                {/if} -->
            </dl>
        {/each}
    {/if}
</div>
