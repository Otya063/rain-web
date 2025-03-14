<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { InfoTypeObj, type Information } from '$types';
    import { onSubmit, msgClosed, timeOut, closeMsgDisplay, tooltip, allInformationData } from '$utils/client';

    interface Props {
        createdInformation: Information;
        infoAddMode: boolean;
        isMobile: boolean;
    }
    let { createdInformation, infoAddMode = $bindable(false), isMobile }: Props = $props();
</script>

<h2>
    <span class="material-symbols-outlined">post_add</span>
    Add New Information
</h2>

<div class="console_contents">
    <form
        action="?/createInformation"
        method="POST"
        use:enhance={() => {
            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allInformationData.update((information) => {
                        return [...information, createdInformation];
                    }); // 新規作成後はDistributionListコンポーネントがマウントされるのでscript内が自動発火

                    // 追加フラグリセット
                    infoAddMode = false;
                }
            };
        }}
    >
        <dl class="console_contents_list">
            <dt class="contents_term">
                Title{#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <div class="contents_desc_item_text">
                        <input class="long" type="text" name="title" placeholder="Enter information title." autocomplete="off" />
                    </div>
                </div>
            </dd>

            <dt class="contents_term">
                Hyperlink
                <span class="help_btn material-symbols-outlined" use:tooltip={'If the domain is "discord.com", the url will be automatically converted to open the discord app.'}>help</span>
            </dt>
            <dd class="contents_desc">
                <div class="contents_desc_item">
                    <div class="contents_desc_item_text">
                        <input class="long" type="text" name="url" placeholder="Enter url." autocomplete="off" />
                    </div>
                </div>
            </dd>

            <dt class="contents_term">Info Created</dt>
            <dd class="contents_desc">Your local time is automatically converted to UTC and set in the database.</dd>

            <dt class="contents_term">
                Type{#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <label class="custom_select_box">
                            <select name="type">
                                <option value="" disabled style="display:none;" selected>Select information type.</option>
                                {#each Object.entries(InfoTypeObj) as [typeName, typeIndex]}
                                    <option value={typeIndex}>{typeName}</option>
                                {/each}
                            </select>
                        </label>
                    </p>
                </div>
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
