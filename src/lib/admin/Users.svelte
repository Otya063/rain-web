<script lang="ts">
    import _ from 'lodash';
    import { convUnixToDate, edit_mode, clicked_submit, user_ban, prepareUserBan } from '$ts/main';

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
        title: false,
        url: false,
        date: false,
        info_type: false,
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
</script>

<h2>
    <span class="material-icons">person</span>
    User List
</h2>

<div class="console_contents">
    {#each _.sortBy(users_data, 'id') as user}
        <p class="console_contents_list_title">
            [ User ID: {user.id} ]
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
                        {#each characters_data as character}
                            <input type="hidden" name="character_id" value={character.id} />
                        {/each}

                        <p class="banned_text">This user has been banned.</p>
                        <button
                            type="submit"
                            class="remove_ban_btn"
                            on:click={() => prepareUserBan('Are you sure you want to remove the ban of the following user?', 'removeBanUser', user.id, user.username, user.last_character)}
                            >[Revome the Ban]</button
                        >
                    </div>
                {/if}
            {/each}

            <!-- {#if ban_id === user.id}
                <div id="remove_ban" class="modal">
                    <form action="?/removeBanUser" method="POST">
                        <div class="modal_content">
                            <div class="modal_header">
                                <h1>Ban Removal Form</h1>
                            </div>
                            <div class="modal_body">
                                <p>Are you sure you want to remove the ban of the following user?</p>
                                <ul class="modal_list">
                                    <input type="hidden" name="user_id" value={user.id} />
                                    {#each characters_data as character}
                                        {#if user.id === character.user_id}
                                            <input type="hidden" name="character_id" value={character.id} />
                                        {/if}
                                    {/each}

                                    <li class="modal_list_item">
                                        <p>User ID</p>
                                        <span>{user.id}</span>
                                    </li>

                                    <li class="modal_list_item">
                                        <p>Username</p>
                                        <span>{user.username}</span>
                                    </li>

                                    <li class="modal_list_item">
                                        <p>Character ID (Last Played)</p>
                                        <span>{user.last_character}</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="ban_btn_group">
                                <button type="submit">[Remove the Ban]</button>
                                <button type="button" on:click={() => modalHandler(0)}>[Cancel]</button>
                            </div>
                        </div>
                    </form>
                </div>
            {/if} -->

            <dt class="contents_term">User ID</dt>
            <dd class="contents_desc">{user.id}</dd>

            <dt class="contents_term">Username</dt>
            <dd class="contents_desc">{user.username}</dd>

            <dt class="contents_term">Character ID<br />(Last Played)</dt>
            <dd class="contents_desc">{user.last_character}</dd>

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
</div>
