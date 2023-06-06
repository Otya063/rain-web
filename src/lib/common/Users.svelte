<script lang="ts">
    export let users_data: Users[];

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

    let edit_id: number;
    const editUserMode = (id: number) => {
        edit_id = id;
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

                    <button class="del_info_btn" style="top: -8%;" type="submit" formaction="?/banUser" formmethod="POST">[Ban This User]</button>
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

                    <button class="edit_btn" on:click={() => editUserMode(user.id)}>[Edit]</button>
                </ul>
            {/if}
        </li>
    {/each}
</ul>
