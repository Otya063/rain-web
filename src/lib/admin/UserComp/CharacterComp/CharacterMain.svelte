<script lang="ts">
    import { DateTime } from 'luxon';
    import { applyAction, enhance } from '$app/forms';
    import { BinaryTypesArray, type CharacterMainProps, type CharacterEditableItemType } from '$types';
    import {
        openModal,
        onSubmit,
        decToLittleEndian,
        getWpnTypeByDec,
        getWpnNameByDec,
        msgClosed,
        timeOut,
        closeMsgDisplay,
        conv2DArrayToObject,
        userDisplayState,
        convHrpToHr,
        validateCharName,
        secToTime,
        tooltip,
        claimedDistributions,
    } from '$utils/client';

    let {
        user,
        stage = $bindable(0),
        scrollY = $bindable(),
        scrollYBeforeClickClaimedDist = $bindable(),
        catTypes,
        editingId,
        editModeSwitch,
        onCharacterUpdate,
        isMobile,
    }: CharacterMainProps = $props();
    let validName = $state(true);
    let selectedCharacterIndex = $state(0);
    const char = $derived(user.characters[selectedCharacterIndex]);

    // CharacterCardコンポーネント内でuserDisplayStateが更新（キャラ切り替え）されたら、selectedCharacterIndexを自動更新
    $effect(() => {
        const userState = $userDisplayState[user.id];
        if (userState) {
            selectedCharacterIndex = userState.selectedCharacterIndex;
        }
    });
</script>

{#snippet fieldButtons(col: CharacterEditableItemType, charId: number, disabled = false)}
    {#if editingId === charId && catTypes[col]}
        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, col)}>
            <span class="btn_icon material-symbols-outlined">close</span>
            <span class="btn_text">Cancel</span>
        </button>
        <button
            class="blue_btn"
            class:disabled_elm={disabled}
            type="submit"
            onclick={() => {
                $timeOut && closeMsgDisplay($timeOut);
                onSubmit.set(true);
            }}
        >
            <span class="btn_icon material-symbols-outlined">check</span>
            <span class="btn_text">Save</span>
        </button>
    {:else}
        <button class="normal_btn" type="button" onclick={() => editModeSwitch(charId, col)}>
            <span class="btn_icon material-symbols-outlined">mode_edit</span>
            <span class="btn_text">Edit</span>
        </button>
    {/if}
{/snippet}

<form
    action="?/updateCharacter"
    method="POST"
    enctype="multipart/form-data"
    use:enhance={({ formData }) => {
        const data = conv2DArrayToObject([...formData.entries()]);
        const column = Object.keys(data)[2] as CharacterEditableItemType;
        const value = Object.values(data)[2];
        editModeSwitch(0, column);

        return async ({ result }) => {
            msgClosed.set(false);
            onSubmit.set(false);
            await applyAction(result);

            if (result.type === 'success') {
                onCharacterUpdate(user.id, selectedCharacterIndex, column, value);
            }
        };
    }}
>
    <input type="hidden" name="user_id" value={user.id} />
    <input type="hidden" name="character_id" value={char.id} />

    <dl class="console_contents_list">
        <dt class="contents_term">Character ID</dt>
        <dd class="contents_desc">{char.id}</dd>

        <dt class="contents_term">
            Name
            <!-- 新規作成キャラクターもしくはアカウント未連携時、エラーマーク表示 -->
            {#if char.is_new_character || !char.linked_discord_id}
                <span
                    class="help_btn material-symbols-outlined"
                    use:tooltip={char.is_new_character ? "New character name can't be edited." : "This character name can't be edited because the discord account isn't linked."}
                >
                    error
                </span>
            {:else}
                <span
                    class="help_btn material-symbols-outlined"
                    use:tooltip={`<b>Note: 50,000 Bounty Coins are automatically deducted on name change.</b><hr style="border-color: rgba(255,255,255,0.3); margin: 6px 0;" />Allowed characters only:<br />・ Japanese: Hiragana, Katakana, Kanji<br />・ English: A–Z, a–z, 0–9<br />・ Symbols: ! " # $ % &amp; ' ( ) * + , - . / : ; &lt; = &gt; ? @ [ \\ ] ^ _ \` { | } ~`}
                >
                    help
                </span>
            {/if}
            {#if isMobile}&nbsp;{:else}<br />{/if}
            <span class="contents_term_required">[Required]</span>
        </dt>
        <dd class="contents_desc">
            <div class="contents_desc_item">
                <p class="contents_desc_item_text">
                    {#if editingId === char.id && catTypes['name']}
                        <input type="text" name="name" value={char.name || 'Ready to Hunt'} oninput={(e) => (validName = validateCharName(e))} autocomplete="off" />
                        <input type="hidden" name="discord_id" value={char.linked_discord_id} />
                        <input type="hidden" name="bounty_coin" value={char.bounty_coin} />
                    {:else}
                        {char.name || 'Ready to Hunt'}
                    {/if}
                </p>
            </div>
            {#if !char.is_new_character && char.linked_discord_id}
                <div class="contents_desc_item_group_btn">
                    {@render fieldButtons('name', char.id, !validName)}
                </div>
            {/if}
        </dd>

        <dt class="contents_term">Gender</dt>
        <dd class="contents_desc">{char.is_female ? 'Female' : 'Male'}</dd>

        <dt class="contents_term">HR</dt>
        <dd class="contents_desc">{convHrpToHr(char.hrp)}</dd>

        <dt class="contents_term">GR</dt>
        <dd class="contents_desc">{char.gr}</dd>

        <dt class="contents_term">Weapon</dt>
        <dd class="contents_desc">
            {#if char.is_new_character}
                No weapon data.
            {:else}
                [ {getWpnTypeByDec(char.weapon_type, 'en')} ]
                <br />

                {getWpnNameByDec(char.weapon_id, char.weapon_type)} ({decToLittleEndian(char.weapon_id)})
            {/if}
        </dd>

        <dt class="contents_term">Last Login</dt>
        <dd class="contents_desc">
            {DateTime.fromSeconds(char.last_login || 0)
                .setZone(DateTime.local().zoneName)
                .setLocale('en')
                .toLocaleString({ year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </dd>

        <dt class="contents_term">Playtime</dt>
        <dd class="contents_desc">{secToTime(char.playtime)}</dd>

        <dt class="contents_term">Bounty Coin</dt>
        <dd class="contents_desc">
            {#if !char.linked_discord_id}
                No account linked.
            {:else}
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        {#if editingId === char.id && catTypes['bounty']}
                            <input type="text" name="bounty" inputmode="numeric" pattern="\d*" value={char.bounty_coin === 0 ? null : char.bounty_coin} placeholder="Enter the quantity." />
                        {:else}
                            {char.bounty_coin === 0 || !char.bounty_coin ? 'No coins.' : `${char.bounty_coin} Coin(s)`}
                        {/if}
                    </p>
                </div>
                {#if !char.is_new_character}
                    <div class="contents_desc_item_group_btn">
                        {@render fieldButtons('bounty', char.id)}
                    </div>
                {/if}
            {/if}
        </dd>

        <dt class="contents_term">
            Clan Name
            <!-- {#if char.clan.name}
                <span class="help_btn material-symbols-outlined" use:tooltip={'If this character is the last member in the clan, the clan itself will also be automatically deleted.'}>help</span>
            {/if} -->
        </dt>
        <dd class="contents_desc">
            <div class="contents_desc_item">
                <p class="contents_desc_item_text">
                    {char.clan.name || 'No joined clan.'}
                </p>
            </div>

            <!-- {#if char.clan.name}
                {#if editingId === char.id && catTypes['clan']}
                    <input type="hidden" name="clan" />
                    <input type="hidden" name="clan_length" value={char.clan.members} />
                    <input type="hidden" name="clan_id" value={char.clan.id} />
                    <input type="hidden" name="clan_name" value={char.clan.name} />
                {/if}
                <div class="contents_desc_item_group_btn">
                    {#if editingId === char.id && catTypes['clan']}
                        <button type="button" class="red_btn" onclick={() => editModeSwitch(0, 'clan')}>
                            <span class="btn_icon material-symbols-outlined">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                        <button
                            class="blue_btn"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                onSubmit.set(true);
                                editModeSwitch(0, 'clan');
                            }}
                        >
                            <span class="btn_icon material-symbols-outlined">check</span>
                            <span class="btn_text">Leave</span>
                        </button>
                    {:else}
                        <button type="button" class="normal_btn" onclick={() => editModeSwitch(char.id, 'clan')}>
                            <span class="btn_icon material-symbols-outlined">mode_edit</span>
                            <span class="btn_text">Edit</span>
                        </button>
                    {/if}
                </div>
            {/if} -->
        </dd>

        {#if !char.is_new_character}
            <dt class="contents_term">
                Binary Data
                <span
                    class="help_btn material-symbols-outlined"
                    use:tooltip={`Up to 14 files can be uploaded at a time.<br />Each file name must match one of the following:<br /><p style="display: grid; row-gap: 5px; grid-template-columns: repeat(2, 1fr); margin-top: 6px;">${BinaryTypesArray.map((type) => `<span>・${type}</span>`).join('')}</p>`}
                    >help</span
                >
                {#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc">
                {#if editingId === char.id && catTypes['reupload_binary']}
                    <div class="contents_desc_item">
                        <p class="contents_desc_item_text">
                            <input type="hidden" name="reupload_binary" />
                            <input name="file" id="save_file_input" type="file" accept=".bin" multiple />
                        </p>
                    </div>
                {/if}
                <div class="contents_desc_item_group_btn">
                    {#if editingId === char.id && catTypes['reupload_binary']}
                        <button type="button" class="red_btn" onclick={() => editModeSwitch(0, 'reupload_binary')}>
                            <span class="btn_icon material-symbols-outlined">close</span>
                            <span class="btn_text">Cancel</span>
                        </button>
                        <button
                            class="blue_btn"
                            type="submit"
                            onclick={() => {
                                $timeOut && closeMsgDisplay($timeOut);
                                onSubmit.set(true);
                            }}
                        >
                            <span class="btn_icon material-symbols-outlined">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    {:else}
                        <button type="button" class="normal_btn" onclick={() => editModeSwitch(char.id, 'reupload_binary')}>
                            <span class="btn_icon material-symbols-outlined">upload_file</span>
                            <span class="btn_text">Re-upload</span>
                        </button>
                    {/if}
                    <button
                        type="button"
                        class="normal_btn"
                        onclick={() =>
                            openModal('downloadBinary', {
                                label: 'downloadBinary',
                                charId: char.id,
                                charName: char.name || 'Ready to Hunt',
                            })}
                    >
                        <span class="btn_icon material-symbols-outlined">cloud_download</span>
                        <span class="btn_text">Download</span>
                    </button>
                </div>
            </dd>
        {/if}

        <dt class="contents_term">Claimed Distribution</dt>
        <dd class="contents_desc">
            {#if !char.claim_distribution}
                No claimed distributions.
            {:else}
                <button
                    type="button"
                    class="normal_btn"
                    onclick={() => {
                        scrollYBeforeClickClaimedDist = scrollY;
                        claimedDistributions.set({
                            userId: user.id,
                            charId: char.id,
                            data: char.claim_distribution,
                        });
                        stage = 1;
                    }}
                >
                    <span class="btn_icon material-symbols-outlined">pageview</span>
                    <span class="btn_text">View</span>
                </button>
            {/if}
        </dd>
    </dl>
</form>
