<script lang="ts">
    let editing: boolean = false;

    const setEditing = (isEditing: boolean) => {
        editing = isEditing;
    };
</script>

<form action="?/infoData" method="POST">
    {#if editing === false}
        <dl class="information">
            <dt>Test</dt>
            <dd>Test</dd>
        </dl>
        <button on:click={() => setEditing(true)}>Edit</button>
    {:else}
    <div>
        <label for="info">Information</label>
        <input id="info" type="text" name="info" />
    </div>
        <button type="submit">Save</button>
        <button on:click={() => setEditing(false)}>Cancel</button>
    {/if}
</form>
