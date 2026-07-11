<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import type { CreateRainServerProps } from '$types';
    import { onSubmit, msgClosed, allRainServerData, timeOut, closeMsgDisplay, tooltip } from '$utils/client';

    let { createdRainServer, rainServerAddMode = $bindable(), isMobile }: CreateRainServerProps = $props();
</script>

<h2>
    <span class="material-symbols-outlined">post_add</span>
    Add New Server
</h2>

<div class="console_contents">
    <form
        action="?/createRainServer"
        method="POST"
        use:enhance={() => {
            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allRainServerData.update((servers) => [...servers, createdRainServer]);
                    rainServerAddMode = false;
                }
            };
        }}
    >
        <dl class="console_contents_list">
            <dt class="contents_term">
                Name
                {#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <input class="long" type="text" name="name" placeholder="Enter server name." autocomplete="off" />
                    </p>
                </div>
            </dd>

            <dt class="contents_term">
                Host
                {#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <input class="long" type="text" name="host" placeholder="Enter host." autocomplete="off" />
                    </p>
                </div>
            </dd>

            <dt class="contents_term">
                Port
                <span class="help_btn material-symbols-outlined" use:tooltip={'Leave blank to use the default (8080).'}>help</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <input type="number" name="port" placeholder="8080" autocomplete="off" />
                    </p>
                </div>
            </dd>

            <dt class="contents_term">
                Entrance Port
                <span class="help_btn material-symbols-outlined" use:tooltip={'Leave blank to use the default (53310).'}>help</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <input type="number" name="entrance_port" placeholder="53310" autocomplete="off" />
                    </p>
                </div>
            </dd>
        </dl>

        <div class="group_btns">
            <button class="red_btn" type="button" onclick={() => (rainServerAddMode = false)}>
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
