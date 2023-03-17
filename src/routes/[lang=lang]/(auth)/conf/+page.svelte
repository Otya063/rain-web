<script lang="ts">
    import { goto } from '$app/navigation';
    import LL, { locale } from '$i18n/i18n-svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    const { userPreReg } = data;

    async function sendEmail(event: Event) {
        const form = event.target as HTMLFormElement;
        const data = new FormData(form);

        const response = await fetch('/api/email', {
            method: 'POST',
            body: data,
        });

        response.ok && goto(`/${locale}/verify?reg=${userPreReg?.pre_reg_exp}`);
    }
</script>

<h1>登録内容の確認</h1>

<form on:submit|preventDefault={sendEmail}>
    <div>
        <label for="email">{$LL.register['email_label']()}</label>
        <input id="email" name="email" type="text" value={userPreReg?.email} readonly />
    </div>

    <div>
        <label for="username">{$LL.register['username_label']()}</label>
        <input id="username" name="username" type="text" value={userPreReg?.username} readonly />
    </div>

    <div>
        <label for="password">{$LL.register['password_label']()}</label>
        <input id="password" name="password" type="text" value="表示されません。" readonly />
    </div>

    <button>{$LL.register['register_button']()}</button>
</form>

<style lang="scss">
    input {
        user-select: none;
    }
</style>
