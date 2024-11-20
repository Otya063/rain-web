<script lang="ts">
    import type { launcher_system } from '@prisma/client/edge';
    import { error } from '@sveltejs/kit';
    import { slide } from 'svelte/transition';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, msgClosed, conv2DArrayToObject, timeOut, closeMsgDisplay } from '$utils/client';

    interface Props {
        systemData: launcher_system;
    }
    let { systemData }: Props = $props();
    let { RainJP, RainUS, RainEU, update, debug, client_data, rain_admins }: launcher_system = $state(systemData);
    const catTypes: { [key in keyof Omit<launcher_system, 'id'>]: boolean } = $state({
        RainJP: false,
        RainUS: false,
        RainEU: false,
        update: false,
        debug: false,
        client_data: false,
        rain_admins: false,
    }); // 編集中モードカテゴリー、stateで各項目間を自動で折りたためるように

    /**
     * 編集モードを切り替える
     *
     * @template T 切り替え対象のカテゴリのタイプ、`launcher_system`から`id`フィールドを除いたキー
     * @param {T} type 切り替えたいカテゴリのタイプ
     */
    const editModeSwitch = <T extends keyof Omit<launcher_system, 'id'>>(type: T): void => {
        // 別のカテゴリがすでに開いているかどうかを確認
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // 開いているカテゴリがクリックされた場合（閉じる処理）、そのカテゴリを閉じる
        if (catTypes[type]) {
            catTypes[type] = false;

            return;
        }

        // すでに開いているカテゴリがあり、異なるカテゴリがクリックされた場合（開こうとする場合）
        if (activeCat) {
            // 全てのカテゴリを閉じる（falseに設定）
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<launcher_system, 'id'>;
                catTypes[key] = false;
            });

            // クリックされたカテゴリを開く（trueに設定）
            catTypes[type] = true;

            return;
        }

        // 開閉をトグルする（true ⇔ false）
        catTypes[type] = !catTypes[type];
    };

    /**
     * システムの値を更新する
     *
     * @param {Record<string, any>} data 更新するデータのオブジェクト、キーは更新対象のカラム名
     * @throws {Error} 無効なカラムが指定された場合にエラーをスロー
     */
    const updateSystemValue = (data: Record<string, any>): void => {
        const column = Object.keys(data)[0] as keyof Omit<launcher_system, 'id'> | 'client_data_0' | 'client_data_1' | 'maint_all';
        const value = Object.values(data)[0] as string;

        switch (column) {
            case 'RainJP': {
                RainJP = value === 'true';

                break;
            }

            case 'RainUS': {
                RainUS = value === 'true';

                break;
            }

            case 'RainEU': {
                RainEU = value === 'true';

                break;
            }

            case 'update': {
                update = value === 'true';

                break;
            }

            case 'debug': {
                debug = value === 'true';

                break;
            }

            case 'client_data_0': {
                client_data = [value.length === 1 ? `${value}.0` : value, Object.values(data)[1]] as string[];

                break;
            }

            case 'maint_all': {
                RainJP = value === 'true';
                RainUS = value === 'true';
                RainEU = value === 'true';

                break;
            }

            case 'rain_admins': {
                rain_admins = value.split(',');
                break;
            }

            default: {
                error(400, { message: '', message1: '', message2: [`Invalid column: ${column}.`], message3: undefined });
            }
        }
    };

    /**
     * 入力要素の変更に応じてUIを更新する
     *
     * @param {Event} e 入力イベント。
     * @param {'jp' | 'us' | 'eu' | 'all' | 'update' | 'debug' | 'force'} [type] 更新する要素のタイプ、無効なタイプが指定されるとエラーをスロー
     * @throws {Error} 無効なタイプが指定された場合にエラーをスロー
     */
    const onChangeInputElm = (e: Event, type?: 'jp' | 'us' | 'eu' | 'all' | 'update' | 'debug' | 'force'): void => {
        switch (type) {
            case 'jp':
            case 'us':
            case 'eu':
            case 'all':
            case 'update':
            case 'debug':
            case 'force': {
                document.getElementsByClassName(type)[0].textContent = 'radio_button_unchecked';
                document.getElementsByClassName(type)[1].textContent = 'radio_button_unchecked';
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = 'radio_button_checked';

                break;
            }

            default: {
                error(400, { message: '', message1: '', message2: [`Invalid type: ${type}.`], message3: undefined });
            }
        }
    };
</script>

<h2>
    <span class="material-symbols-outlined">engineering</span>
    Servers Maintenance Settings
</h2>

<div class="console_contents">
    <form
        action="?/updateSystemMode"
        method="POST"
        use:enhance={({ formData }) => {
            const data = conv2DArrayToObject([...formData.entries()]);

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
        <dl class="console_contents_list">
            <dt class="contents_term">Rain (JP)</dt>
            <dd class="contents_desc">
                {RainJP ? 'Enable' : 'Disable'}

                {#if catTypes['RainJP']}
                    <button class="red_btn" type="button" onclick={() => editModeSwitch('RainJP')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" onclick={() => editModeSwitch('RainJP')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if catTypes['RainJP']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area select">
                                <p class="edit_area_title">Change Setting</p>
                                <ul class="edit_area_box_parts radio">
                                    <li>
                                        <label for="rain_jp_enable">
                                            <span class="material-symbols-outlined jp">{RainJP ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="RainJP" id="rain_jp_enable" value="true" checked={RainJP} onchange={(e) => onChangeInputElm(e, 'jp')} />
                                            Enable
                                        </label>
                                    </li>
                                    <li>
                                        <label for="rain_jp_disable">
                                            <span class="material-symbols-outlined jp">{!RainJP ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="RainJP" id="rain_jp_disable" value="false" checked={!RainJP} onchange={(e) => onChangeInputElm(e, 'jp')} />
                                            Disable
                                        </label>
                                    </li>
                                </ul>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        editModeSwitch('RainJP');
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>

            <dt class="contents_term">Rain (US)</dt>
            <dd class="contents_desc">
                {RainUS ? 'Enable' : 'Disable'}

                {#if catTypes['RainUS']}
                    <button class="red_btn" type="button" onclick={() => editModeSwitch('RainUS')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" onclick={() => editModeSwitch('RainUS')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if catTypes['RainUS']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area select">
                                <p class="edit_area_title">Change Setting</p>
                                <ul class="edit_area_box_parts radio">
                                    <li>
                                        <label for="rain_us_enable">
                                            <span class="material-symbols-outlined us">{RainUS ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="RainUS" id="rain_us_enable" value="true" checked={RainUS} onchange={(e) => onChangeInputElm(e, 'us')} />
                                            Enable
                                        </label>
                                    </li>
                                    <li>
                                        <label for="rain_us_disable">
                                            <span class="material-symbols-outlined us">{!RainUS ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="RainUS" id="rain_us_disable" value="false" checked={!RainUS} onchange={(e) => onChangeInputElm(e, 'us')} />
                                            Disable
                                        </label>
                                    </li>
                                </ul>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        editModeSwitch('RainUS');
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>

            <dt class="contents_term">Rain (EU)</dt>
            <dd class="contents_desc">
                {RainEU ? 'Enable' : 'Disable'}

                {#if catTypes['RainEU']}
                    <button class="red_btn" type="button" onclick={() => editModeSwitch('RainEU')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" onclick={() => editModeSwitch('RainEU')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if catTypes['RainEU']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area select">
                                <p class="edit_area_title">Change Setting</p>
                                <ul class="edit_area_box_parts radio">
                                    <li>
                                        <label for="rain_eu_enable">
                                            <span class="material-symbols-outlined eu">{RainEU ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="RainEU" id="rain_eu_enable" value="true" checked={RainEU} onchange={(e) => onChangeInputElm(e, 'eu')} />
                                            Enable
                                        </label>
                                    </li>
                                    <li>
                                        <label for="rain_eu_disable">
                                            <span class="material-symbols-outlined eu">{!RainEU ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="RainEU" id="rain_eu_disable" value="false" checked={!RainEU} onchange={(e) => onChangeInputElm(e, 'eu')} />
                                            Disable
                                        </label>
                                    </li>
                                </ul>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        editModeSwitch('RainEU');
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>
        </dl>

        <!-- 「div.edit_area_box_wrapper」は必要ないが、スタイルの関係上ワラップしておく -->
        <div class="edit_area_box_wrapper">
            <div class="edit_area_box">
                <div class="edit_area select">
                    <p class="edit_area_title">Change All Settings</p>
                    <ul class="edit_area_box_parts radio" class:disabled_elm={catTypes.RainJP || catTypes.RainEU || catTypes.RainUS}>
                        <li>
                            <label style="width: 110px;" for="enable_all">
                                <span class="material-symbols-outlined all">radio_button_unchecked</span>
                                <input type="radio" name="maint_all" id="enable_all" value="true" onchange={(e) => onChangeInputElm(e, 'all')} />
                                Enable All
                            </label>
                        </li>
                        <li>
                            <label style="width: 110px;" for="disable_all">
                                <span class="material-symbols-outlined all">radio_button_checked</span>
                                <input type="radio" name="maint_all" id="disable_all" value="false" checked onchange={(e) => onChangeInputElm(e, 'all')} />
                                Disable All
                            </label>
                        </li>
                    </ul>

                    <button
                        class="blue_btn"
                        class:disabled_elm={catTypes.RainJP || catTypes.RainEU || catTypes.RainUS}
                        type="submit"
                        formaction="?/updateAllMaintData"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">Save</span>
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>

<h2>
    <span class="material-symbols-outlined">update</span>
    Launcher Update & Other Settings
</h2>
<div class="console_contents">
    <form
        action="?/updateSystemMode"
        method="POST"
        use:enhance={({ formData }) => {
            const data = conv2DArrayToObject([...formData.entries()]);

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
        <dl class="console_contents_list">
            <dt class="contents_term">Update Mode</dt>
            <dd class="contents_desc">
                {update ? 'Enable' : 'Disable'}

                {#if catTypes['update']}
                    <button class="red_btn" type="button" onclick={() => editModeSwitch('update')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" onclick={() => editModeSwitch('update')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if catTypes['update']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area select">
                                <p class="edit_area_title">Change Setting</p>
                                <ul class="edit_area_box_parts radio">
                                    <li>
                                        <label for="update_enable">
                                            <span class="material-symbols-outlined update">{update ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="update" id="update_enable" value="true" checked={update} onchange={(e) => onChangeInputElm(e, 'update')} />
                                            Enable
                                        </label>
                                    </li>
                                    <li>
                                        <label for="update_disable">
                                            <span class="material-symbols-outlined update">{!update ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="update" id="update_disable" value="false" checked={!update} onchange={(e) => onChangeInputElm(e, 'update')} />
                                            Disable
                                        </label>
                                    </li>
                                </ul>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        editModeSwitch('update');
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>

            <dt class="contents_term">Debug Mode</dt>
            <dd class="contents_desc">
                {debug ? 'Enable' : 'Disable'}

                {#if catTypes['debug']}
                    <button class="red_btn" type="button" onclick={() => editModeSwitch('debug')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" onclick={() => editModeSwitch('debug')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if catTypes['debug']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area select">
                                <p class="edit_area_title">Change Setting</p>
                                <ul class="edit_area_box_parts radio">
                                    <li>
                                        <label for="debug_enable">
                                            <span class="material-symbols-outlined debug">{debug ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="debug" id="debug_enable" value="true" checked={debug} onchange={(e) => onChangeInputElm(e, 'debug')} />
                                            Enable
                                        </label>
                                    </li>
                                    <li>
                                        <label for="debug_disable">
                                            <span class="material-symbols-outlined debug">{!debug ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input type="radio" name="debug" id="debug_disable" value="false" checked={!debug} onchange={(e) => onChangeInputElm(e, 'debug')} />
                                            Disable
                                        </label>
                                    </li>
                                </ul>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        editModeSwitch('debug');
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>

            <dt class="contents_term">Client Data</dt>
            <dd class="contents_desc">
                {client_data[0]} [ version of client data ]
                <br />
                {client_data[1]} [ whether to force an update ]

                {#if catTypes['client_data']}
                    <button class="red_btn" type="button" onclick={() => editModeSwitch('client_data')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" onclick={() => editModeSwitch('client_data')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if catTypes['client_data']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Version of Client and Update Setting</p>
                                <p class="console_contents_note">* Empty isn't allowed.</p>
                                <dl class="edit_area_box_parts text">
                                    <dt>Enter the version</dt>
                                    <dd>
                                        <input type="number" name="client_data_0" step="0.1" inputmode="decimal" pattern="\d*" value={client_data[0]} placeholder="Enter the version" />
                                    </dd>
                                </dl>
                            </div>

                            <div class="edit_area select">
                                <p class="edit_area_title">Select Whether to Force</p>
                                <ul class="edit_area_box_parts radio">
                                    <li>
                                        <label for="update_force">
                                            <span class="material-symbols-outlined force">{client_data[1] === 'force' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input
                                                type="radio"
                                                name="client_data_1"
                                                id="update_force"
                                                value="force"
                                                checked={client_data[1] === 'force'}
                                                onchange={(e) => onChangeInputElm(e, 'force')}
                                            />
                                            Force
                                        </label>
                                    </li>
                                    <li>
                                        <label for="update_not_force">
                                            <span class="material-symbols-outlined force">{client_data[1] === 'not_force' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <input
                                                type="radio"
                                                name="client_data_1"
                                                id="update_not_force"
                                                value="not_force"
                                                checked={client_data[1] === 'not_force'}
                                                onchange={(e) => onChangeInputElm(e, 'force')}
                                            />
                                            Not Force
                                        </label>
                                    </li>
                                </ul>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        editModeSwitch('client_data');
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>

            <dt class="contents_term">Rain Admins</dt>
            <dd class="contents_desc">
                {rain_admins.join(' / ')}

                {#if catTypes['rain_admins']}
                    <button class="red_btn" type="button" onclick={() => editModeSwitch('rain_admins')}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" onclick={() => editModeSwitch('rain_admins')}>
                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                <!-- svelte5のバグ？でslideアニメーションがおかしいので、応急措置として「div.edit_area_box_wrapper」でワラップする -->
                <div class="edit_area_box_wrapper">
                    {#if catTypes['rain_admins']}
                        <div transition:slide class="edit_area_box">
                            <div class="edit_area enter">
                                <p class="edit_area_title">Change the Admins' Username</p>
                                <p class="console_contents_note">* Empty isn't allowed.</p>
                                <dl class="edit_area_box_parts text">
                                    <dt>Enter the Username</dt>
                                    <dd>
                                        <input type="text" name="rain_admins" value={rain_admins} autocomplete="off" />
                                    </dd>
                                </dl>

                                <button
                                    class="blue_btn"
                                    type="submit"
                                    onclick={() => {
                                        onSubmit.set(true);
                                        $timeOut && closeMsgDisplay($timeOut);
                                        editModeSwitch('rain_admins');
                                    }}
                                >
                                    <span class="btn_icon material-symbols-outlined">check</span>
                                    <span class="btn_text">Save</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </dd>
        </dl>
    </form>
</div>
