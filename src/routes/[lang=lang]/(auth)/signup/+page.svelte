<script lang="ts">
    import type { ActionData } from './$types';
    export let form: ActionData;
</script>

<h1>Register</h1>

<form action="?/signup" method="POST">
    <div>
        <label for="username">Username</label>
        <input id="username" name="username" type="text" required />
    </div>

    <div>
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required />
    </div>

    {#if form?.message}
        <p class="error">{form?.message}</p>
    {/if}

    <button type="submit">Register</button>
</form>

<style>
    .error {
        color: red;
    }
</style>