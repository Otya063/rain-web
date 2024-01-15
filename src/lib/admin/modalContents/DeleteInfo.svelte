<script lang="ts">
    import { clicked_submit, cancelModal, deleteInfo, deleteInfoData } from '$ts/main';
    import _ from 'lodash';
</script>

{#if $deleteInfo}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="info_id" value={$deleteInfoData.info_id} />
                <div class="modal_header">
                    <h1>Delete Information Data</h1>
                </div>
                <div class="modal_body">
                    <p>{$deleteInfoData.title}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Information Title</p>
                            <span>{$deleteInfoData.info_title}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Information URL</p>
                            <span>{$deleteInfoData.info_url}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Information Type</p>
                            <span>{$deleteInfoData.info_type}</span>
                        </li>
                    </ul>
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$deleteInfoData.form_action}" type="submit" on:click={() => clicked_submit.set(true)}>
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
