<script lang="ts">
    import type { launcher_banner } from '@prisma/client/edge';
    import _ from 'lodash';
    import { slide } from 'svelte/transition';
    import { applyAction, enhance } from '$app/forms';
    import { prepareModal, onSubmit, msgClosed, allBanners, conv2DArrayToObject, discordLinkConvertor, timeOut, closeMsgDisplay, tooltip } from '$utils/client';

    interface Props {
        launcherBanner: launcher_banner[];
        createdBnr: launcher_banner;
        bnrAddMode: boolean;
        isMobile: boolean;
    }
    let { launcherBanner, createdBnr, bnrAddMode = $bindable(), isMobile }: Props = $props();
    let editingId: number = $state(0); // 編集対象のバナーID
    let editMode = false;
    const catTypes: { [key in keyof Omit<launcher_banner, 'id' | 'bnr_name'>]: boolean } = $state({
        bnr_url: false,
        ja_img_src: false,
        en_img_src: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように
    allBanners.set(launcherBanner); // サーバーから取得したバナーデータをストアで管理

    /**
     * 編集モードを切り替える
     *
     * @template T 編集対象のIDの型（数値）
     * @template U 切り替え対象のカテゴリのタイプ。`launcher_banner` から `id` と `bnr_name` フィールドを除いたキー
     * @param {T} id 編集対象のID
     * @param {U} type 切り替えたいカテゴリのタイプ
     */
    const editModeSwitch = <T extends number, U extends keyof Omit<launcher_banner, 'id' | 'bnr_name'>>(id: T, type: U): void => {
        // 別のカテゴリがすでに開かれているかを確認
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // 既に開かれているカテゴリがあり、異なるカテゴリがクリックされた場合 + キャンセルボタンでない場合
        if (activeCat && id !== 0) {
            // 全てのカテゴリを閉じる
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<launcher_banner, 'id' | 'bnr_name'>;
                catTypes[key] = false;
            });

            // クリックされたカテゴリを開き、編集対象のIDを設定
            catTypes[type] = true;
            editingId = id;

            return;
        }

        // 編集モードをトグルする（true ⇔ false）
        if (!editMode) {
            // カテゴリを開く
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // カテゴリを閉じる
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
    };
</script>

{#if bnrAddMode}
    <h2>
        <span class="material-symbols-outlined">post_add</span>
        Add New Banner
    </h2>

    <div class="console_contents">
        <form
            action="?/createBnrData"
            method="POST"
            enctype="multipart/form-data"
            use:enhance={() => {
                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        $allBanners.push(createdBnr);
                        bnrAddMode = false;
                    }
                };
            }}
        >
            <p class="console_contents_note">* Each banner must be named "BannerName_lang," and type of file is image/png.</p>
            <p class="console_contents_note">* Banner width is 515px and height is 120px.</p>

            <dl class="console_contents_list">
                {#if isMobile}
                    <dt class="contents_term">Japanese Banner <span class="contents_term_required">[Required]</span></dt>
                {:else}
                    <dt class="contents_term">Japanese Banner<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}

                <dd class="contents_desc">
                    <input name="ja_file" type="file" accept=".png" />
                </dd>

                {#if isMobile}
                    <dt class="contents_term">English Banner <span class="contents_term_required">[Required]</span></dt>
                {:else}
                    <dt class="contents_term">English Banner<br /><span class="contents_term_required">[Required]</span></dt>
                {/if}

                <dd class="contents_desc">
                    <input name="en_file" type="file" accept=".png" />
                </dd>

                <dt class="contents_term">
                    Hyperlink
                    <span class="help_btn material-symbols-outlined" use:tooltip={'The site url to which the banner is redirected when clicked.'}>help</span>
                </dt>
                <dd class="contents_desc">
                    <input type="text" name="bnr_url" autocomplete="off" />
                </dd>

                {#if isMobile}
                    <dt class="contents_term">
                        Name
                        <span class="contents_term_required">[Required]</span>
                        <span
                            class="help_btn material-symbols-outlined"
                            use:tooltip={'Banner name must be in lowercase, and underscores must be used when combining two words.<br />Name is permanent.'}>help</span
                        >
                    </dt>
                {:else}
                    <dt class="contents_term">
                        Name
                        <span
                            class="help_btn material-symbols-outlined"
                            use:tooltip={'- Banner name must be in lowercase, and underscores must be used when combining two words.<br />- Name is permanent.'}>help</span
                        >
                        <br />
                        <span class="contents_term_required">[Required]</span>
                    </dt>
                {/if}

                <dd class="contents_desc">
                    <input type="text" name="bnr_name" autocomplete="off" />
                </dd>
            </dl>

            <div class="group_btns">
                <button class="red_btn" type="button" onclick={() => (bnrAddMode = false)}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Cancel</span>
                </button>

                <button
                    onclick={() => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);
                    }}
                    class="blue_btn"
                    type="submit"
                >
                    <span class="btn_icon material-symbols-outlined">check</span>
                    <span class="btn_text">Save</span>
                </button>
            </div>
        </form>
    </div>
{:else}
    <h2>
        <span class="material-symbols-outlined">newspaper</span>
        Launcher Banner
    </h2>
    <div class="console_contents">
        {#each _.sortBy($allBanners, 'id') as bnr}
            <form
                action="?/updateBnrData"
                method="POST"
                enctype="multipart/form-data"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const column = Object.keys(data)[1];
                    const id = Number(data.bnr_id);

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success' && column === 'bnr_url') {
                            const bnr_url = data.bnr_url;

                            // bnr_url更新
                            $allBanners = $allBanners.map((bnr) => {
                                if (bnr.id === id)
                                    return {
                                        ...bnr,
                                        bnr_url: !bnr_url ? null : bnr_url.indexOf('discord.com') ? discordLinkConvertor(bnr_url) : bnr_url,
                                    };

                                return bnr;
                            });
                        }
                    };
                }}
            >
                <dl class="console_contents_list">
                    <p class="console_contents_list_title">
                        <button
                            class="red_btn"
                            type="button"
                            onclick={() =>
                                prepareModal('deleteBnr', {
                                    title: 'Delete the following banner data?',
                                    formAction: 'deleteBnrData',
                                    bnrId: bnr.id,
                                    bnrUrl: bnr.en_img_src,
                                    bnrName: bnr.bnr_name,
                                })}
                        >
                            <span class="btn_icon material-symbols-outlined">delete</span>
                            <span class="btn_text">Delete</span>
                        </button>
                        Banner Data
                    </p>

                    <dt class="contents_term">ID</dt>
                    <dd class="contents_desc">{bnr.id}</dd>

                    <dt class="contents_term">Japanese Source</dt>
                    <dd class="contents_desc">
                        {bnr.ja_img_src}

                        {#if editingId === bnr.id && catTypes['ja_img_src']}
                            <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'ja_img_src')}>
                                <span class="btn_icon material-symbols-outlined">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" onclick={() => editModeSwitch(bnr.id, 'ja_img_src')}>
                                <span class="btn_icon material-symbols-outlined">upload_file</span>
                                <span class="btn_text">Re-upload</span>
                            </button>
                        {/if}

                        <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                        <div class="edit_area_box_wrapper">
                            {#if editingId === bnr.id && catTypes['ja_img_src']}
                                <div transition:slide class="edit_area_box">
                                    <input type="hidden" name="lang" value="ja" />
                                    <input type="hidden" name="bnr_id" value={editingId} />
                                    <input type="hidden" name="bnr_name" value={bnr.bnr_name} />
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">Re-upload File</p>
                                        <p class="console_contents_note">* Once re-uploaded, the original file will be deleted.</p>
                                        <dl class="edit_area_box_parts text">
                                            <dt>Select new file</dt>
                                            <dd>
                                                <input name="file" type="file" accept=".png" />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            onclick={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                editModeSwitch(0, 'ja_img_src');
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

                    <dt class="contents_term">English Source</dt>
                    <dd class="contents_desc">
                        {bnr.en_img_src}

                        {#if editingId === bnr.id && catTypes['en_img_src']}
                            <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'en_img_src')}>
                                <span class="btn_icon material-symbols-outlined">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" onclick={() => editModeSwitch(bnr.id, 'en_img_src')}>
                                <span class="btn_icon material-symbols-outlined">upload_file</span>
                                <span class="btn_text">Re-upload</span>
                            </button>
                        {/if}

                        <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                        <div class="edit_area_box_wrapper">
                            {#if editingId === bnr.id && catTypes['en_img_src']}
                                <div transition:slide class="edit_area_box">
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">Re-upload File</p>
                                        <p class="console_contents_note">* Once re-uploaded, the original file will be deleted.</p>
                                        <dl class="edit_area_box_parts text">
                                            <dt>Select new file</dt>
                                            <dd>
                                                <input type="hidden" name="bnr_id" value={editingId} />
                                                <input name="file" type="file" accept=".png" />
                                                <input type="hidden" name="lang" value="en" />
                                                <input type="hidden" name="bnr_name" value={bnr.bnr_name} />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            onclick={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                editModeSwitch(0, 'en_img_src');
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
                        {bnr.bnr_url || 'None'}

                        {#if editingId === bnr.id && catTypes['bnr_url']}
                            <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'bnr_url')}>
                                <span class="btn_icon material-symbols-outlined">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" type="button" onclick={() => editModeSwitch(bnr.id, 'bnr_url')}>
                                <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                        <div class="edit_area_box_wrapper">
                            {#if editingId === bnr.id && catTypes['bnr_url']}
                                <div transition:slide class="edit_area_box">
                                    <input type="hidden" name="bnr_id" value={editingId} />
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">Change Hyperlink</p>
                                        <dl class="edit_area_box_parts text">
                                            <dt>Enter new hyperlink</dt>
                                            <dd>
                                                <input type="text" name="bnr_url" value={bnr.bnr_url} autocomplete="off" />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            onclick={() => {
                                                onSubmit.set(true);
                                                $timeOut && closeMsgDisplay($timeOut);
                                                editModeSwitch(0, 'bnr_url');
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

                    <dt class="contents_term">Name</dt>
                    <dd class="contents_desc">
                        {bnr.bnr_name}
                    </dd>
                </dl>
            </form>
        {:else}
            <p class="console_contents_note">No Banner Data</p>
        {/each}
    </div>
{/if}
