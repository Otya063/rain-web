<script lang="ts">
    import type { launcher_banner } from '@prisma/client/edge';
    import { applyAction, enhance } from '$app/forms';
    import { prepareModal, onSubmit, msgClosed, allBanners, conv2DArrayToObject, discordLinkConvertor } from '$lib/utils';
    import _ from 'lodash';
    import { slide } from 'svelte/transition';

    export let launcherBanner: launcher_banner[];
    export let createdBnr: launcher_banner;
    allBanners.set(launcherBanner);

    /* Below is the add mode script
    ====================================================*/
    export let bnrAddMode: boolean;
    export const addBnrMode = (enable: boolean): void => {
        if (enable) {
            // when editing
            bnrAddMode = true;
        } else {
            // when finished editing
            bnrAddMode = false;
        }
    };

    /* Below is the edit mode script
    ====================================================*/
    let editingId: number;
    let editMode = false;
    const catTypes: { [key in keyof Omit<launcher_banner, 'id' | 'bnr_name'>]: boolean } = {
        bnr_url: false,
        ja_img_src: false,
        en_img_src: false,
    };

    // switch edit contents
    const editModeSwitch = <T extends number, U extends keyof Omit<launcher_banner, 'id' | 'bnr_name'>>(id: T, type: U): void | false => {
        // check if another cat type is already open
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // if there is an open cat and a different category is cliked (try to open it) + not cancel btn
        if (activeCat && id !== 0) {
            // set everything to false (close) in a loop.
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<launcher_banner, 'id' | 'bnr_name'>;
                catTypes[key] = false;
            });

            // set the category clicked to true (open), adn set editting u_id
            catTypes[type] = true;
            editingId = id;

            return false;
        }

        // toggle true <-> false
        if (!editMode) {
            // open a cat
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // close a cat
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
    };
</script>

{#if bnrAddMode}
    <h2>
        <span class="material-icons">post_add</span>
        Add New Banner
    </h2>
    <div class="console_contents">
        <form
            class="info_add_form"
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
                        addBnrMode(false);
                    }
                };
            }}
        >
            <p class="console_contents_note">* Each banner must be named "BannerName_lang," and type of file is image/png.</p>
            <p class="console_contents_note">* Banner width is 515px and height is 120px.</p>

            <dl class="console_contents_list">
                <dt class="contents_term">Banner URL</dt>
                <dd class="contents_desc">
                    <input type="text" name="bnr_url" autocomplete="off" />
                    <p class="console_contents_note">* The URL of the site to be displayed when the banner is clicked.</p>
                </dd>

                <dt class="contents_term">Japanese Banner<br /><span class="contents_term_required">[Required]</span></dt>
                <dd class="contents_desc">
                    <input name="ja_file" type="file" accept=".png" />
                </dd>

                <dt class="contents_term">English Banner<br /><span class="contents_term_required">[Required]</span></dt>
                <dd class="contents_desc">
                    <input name="en_file" type="file" accept=".png" />
                </dd>

                <dt class="contents_term">Banner Name<br /><span class="contents_term_required">[Required]</span></dt>
                <dd class="contents_desc">
                    <input type="text" name="bnr_name" autocomplete="off" />
                    <p class="console_contents_note">* Banner names must be all lowercase, and if two words are combined, use underscores.</p>
                    <p class="console_contents_note">* Banner name is permanent.</p>
                </dd>
            </dl>

            <div class="group_btns">
                <button on:click={() => onSubmit.set(true)} class="blue_btn" type="submit">
                    <span class="btn_icon material-icons">check</span>
                    <span class="btn_text">Save</span>
                </button>

                <button class="red_btn" type="button" on:click={() => addBnrMode(false)}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            </div>
        </form>
    </div>
{:else}
    <h2>
        <span class="material-icons">newspaper</span>
        Launcher Banner
    </h2>
    <div class="console_contents">
        {#if $allBanners.length === 0}
            <p class="console_contents_note">No Banner Data</p>
        {:else}
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

                                // update bnr_url
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
                                on:click={() =>
                                    prepareModal('deleteBnr', {
                                        title: 'Delete the following banner data?',
                                        form_action: 'deleteBnrData',
                                        bnr_id: bnr.id,
                                        bnr_url: bnr.en_img_src,
                                        bnr_name: bnr.bnr_name,
                                    })}
                            >
                                <span class="btn_icon material-icons">delete</span>
                                <span class="btn_text">Delete</span>
                            </button>
                            Banner Data
                        </p>

                        <dt class="contents_term">Banner ID</dt>
                        <dd class="contents_desc">
                            {bnr.id}
                        </dd>

                        <dt class="contents_term">Ja Banner Source</dt>
                        <dd class="contents_desc">
                            {bnr.ja_img_src}

                            {#if editingId === bnr.id && catTypes['ja_img_src']}
                                <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'ja_img_src')}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => editModeSwitch(bnr.id, 'ja_img_src')}>
                                    <span class="btn_icon material-icons">upload_file</span>
                                    <span class="btn_text">Re-upload</span>
                                </button>
                            {/if}

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
                                            on:click={() => {
                                                onSubmit.set(true);
                                                editModeSwitch(0, 'ja_img_src');
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">En Banner Source</dt>
                        <dd class="contents_desc">
                            {bnr.en_img_src}

                            {#if editingId === bnr.id && catTypes['en_img_src']}
                                <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'en_img_src')}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => editModeSwitch(bnr.id, 'en_img_src')}>
                                    <span class="btn_icon material-icons">upload_file</span>
                                    <span class="btn_text">Re-upload</span>
                                </button>
                            {/if}

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
                                            on:click={() => {
                                                onSubmit.set(true);
                                                editModeSwitch(0, 'en_img_src');
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Banner URL</dt>
                        <dd class="contents_desc">
                            {bnr.bnr_url}

                            {#if editingId === bnr.id && catTypes['bnr_url']}
                                <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'bnr_url')}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" type="button" on:click={() => editModeSwitch(bnr.id, 'bnr_url')}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
                                </button>
                            {/if}

                            {#if editingId === bnr.id && catTypes['bnr_url']}
                                <div transition:slide class="edit_area_box">
                                    <input type="hidden" name="bnr_id" value={editingId} />
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">Change URL</p>
                                        <dl class="edit_area_box_parts text">
                                            <dt>Enter new URL</dt>
                                            <dd>
                                                <input type="text" name="bnr_url" value={bnr.bnr_url} autocomplete="off" />
                                            </dd>
                                        </dl>

                                        <button
                                            class="blue_btn"
                                            type="submit"
                                            on:click={() => {
                                                onSubmit.set(true);
                                                editModeSwitch(0, 'bnr_url');
                                            }}
                                        >
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </dd>

                        <dt class="contents_term">Banner Name</dt>
                        <dd class="contents_desc">
                            {bnr.bnr_name}
                        </dd>
                    </dl>
                </form>
            {/each}
        {/if}
    </div>
{/if}
