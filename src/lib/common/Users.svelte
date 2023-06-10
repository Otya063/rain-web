<script lang="ts">
    export let users_data: Users[];
    export let characters_data: Characters[];

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
        user_id: bigint | null;
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

    let edit_id: number;
    const editUserMode = (id: number) => {
        edit_id = id;
    };

    const modalHandler = (type: string) => {
        const modal = document.getElementById('easyModal') as HTMLDivElement;
        modal.style.display = type === 'open' ? 'block' : 'none';
    };
</script>

<ul class="console_contents">
    {#each users_data as user}
        <li class="console_contents_list_item">
            {#if edit_id === user.id}
                <form class="console_form_section" style="height: 180px;" action="?/updateUserData" method="POST">
                    <input type="hidden" name="user_id" value={edit_id} />

                    <label for="user_username">
                        Username:
                        <input id="user_username" type="text" name="user_username" value={user.username} autocomplete="off" />
                    </label>

                    <label for="user_last_character">
                        Active Character ID:
                        <input id="user_last_character" type="text" name="user_last_character" value={user.last_character} autocomplete="off" />
                    </label>

                    <div class="save_cancel_btn">
                        <button type="submit">[Save]</button>
                        <button on:click={() => editUserMode(0)}>[Cancel]</button>
                    </div>

                    <div id="easyModal" class="modal">
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
                                        <p>Active Character ID</p>
                                        <span>{user.last_character}</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="ban_cancel_btn">
                                <button type="submit" formaction="?/banUser" formmethod="POST">[Ban]</button>
                                <button type="button" on:click={() => modalHandler('close')}>[Cancel]</button>
                            </div>
                        </div>
                    </div>

                    <button type="button" class="ban_user_btn" on:click={() => modalHandler('open')}>[Ban This User]</button>
                </form>
            {:else}
                <ul class="each_item_contents_list">
                    <li class="each_item_contents">
                        <p>User ID:</p>
                        <span>{user.id}</span>
                    </li>

                    <li class="each_item_contents">
                        <p>Username:</p>
                        <span>{user.username}</span>
                    </li>

                    <li class="each_item_contents">
                        <p>Active Character ID:</p>
                        <span>{user.last_character}</span>
                    </li>

                    {#each characters_data as character}
                        {#if user.last_character === character.id}
                            <li class="each_item_contents">
                                <p>Character Name:</p>
                                <span>{character.name}</span>
                            </li>
                        {/if}
                    {/each}

                    <button class="edit_btn" on:click={() => editUserMode(user.id)}>[Edit]</button>
                </ul>
            {/if}
        </li>
    {/each}
</ul>
