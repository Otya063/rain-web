<script lang="ts">
    import _ from 'lodash';
    import AdminMenu from '$lib/admin/AdminMenu.svelte';
    import AdminContents from '$lib/admin/AdminContents.svelte';
    import { tweened, type Tweened } from 'svelte/motion';
    import { slide, fade } from 'svelte/transition';
    import type { ActionData, PageData } from './$types';
    import {
        Timeout,
        success,
        error,
        err_details,
        errDetailMode,
        notice,
        clicked_submit,
        modalTitle,
        modalFormAction,
        cancelModal,
        suspendUser,
        suspendUid,
        suspendUsername,
        suspendCid,
        deleteInfo,
        infoId,
        infoTitle,
        infoURL,
        infoType,
        deleteBnr,
        bnrId,
        bnrURL,
        bnrName,
        deleteFileViaApi,
        linkDiscord,
        linkUId,
        linkUsername,
        linkCId,
        linkCName,
        linkDiscordId,
        deleteChar,
        deleteCharId,
        deleteCharName,
    } from '$ts/main';
    import '$scss/style_admin.scss';

    // data from the server
    export let data: PageData;
    export let form: ActionData;
    let status: keyof StatusMsg;
    let targetId: number;
    form?.status ? (status = form?.status) : (status = '');
    form?.targetId ? (targetId = form?.targetId) : (targetId = 0);
    form?.success ? success.set(form!.success) : success.set(false);
    form?.error ? (error.set(form!.error), err_details.set(form!.err_details)) : (error.set(false), err_details.set(''));
    clicked_submit.set(false);
    notice.set(false);

    // status messages
    interface StatusMsg {
        [key: string]: string;
    }
    const success_msg: StatusMsg = {
        system_updated: 'The system mode has been successfully updated.',
        maint_all_updated: 'All maintenance modes have been successfully updated.',
        info_created: 'The information data has been successfully created.',
        info_updated: `The information data (ID: ${targetId}) has been successfully updated.`,
        info_deleted: `The information data (ID: ${targetId}) has been successfully deleted.`,
        user_updated: 'The user data has been successfully updated.',
        suspend_user: 'The user account was successfully suspended. (Restorable)',
        permanently_suspend_user: 'The user account was successfully suspended. (Not Restorable)',
        unsuspend_user: 'The user account was successfully unsuspended.',
        bnr_created: 'The banner data was successfully created.',
        bnr_updated: `The banner data (ID: ${targetId}) has been successfully updated.`,
        bnr_deleted: `The banner data (ID: ${targetId}) has been successfully deleted.`,
        link_discord: 'The linking process has been successfully completed.',
        unlink_discord: 'The unlinking process has been successfully completed.',
        delete_character: 'The character data has been successfully deleted. (Restorable)',
        permanently_delete_character: 'The character data has been successfully deleted. (Not Restorable)',
        restore_character: 'The character data has been successfully restored.',
    };

    // message display timer bar
    let t: Timeout | null = null;
    let timerPause: boolean = false;
    let width: Tweened<number>;
    $: if ($success || $error || $notice) {
        width = tweened(100);
        width.set(-1, { duration: 5000 });
        t = new Timeout(() => {
            status = '';
            success.set(false);
            error.set(false);
            notice.set(false);
            err_details.set('');
            targetId;
            width.set(100, { duration: 0 });
        }, 5000);
    }

    // toggle error details message
    const toggleErrDetail = (e: Event) => {
        // prevent repeatedly pressing btn
        const target = e.target as HTMLButtonElement;
        target.disabled = true;
        setTimeout(() => {
            // after 2s, enable btn
            target.disabled = false;
        }, 2000);

        if (t) {
            if (timerPause) {
                errDetailMode.set(false);
                timerPause = false;
                t.run();
                width.set(0, { duration: t.getRestTime() });
            } else {
                errDetailMode.set(true);
                timerPause = true;
                t.pause();
                width.set($width, { duration: 0 });
            }
        }
    };

    // close the message display manually
    const closeMsgDisplay = () => {
        // the message is not closed when the error details are open.
        if ($errDetailMode) {
            return false;
        }

        status = '';
        success.set(false);
        error.set(false);
        notice.set(false);
        width.set(0, { duration: 0 });
        t!.stop();
    };

    /* delete file function
    ====================================================*/
    const deleteAllBnrFiles = () => {
        if ($bnrName === '') {
            return false;
        }

        deleteFileViaApi('ja', `${$bnrName}_ja`);
        deleteFileViaApi('en', `${$bnrName}_en`);
    };
</script>

<header>
    <div class="header_inner">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="header_platform" />
    </div>
</header>

{#if $clicked_submit}
    <div class="saving_overlay">
        <div class="loader" />
        <p class="saving_overlay_text">Saving...</p>
    </div>
{/if}

<div class="background_img" />

{#if $success || $error || $notice}
    <div transition:fade class="msg_display" class:success={$success} class:error={$error} class:notice={$notice}>
        <span class="left_side_bar" />
        {#if $success}
            <span class="material-icons-outlined">check_circle</span>
            <p style="padding-top: 0.3%;">{success_msg[status]}</p>
        {:else if $error}
            <span class="material-icons-outlined">warning</span>
            <p style="padding-top: 0.3%;">An error occurred.</p>
            <button on:click={(e) => toggleErrDetail(e)} class="error_view_btn">View Details</button>
        {:else if $notice}
            <span class="material-icons-outlined">notification_important</span>
            <p style="padding-top: 0.3%;">Unauthorized operation detected.</p>
            <button on:click={(e) => toggleErrDetail(e)} class="error_view_btn">View Details</button>
        {/if}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => closeMsgDisplay()} class="msg_close_btn" />
        <div class="timer_bar" style={`width: ${$width}%;`} />
    </div>
    {#if $errDetailMode}
        <div transition:slide class="msg_detail">
            Message Details:
            <p>{$err_details}</p>
        </div>
    {/if}
{/if}

{#if $suspendUser}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <div class="modal_header">
                    <h1>Suspend / Unsuspend User Account</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>User ID</p>
                            <span>{$suspendUid}</span>
                            <input type="hidden" name="user_id" value={$suspendUid} />
                        </li>

                        <li class="modal_list_item">
                            <p>Username</p>
                            <span>{$suspendUsername}</span>
                            <input type="hidden" name="user_username" value={$suspendUsername} />
                        </li>

                        <li class="modal_list_item">
                            <p>Owned Character Name</p>
                            <span>
                                {#each _.sortBy( _.filter(data.charactersWithoutBytes, (c_data) => c_data.user_id === $suspendUid), 'id' ) as character, i}
                                    <input type="hidden" name="character_id" value={character.id} />
                                    ({i + 1}){`${character.name}　`}
                                {/each}
                            </span>
                        </li>

                        {#if $modalFormAction === 'suspendUser'}
                            <li class="modal_list_item">
                                <p>Permanently Suspend</p>
                                <input type="checkbox" name="permanently_del" />
                            </li>
                        {/if}
                    </ul>

                    {#if $modalFormAction === 'suspendUser'}
                        <p class="modal_note">
                            * Once a user account is suspended, all characters owned by that account are considered as deleted. But its data isn't deleted from database and can be restored via
                            "Unsuspend" button.
                        </p>
                        <p class="modal_note">* If "Permanently Suspend" is checked, the user account, including all character data, will be completely deleted from the database and can't be restored.</p>
                    {/if}
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$modalFormAction}" type="submit" on:click={() => clicked_submit.set(true)}>
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" on:click={() => cancelModal()}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">No</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

{#if $deleteInfo}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="info_id" value={$infoId} />
                <div class="modal_header">
                    <h1>Delete Information Data</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Information Title</p>
                            <span>{$infoTitle}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Information URL</p>
                            <span>{$infoURL}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Information Type</p>
                            <span>{$infoType}</span>
                        </li>
                    </ul>
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$modalFormAction}" type="submit" on:click={() => clicked_submit.set(true)}>
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" on:click={() => cancelModal()}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">No</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

{#if $deleteBnr}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="bnr_id" value={$bnrId} />
                <input type="hidden" name="bnr_name" value={$bnrName} />
                <div class="modal_header">
                    <h1>Delete Banner Data</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Banner Preview</p>
                            <img src={$bnrURL} alt={String($bnrName)} />
                        </li>

                        <li class="modal_list_item">
                            <p>Banner Name</p>
                            <span>{$bnrName}</span>
                        </li>
                    </ul>
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$modalFormAction}" type="submit" on:click={() => (clicked_submit.set(true), deleteAllBnrFiles())}>
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" on:click={() => cancelModal()}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">No</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

{#if $linkDiscord}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="user_id" value={$linkUId} />
                <input type="hidden" name="char_id" value={$linkCId} />
                <div class="modal_header">
                    <h1>Link / Unlink Discord</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Username</p>
                            <span>{$linkUsername}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character ID</p>
                            <span>{$linkCId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character Name</p>
                            <span>{$linkCName}</span>
                        </li>

                        {#if $modalFormAction === 'linkDiscord'}
                            <li class="modal_list_item">
                                <p>Discord ID</p>
                                <input type="text" name="discord_id" />
                            </li>
                        {:else if $modalFormAction === 'unlinkDiscord'}
                            <input type="hidden" name="discord_id" value={$linkDiscordId} />
                            <li class="modal_list_item">
                                <p>Discord ID</p>
                                <span>{$linkDiscordId}</span>
                            </li>
                        {/if}
                    </ul>

                    {#if $modalFormAction === 'linkDiscord'}
                        <p class="modal_note">
                            * If Discord ID you entered is already linked to another character or account, the internal data (bounty coins, bounty progress, etc.) will be transferred and re-linked to
                            the target character or account.
                        </p>
                    {:else if $modalFormAction === 'unlinkDiscord'}
                        <p class="modal_note">
                            * Once the account is unlinked, all internal data (bounty coins, bounty progress, etc.) will be deleted completely. If you want to re-link another character or account,
                            please execute the process from the "Link" button.
                        </p>
                    {/if}
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$modalFormAction}" type="submit" on:click={() => clicked_submit.set(true)}>
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" on:click={() => cancelModal()}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">No</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

{#if $deleteChar}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="char_id" value={$deleteCharId} />
                <div class="modal_header">
                    <h1>Delete / Restore Character</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Character ID</p>
                            <span>{$deleteCharId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character Name</p>
                            <span>{$deleteCharName}</span>
                        </li>

                        {#if $modalFormAction === 'deleteCharacter'}
                            <li class="modal_list_item">
                                <p>Permanently Delete</p>
                                <input type="checkbox" name="permanently_del" />
                            </li>
                        {/if}
                    </ul>

                    {#if $modalFormAction === 'deleteCharacter'}
                        <p class="modal_note">* If "Permanently Delete" is checked, all character data will be completely deleted from the database and can't be restored.</p>
                    {/if}
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$modalFormAction}" type="submit" on:click={() => clicked_submit.set(true)}>
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" on:click={() => cancelModal()}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">No</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<main class="console_body">
    <nav class="console_menu">
        <AdminMenu />
    </nav>

    <article class="console_article">
        <h1>
            <span class="material-symbols-outlined">admin_panel_settings</span>
            Admin Console
        </h1>
        <AdminContents {data} />
    </article>
</main>

<footer>
    <div class="footer_note">
        <p>
            * Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. This project is based on the cooperation of numerous volunteers, and no revenue of any sort is generated
            through this project.
        </p>
    </div>
</footer>

<svelte:head>
    <title>Admin Console</title>
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <meta name="description" content="Console page for administrators only." />
    <!-- favicon -->
    <link rel="icon" href="/img/common/rain_favicon.ico?v=1" />
    <link rel="apple-touch-icon" sizes="180x180" href="/img/common/rain_apple_icon.png?v=1" />
    <link rel="manifest" href="/manifest.webmanifest?v=1" />
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <!-- font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="true" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <!-- icon -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons%7CMaterial+Icons+Outlined" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
</svelte:head>
