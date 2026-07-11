<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import type { LauncherSystem, LauncherSystemProps } from '$types';
    import { onSubmit, msgClosed, conv2DArrayToObject, timeOut, closeMsgDisplay } from '$utils/client';
    import RainServer from './RainServerComp/RainServer.svelte';

    let { systemData, isMobile, createdRainServer, rainServerAddMode = $bindable() }: LauncherSystemProps = $props();

    const { id: _id, ...rest } = systemData;
    let sys = $state<Omit<LauncherSystem, 'id'>>(rest);

    const updateSystemValue = (data: Record<string, any>): void => {
        const [[column, rawValue]] = Object.entries(data) as [[string, string]];
        sys[column as keyof typeof sys] = rawValue === 'true';
    };
</script>

{#snippet toggleField(key: keyof Omit<LauncherSystem, 'id'>)}
    <form
        action="?/updateSystemMode"
        method="POST"
        use:enhance={({ formData }) => {
            const data = conv2DArrayToObject([...formData.entries()]);
            onSubmit.set(true);
            $timeOut && closeMsgDisplay($timeOut);
            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);
                if (result.type === 'success') {
                    updateSystemValue(data);
                }
            };
        }}
    >
        <input type="hidden" name={key} value={sys[key] ? 'false' : 'true'} />
        <div class="contents_desc_item">
            <p class="contents_desc_item_text">{sys[key] ? 'Enable' : 'Disable'}</p>
            <div class="contents_desc_item_group_btn">
                <button type="submit" class="toggle_switch" class:on={sys[key]} aria-label={sys[key] ? 'Disable' : 'Enable'}><span></span></button>
            </div>
        </div>
    </form>
{/snippet}

<RainServer {isMobile} {createdRainServer} bind:rainServerAddMode />

<h2>
    <span class="material-symbols-outlined">update</span>
    Launcher Update & Download Modes
</h2>
<div class="console_contents">
    <dl class="console_contents_list">
        <dt class="contents_term">Update Mode</dt>
        <dd class="contents_desc">
            {@render toggleField('update')}
        </dd>

        <dt class="contents_term">Download Mode</dt>
        <dd class="contents_desc">
            {@render toggleField('download')}
        </dd>
    </dl>
</div>
