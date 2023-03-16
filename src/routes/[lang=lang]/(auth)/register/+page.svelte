<script lang="ts">
    import type { ActionData } from './$types';
    import LL from '$i18n/i18n-svelte';

    export let form: ActionData;
</script>

<h1>{$LL.register["register_title"]()}</h1>

<form action="?/register" method="POST">
    <div>
        <label for="email">{$LL.register["email_label"]()}</label>
        <input id="email" name="email" type="text" required />
    </div>
    
    <div>
        <label for="username">{$LL.register["username_label"]()}</label>
        <input id="username" name="username" type="text" required />
    </div>

    <div>
        <label for="password">{$LL.register["password_label"]()}</label>
        <input id="password" name="password" type="password" required />
    </div>

    {#if form?.userExist}
        <p class="error">{$LL.register['already']()}</p>
    {/if}

    <button type="submit">{$LL.register["register_button"]()}</button>
</form>

<style>
    .error {
        color: red;
    }
</style>
