<script lang="ts">
    import type { launcher_info } from '@prisma/client/edge';
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { slide } from 'svelte/transition';
    import { applyAction, enhance } from '$app/forms';
    import { allInformation, prepareModal, underscoreAndLowercase, onSubmit, msgClosed, discordLinkConvertor, conv2DArrayToObject, timeOut, closeMsgDisplay, tooltip } from '$utils/client';

    interface Props {
        informationData: { [key: string]: launcher_info[] };
        createdInfo: launcher_info;
        updatedInfo: launcher_info;
        infoAddMode: boolean;
        isMobile: boolean;
    }
    let { informationData, createdInfo, updatedInfo, infoAddMode = $bindable(), isMobile }: Props = $props();
    let editingId: number = $state(0); // 編集対象のインフォID
    let editMode = false;
    const catTypes: { [key in keyof Omit<launcher_info, 'id'>]: boolean } = $state({
        title: false,
        url: false,
        type: false,
        created_at: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    allInformation.set(informationData); // サーバーから取得したインフォデータをストアで管理

    /**
     * 編集モードを切り替える
     *
     * @template T 編集対象のIDの型（数値）
     * @template U 切り替え対象のカテゴリのタイプ、`launcher_info`から`id`フィールドを除いたキー
     * @param {T} id 編集対象のID
     * @param {U} type 切り替えたいカテゴリのタイプ
     */
    const editModeSwitch = <T extends number, U extends keyof Omit<launcher_info, 'id'>>(id: T, type: U): void => {
        // 別のカテゴリがすでに編集モードかどうかを確認
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // 編集中に別の通常ボタンが押された場合、編集対象を切り替える
        if (activeCat && id !== 0) {
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<launcher_info, 'id'>;
                catTypes[key] = false;
            });

            catTypes[type] = true;
            editingId = id;

            return;
        }

        // 開閉をトグルする（true ⇔ false）
        if (!editMode) {
            // 編集を開始する場合
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // 編集を終了する場合
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
    };
</script>

{#if infoAddMode}
    <h2>
        <span class="material-symbols-outlined">post_add</span>
        Add New Information Form
    </h2>

    <div class="console_contents">
        <form
            action="?/createInfoData"
            method="POST"
            use:enhance={() => {
                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        $allInformation[createdInfo.type].push(createdInfo);
                        infoAddMode = false;
                    }
                };
            }}
        >
            <dl class="console_contents_list">
                {#if isMobile}
                    <dt class="contents_term">Title <span class="contents_term_required">[Required]</span></dt>
                {:else}
                    <dt class="contents_term">Title<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}

                <dd class="contents_desc">
                    <input type="text" name="title" autocomplete="off" />
                </dd>

                <dt class="contents_term">
                    Hyperlink
                    <span class="help_btn material-symbols-outlined" use:tooltip={'If the domain is “discord.com”, the url will be automatically converted to open the discord app.'}>help</span>
                </dt>
                <dd class="contents_desc">
                    <input type="text" name="url" autocomplete="off" />
                </dd>

                <dt class="contents_term">Date</dt>
                <dd class="contents_desc">Your local time is automatically converted to UTC and set in the database.</dd>

                {#if isMobile}
                    <dt class="contents_term">Type <span class="contents_term_required">[Required]</span></dt>
                {:else}
                    <dt class="contents_term">Type<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}

                <dd class="contents_desc">
                    <select name="type">
                        <option hidden disabled selected>Select the type of information here.</option>
                        {#each Object.keys($allInformation) as key}
                            <option value={key}>{key}</option>
                        {/each}
                    </select>
                </dd>
            </dl>

            <div class="group_btns">
                <button class="red_btn" type="button" onclick={() => (infoAddMode = false)}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
                
                <button
                    class="blue_btn"
                    type="submit"
                    onclick={() => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);
                    }}
                >
                    <span class="btn_icon material-symbols-outlined">check</span>
                    <span class="btn_text">Save</span>
                </button>
            </div>
        </form>
    </div>
{:else}
    {#each Object.entries($allInformation) as [typename, infoArr]}
        <h2 class={underscoreAndLowercase(typename)}>
            <span class="material-symbols-outlined">info</span>
            {typename} Info
        </h2>

        <div class="console_contents">
            {#each _.sortBy(infoArr, 'id') as info}
                <form
                    action="?/updateInfoData"
                    method="POST"
                    use:enhance={({ formData }) => {
                        const data = conv2DArrayToObject([...formData.entries()]);
                        const id = Number(data.info_id);
                        const type = String(data.info_type);
                        const column = Object.keys(data)[2];
                        const value = Object.values(data)[2];

                        return async ({ result }) => {
                            msgClosed.set(false);
                            onSubmit.set(false);
                            await applyAction(result);

                            if (result.type === 'success') {
                                // 編集したインフォの各値を更新する
                                $allInformation[type] = $allInformation[type].map((info) => {
                                    if (info.id === id)
                                        return {
                                            ...info,
                                            [column]:
                                                column !== 'url'
                                                    ? column === 'created_at'
                                                        ? DateTime.fromISO(String(value)).toJSDate()
                                                        : value
                                                    : !value
                                                      ? null
                                                      : value.indexOf('discord.com')
                                                        ? discordLinkConvertor(value)
                                                        : value,
                                        };

                                    return info;
                                });

                                // インフォをタイプに基づいて再レンダリングする
                                if (column === 'type') {
                                    // 削除時
                                    $allInformation[type] = $allInformation[type].filter((i) => i.id !== id);
                                    // 追加時
                                    $allInformation[value].push(updatedInfo);
                                }
                            }
                        };
                    }}
                >
                    <input type="hidden" name="info_id" value={editingId} />
                    <input type="hidden" name="info_type" value={info.type} />

                    <dl class="console_contents_list">
                        <p class="console_contents_list_title">
                            <button
                                class="red_btn"
                                type="button"
                                onclick={() =>
                                    prepareModal('deleteInfo', {
                                        title: 'Delete the following information?',
                                        formAction: 'deleteInfoData',
                                        infoId: info.id,
                                        infoTitle: info.title,
                                        infoUrl: info.url,
                                        createdAt: DateTime.fromJSDate(info.created_at)
                                            .setZone(DateTime.local().zoneName)
                                            .setLocale('en')
                                            .toLocaleString({ year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                        infoType: info.type,
                                    })}
                            >
                                <span class="btn_icon material-symbols-outlined">delete</span>
                                <span class="btn_text">Delete</span>
                            </button>

                            Info Data

                            <input type="hidden" name="info_id" value={info.id} />
                        </p>

                        <dt class="contents_term">ID</dt>
                        <dd class="contents_desc">{info.id}</dd>

                        <dt class="contents_term">Title</dt>
                        <dd class="contents_desc">
                            {info.title}

                            {#if editingId === info.id && catTypes['title']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'title')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" onclick={() => editModeSwitch(info.id, 'title')}>
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === info.id && catTypes['title']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Title</p>
                                            <p class="console_contents_note">* Empty isn't allowed.</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Enter new title</dt>
                                                <dd>
                                                    <input type="text" name="title" value={info.title} autocomplete="off" />
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                onclick={() => {
                                                    onSubmit.set(true);
                                                    $timeOut && closeMsgDisplay($timeOut);
                                                    editModeSwitch(0, 'title');
                                                }}
                                            >
                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </dd>

                        <dt class="contents_term">Hyperlink</dt>
                        <dd class="contents_desc">
                            {info.url || 'None'}

                            {#if editingId === info.id && catTypes['url']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'url')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" onclick={() => editModeSwitch(info.id, 'url')}>
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === info.id && catTypes['url']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Hyperlink</p>
                                            <p class="console_contents_note">* If the domain is "discord.com," the url will be converted so that the discord app will open automatically.</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Enter new hyperlink</dt>
                                                <dd>
                                                    <input type="text" name="url" value={info.url} autocomplete="off" />
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                onclick={() => {
                                                    onSubmit.set(true);
                                                    $timeOut && closeMsgDisplay($timeOut);
                                                    editModeSwitch(0, 'url');
                                                }}
                                            >
                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </dd>

                        <dt class="contents_term">Created At</dt>
                        <dd class="contents_desc">
                            {DateTime.fromJSDate(info.created_at)
                                .setZone(DateTime.local().zoneName)
                                .setLocale('en')
                                .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}

                            {#if editingId === info.id && catTypes['created_at']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'created_at')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" onclick={() => editModeSwitch(info.id, 'created_at')}>
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === info.id && catTypes['created_at']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Date</p>
                                            <p class="console_contents_note">* The date and time to be set are automatically converted to UTC.</p>
                                            <p class="console_contents_note">* Empty isn't allowed.</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Set new date</dt>
                                                <dd>
                                                    <input type="datetime-local" name="created_at" value={DateTime.fromJSDate(info.created_at).toFormat("yyyy-MM-dd'T'HH:mm")} />
                                                    <input type="hidden" name="zonename" value={DateTime.local().zoneName} />
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                onclick={() => {
                                                    onSubmit.set(true);
                                                    $timeOut && closeMsgDisplay($timeOut);
                                                    editModeSwitch(0, 'created_at');
                                                }}
                                            >
                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </dd>

                        <dt class="contents_term">Type</dt>
                        <dd class="contents_desc">
                            {info.type}

                            {#if editingId === info.id && catTypes['type']}
                                <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'type')}>
                                    <span class="btn_icon material-symbols-outlined">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" onclick={() => editModeSwitch(info.id, 'type')}>
                                    <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                            <div class="edit_area_box_wrapper">
                                {#if editingId === info.id && catTypes['type']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Information Type</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Select new type</dt>
                                                <dd>
                                                    <select name="type">
                                                        {#each Object.keys($allInformation) as key}
                                                            <option value={key} selected={key === typename}>{key}</option>
                                                        {/each}
                                                    </select>
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                onclick={() => {
                                                    onSubmit.set(true);
                                                    $timeOut && closeMsgDisplay($timeOut);
                                                    editModeSwitch(0, 'type');
                                                }}
                                            >
                                                <span class="btn_icon material-symbols-outlined">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </dd>
                    </dl>
                </form>
            {:else}
                <p class="console_contents_note">No Information Data</p>
            {/each}
        </div>
    {/each}
{/if}
