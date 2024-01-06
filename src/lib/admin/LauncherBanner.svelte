<script lang="ts">
    import _ from 'lodash';
    import { slide } from 'svelte/transition';
    import { prepareModal, editMode, clicked_submit, notice, err_details, uploadFileViaApi, deleteFileViaApi, validateImageDimensions } from '$ts/main';
    import type { launcher_banner } from '@prisma/client/edge';

    export let launcherBanner: launcher_banner[];

    /* Below is the add mode script
    ====================================================*/
    let add_mode: boolean = false;
    const addBnrMode = (cancel: boolean) => {
        // check if editing is in progress
        if ($editMode && !cancel) {
            notice.set(true);
            err_details.set('Edit mode remains active. Page transitions can be made after all editing is completed.');
            return false;
        }

        if (!cancel) {
            // when editing
            editMode.set(true);
            add_mode = true;
        } else {
            // when finished editing
            editMode.set(false);
            add_mode = false;
        }
    };

    /* Below is the edit mode script
    ====================================================*/
    let editId: number;
    interface CategoryType {
        [key: string]: boolean;
    }
    const catTypes: CategoryType = {
        bnr_url: false,
        ja_img_src: false,
        en_img_src: false,
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

    /* upload file function
    ====================================================*/
    const uploadAllBnrFiles = async () => {
        const jaFileInput = document.getElementById('file_input1') as HTMLInputElement;
        const enFileInput = document.getElementById('file_input2') as HTMLInputElement;
        const bnrNameInput = document.getElementById('file_input3') as HTMLInputElement;
        const jaFile: File | undefined = jaFileInput.files?.[0];
        const enFile: File | undefined = enFileInput.files?.[0];
        const jaFileName: string | undefined = jaFile?.name;
        const enFileName: string | undefined = enFile?.name;

        // file check
        if (!jaFile || !enFile || bnrNameInput.value === '') {
            return false;
        }

        // file format validation1
        if (jaFileName?.indexOf(bnrNameInput.value) === -1 || enFileName?.indexOf(bnrNameInput.value) === -1) {
            return false;
        }

        // file format validation2
        if (jaFileName?.indexOf('_ja') === -1 || enFileName?.indexOf('_en') === -1) {
            return false;
        }

        // file extension validation
        if (jaFileName?.split('.').pop() !== 'png' || enFileName?.split('.').pop() !== 'png') {
            return false;
        }

        // image dimensions validation
        const isJaValid = await validateImageDimensions(jaFile, 515, 120);
        const isEnValid = await validateImageDimensions(enFile, 515, 120);

        if (!isJaValid || !isEnValid) {
            alert('File Dimensions are incorrect.');
            return false;
        }

        uploadFileViaApi(jaFile, 'ja');
        uploadFileViaApi(enFile, 'en');
    };

    /* reupload file function
    ====================================================*/
    const reuploadBnrFile = async (elmId: string, lang: string, bnrName: string) => {
        const fileInput = document.getElementById(elmId) as HTMLInputElement;
        const file: File | undefined = fileInput.files?.[0];
        const fileName: string | undefined = file?.name;

        // file check
        if (!file) {
            return false;
        }

        // file format validation1
        if (fileName?.indexOf(bnrName) === -1) {
            return false;
        }

        // file format validation2
        switch (lang) {
            case 'ja':
                if (fileName?.indexOf('_ja') === -1) {
                    return false;
                }
                break;

            case 'en':
                if (fileName?.indexOf('_en') === -1) {
                    return false;
                }
                break;
        }

        // file extension validation
        if (fileName?.split('.').pop() !== 'png') {
            return false;
        }

        // image dimensions validation
        const isValid = await validateImageDimensions(file, 515, 120);

        if (!isValid) {
            alert('File Dimensions are incorrect.');
            return false;
        }

        deleteFileViaApi(lang, `${bnrName}_${lang}`);
        uploadFileViaApi(file, lang);
    };
</script>

{#if add_mode}
    <h2>
        <span class="material-icons">post_add</span>
        Add New Banner
    </h2>
    <div class="console_contents">
        <form class="info_add_form" action="?/createBnrData" method="POST">
            <p class="console_contents_note">* Each file must be named "BannerName_lang," and have a png extension.</p>
            <p class="console_contents_note">* The dimensions of each file must be 515px (width) and 120px (height).</p>

            <dl class="console_contents_list">
                <dt class="contents_term">Banner URL</dt>
                <dd class="contents_desc">
                    <input type="text" name="bnr_url" autocomplete="off" />
                    <p class="console_contents_note">* The link to the site that is displayed when users click on the banner. This setting is optional.</p>
                </dd>

                <dt class="contents_term">Japanese Banner</dt>
                <dd class="contents_desc">
                    <input id="file_input1" name="ja_file_name" type="file" />
                </dd>

                <dt class="contents_term">English Banner</dt>
                <dd class="contents_desc">
                    <input id="file_input2" name="en_file_name" type="file" />
                </dd>

                <dt class="contents_term">Banner Name</dt>
                <dd class="contents_desc">
                    <input id="file_input3" type="text" name="bnr_name" autocomplete="off" style="margin-bottom: 1%;" />
                    <p class="console_contents_note">* The banner names must be all lowercase, and if two words are combined, use underscores.</p>
                    <p class="console_contents_note">* The banner name can't be changed again after the files have been uploaded.</p>
                </dd>
            </dl>

            <div class="group_btns">
                <button on:click={() => (clicked_submit.set(true), uploadAllBnrFiles())} class="blue_btn" type="submit">
                    <span class="btn_icon material-icons">check</span>
                    <span class="btn_text">Save</span>
                </button>

                <button class="red_btn" type="button" on:click={() => addBnrMode(true)}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            </div>
        </form>
    </div>
{:else}
    <button class="green_btn" on:click={() => addBnrMode(false)}>
        <span class="btn_icon material-icons">add</span>
        <span class="btn_text">Add Banner</span>
    </button>
    <h2>
        <span class="material-icons">newspaper</span>
        Launcher Banner
    </h2>
    <div class="console_contents">
        {#if launcherBanner.length === 0}
            <p class="console_contents_note">No Banner Data Found</p>
        {:else}
            {#each _.sortBy(launcherBanner, 'id') || [] as bnr}
                <dl class="console_contents_list">
                    <p class="console_contents_list_title">
                        <button
                            class="red_btn"
                            on:click={() => prepareModal('deleteBnr', 'Are you sure you want to delete the following banner data?', 'deleteBnrData', bnr.id, bnr.en_img_src, bnr.bnr_name)}
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

                        {#if editId === bnr.id && catTypes['ja_img_src']}
                            <button class="red_btn" on:click={() => editModeSwitch(0, 'ja_img_src')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" on:click={() => editModeSwitch(bnr.id, 'ja_img_src')}>
                                <span class="btn_icon material-icons">upload_file</span>
                                <span class="btn_text">Reupload</span>
                            </button>
                        {/if}

                        {#if editId === bnr.id && catTypes['ja_img_src']}
                            <form transition:slide class="edit_area_form" action="?/updateBnrData" method="POST">
                                <input type="hidden" name="lang" value="ja" />
                                <input type="hidden" name="bnr_id" value={editId} />
                                <input type="hidden" name="bnr_name" value={bnr.bnr_name} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Reupload File</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>Select new file</dt>
                                        <dd>
                                            <p class="console_contents_note">Once reuploaded, the original file will be deleted.</p>
                                            <input id="file_input4" name="file_name" type="file" />
                                        </dd>
                                    </dl>

                                    <button on:click={() => (clicked_submit.set(true), reuploadBnrFile('file_input4', 'ja', bnr.bnr_name))} class="blue_btn" type="submit">
                                        <span class="btn_icon material-icons">check</span>
                                        <span class="btn_text">Save</span>
                                    </button>
                                </div>
                            </form>
                        {/if}
                    </dd>

                    <dt class="contents_term">En Banner Source</dt>
                    <dd class="contents_desc">
                        {bnr.en_img_src}

                        {#if editId === bnr.id && catTypes['en_img_src']}
                            <button class="red_btn" on:click={() => editModeSwitch(0, 'en_img_src')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" on:click={() => editModeSwitch(bnr.id, 'en_img_src')}>
                                <span class="btn_icon material-icons">upload_file</span>
                                <span class="btn_text">Reupload</span>
                            </button>
                        {/if}

                        {#if editId === bnr.id && catTypes['en_img_src']}
                            <form transition:slide class="edit_area_form" action="?/updateBnrData" method="POST">
                                <input type="hidden" name="lang" value="en" />
                                <input type="hidden" name="bnr_id" value={editId} />
                                <input type="hidden" name="bnr_name" value={bnr.bnr_name} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Reupload File</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>Select new file</dt>
                                        <dd>
                                            <p class="console_contents_note">Once reuploaded, the original file will be deleted.</p>
                                            <input id="file_input5" name="file_name" type="file" />
                                        </dd>
                                    </dl>

                                    <button on:click={() => (clicked_submit.set(true), reuploadBnrFile('file_input5', 'en', bnr.bnr_name))} class="blue_btn" type="submit">
                                        <span class="btn_icon material-icons">check</span>
                                        <span class="btn_text">Save</span>
                                    </button>
                                </div>
                            </form>
                        {/if}
                    </dd>

                    <dt class="contents_term">Banner URL</dt>
                    <dd class="contents_desc">
                        {bnr.bnr_url}

                        {#if editId === bnr.id && catTypes['bnr_url']}
                            <button class="red_btn" on:click={() => editModeSwitch(0, 'bnr_url')}>
                                <span class="btn_icon material-icons">close</span>
                                <span class="btn_text">Cancel</span>
                            </button>
                        {:else}
                            <button class="normal_btn" on:click={() => editModeSwitch(bnr.id, 'bnr_url')}>
                                <span class="btn_icon material-icons">mode_edit</span>
                                <span class="btn_text">Edit</span>
                            </button>
                        {/if}

                        {#if editId === bnr.id && catTypes['bnr_url']}
                            <form transition:slide class="edit_area_form" action="?/updateBnrData" method="POST">
                                <input type="hidden" name="bnr_id" value={editId} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change URL</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>Enter new URL</dt>
                                        <dd>
                                            <input type="text" name="bnr_url" value={bnr.bnr_url} autocomplete="off" />
                                        </dd>
                                    </dl>

                                    <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                        <span class="btn_icon material-icons">check</span>
                                        <span class="btn_text">Save</span>
                                    </button>
                                </div>
                            </form>
                        {/if}
                    </dd>

                    <dt class="contents_term">Banner Name</dt>
                    <dd class="contents_desc">
                        {bnr.bnr_name}
                    </dd>
                </dl>
            {/each}
        {/if}
    </div>
{/if}
