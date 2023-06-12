<script lang="ts">
    import { convUnixToDate } from '$ts/main';

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

    let edit_id: number;
    const editUserMode = (id: number) => {
        edit_id = id;
    };

    let ban_id: number;
    const modalHandler = (id: number) => {
        ban_id = id;
    };
</script>

{#each users_data as user}
    <li class="console_contents_list_item">
        {#if edit_id === user.id}
            <form class="console_form_section" style="height: 180px;" action="?/updateUserData" method="POST">
                <input type="hidden" name="user_id" value={edit_id} />

                {#each characters_data as character}
                    {#if user.id === character.user_id}
                        <input type="hidden" name="character_id" value={character.id} />
                    {/if}
                {/each}

                <label for="user_username">
                    Username:
                    <input id="user_username" type="text" name="user_username" value={user.username} autocomplete="off" />
                </label>

                <label for="user_last_character">
                    Character ID (Last Played):
                    <input id="user_last_character" type="text" name="user_last_character" value={user.last_character} autocomplete="off" />
                </label>

                <div class="save_cancel_btn">
                    <button type="submit">[Save]</button>
                    <button on:click={() => editUserMode(0)}>[Cancel]</button>
                </div>

                {#if ban_id === user.id}
                    <div id="user_ban" class="modal">
                        <div class="modal_content">
                            <div class="modal_header">
                                <h1>User Ban Form</h1>
                            </div>
                            <div class="modal_body">
                                <p>Are you sure you want to ban the following user?</p>
                                <ul class="modal_list">
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
                                <button type="submit" formaction="?/banUser" formmethod="POST">[Ban]</button>
                                <button type="button" on:click={() => modalHandler(0)}>[Cancel]</button>
                            </div>
                        </div>
                    </div>
                {/if}

                <button type="button" class="ban_user_btn" on:click={() => modalHandler(user.id)}>[Ban This User]</button>
            </form>
        {:else}
            {#each banned_users_data as banned_user}
                {#if user.id === banned_user.user_id}
                    <div class="banned_user_container">
                        <p class="banned_text">This user has been banned.</p>
                        <button type="button" class="remove_ban_btn" on:click={() => modalHandler(user.id)}>[Revome the Ban]</button>
                    </div>
                {/if}
            {/each}

            {#if ban_id === user.id}
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
            {/if}

            <ul style="padding: 0;" class="each_item_contents_list">
                <li class="each_item_contents">
                    <div class="user_info_item">
                        <p>User ID:</p>
                        <span>{user.id}</span>
                    </div>

                    <div class="user_info_item">
                        <p>Username:</p>
                        <span>{user.username}</span>
                    </div>

                    <div class="user_info_item">
                        <p>Character ID (Last Played):</p>
                        <span>{user.last_character}</span>
                    </div>
                </li>

                {#if characters_data.every((character) => character.user_id !== user.id)}
                    <p class="no_character_msg">This user doesn't have any characters.</p>
                {:else}
                    <li class="each_item_contents">
                        {#each characters_data as character}
                            <ul class="character_list">
                                {#if user.id === character.user_id && !character.is_new_character}
                                    <li class="character_list_item">
                                        <p>Character ID:</p>
                                        <span>{character.id}</span>
                                    </li>
                                    <li class="character_list_item">
                                        <p>Gender:</p>
                                        <span>
                                            {#if !character.is_female}
                                                Male
                                            {:else}
                                                Female
                                            {/if}
                                        </span>
                                    </li>
                                    <li class="character_list_item">
                                        <p>Character Name:</p>
                                        <span>{character.name}</span>
                                    </li>
                                    <li class="character_list_item">
                                        <p>HR:</p>
                                        <span>{character.hrp}</span>
                                    </li>
                                    <li class="character_list_item">
                                        <p>GR:</p>
                                        <span>{character.gr}</span>
                                    </li>
                                    <li class="character_list_item">
                                        <p>Last Login Date:</p>
                                        <span>{convUnixToDate(character.last_login, false)}</span>
                                    </li>
                                {:else}
                                    <p>New Hunter</p>
                                {/if}
                            </ul>
                        {/each}
                    </li>
                {/if}

                <button class="edit_btn" on:click={() => editUserMode(user.id)}>[Edit]</button>
            </ul>
        {/if}
    </li>
{/each}
