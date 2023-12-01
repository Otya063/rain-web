<script lang="ts">
    import _ from 'lodash';
    import { clicked_submit, modalTitle, modalFormAction, cancelModal, deleteInfo, infoId, infoTitle, infoURL, infoType } from '$ts/main';
</script>

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
