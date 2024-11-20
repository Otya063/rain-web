import type { launcher_banner, launcher_info, users } from '@prisma/client/edge';
import { get, writable } from 'svelte/store';
import type { PaginatedUsers, PaginatedCharacter, PaginationMeta, PaginatedClans, PaginatedAlliances, Distribution } from '$types';

export const filterUserValue = writable<string>('');
export const filterUserParam = writable<string>('');
export const filterClanValue = writable<string>('');
export const filterClanParam = writable<string>('');
export const filterAllianceValue = writable<string>('');
export const filterAllianceParam = writable<string>('');
export const adminTabValue = writable<string>('');
export const userCtrlPanel = writable<{
    [key: number]: {
        icon: string;
        userData: PaginatedUsers;
        selectedChar: PaginatedCharacter;
        activeCategories: {
            [key in keyof Omit<users, 'id' | 'item_box' | 'last_character' | 'last_login' | 'web_login_key' | 'web_login_key_mobile'> | 'name' | 'bounty' | 'clan' | 'reupload_binary']: boolean;
        };
    };
}>({});
export const onSubmit = writable(false);
export const allInformation = writable<{ [key: string]: launcher_info[] }>();
export const allBanners = writable<launcher_banner[]>();
export const paginatedUsersData = writable<PaginatedUsers[]>();
export const paginationMetaData = writable<PaginationMeta>();
export const paginatedClansData = writable<PaginatedClans[] | null>();
export const paginationClansMetaData = writable<PaginationMeta>();
export const paginatedAlliancesData = writable<PaginatedAlliances[] | null>();
export const paginationAlliancesMetaData = writable<PaginationMeta>();
export const clanNameData = writable<string[]>();
//export const commonDistributionData = writable<Distribution[]>();
//export const individualDistributionData = writable<Distribution[]>();

/**
 * Rain APIを介してファイルをアップロードする
 * @param {string} origin オリジン（リクエストの発信元）
 * @param {File} file アップロードするファイル
 * @param {string} lang 言語コード
 * @returns {Promise<boolean>} アップロードが成功した場合はtrue、失敗した場合はfalse
 */
export const uploadFileViaApi = async (origin: string, file: File, lang: string): Promise<boolean> => {
    const getPresignedUrlResponse = await fetch('https://api.rain-server.com/banner', {
        method: 'POST',
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            lang,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
        },
    });

    const { presignedUrl } = await getPresignedUrlResponse.json();

    const uploadToR2Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    return uploadToR2Response.ok ? true : false;
};

/**
 * Rain APIを介してファイルを削除する
 * @param {string} origin オリジン（リクエストの発信元）
 * @param {string} fileName 削除するファイルの名前
 * @param {string} lang 言語コード
 * @returns {Promise<boolean>} 削除が成功した場合はtrue、失敗した場合はfalse
 */
export const deleteFileViaApi = async (origin: string, fileName: string, lang: string): Promise<boolean> => {
    const getPresignedUrlResponse = await fetch('https://api.rain-server.com/banner', {
        method: 'DELETE',
        body: JSON.stringify({
            lang,
            fileName,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
        },
    });

    const { presignedUrl } = await getPresignedUrlResponse.json();

    const deleteToR2Response = await fetch(presignedUrl, {
        method: 'DELETE',
    });

    return deleteToR2Response.ok ? true : false;
};

/**
 * ユーザー管理パネルを初期化する
 * @param {PaginatedUsers[]} paginatedUsers ページングされたユーザーリスト
 */
export const initUserCtrlPanel = (paginatedUsers: PaginatedUsers[]): void => {
    userCtrlPanel.set({});
    paginatedUsers.forEach((user) => {
        userCtrlPanel.set({
            ...get(userCtrlPanel),
            [user.id]: {
                icon: 'description',
                userData: user,
                selectedChar: user.characters[0],
                activeCategories: {
                    username: false,
                    password: false,
                    rights: false,
                    return_expires: false,
                    gacha_premium: false,
                    gacha_trial: false,
                    frontier_points: false,
                    psn_id: false,
                    wiiu_key: false,
                    name: false,
                    bounty: false,
                    clan: false,
                    reupload_binary: false,
                },
            },
        });
    });
};

/**
 * ユーザー管理パネルを更新する
 * @param {number} userId 更新対象のユーザーID
 * @param {number} charId 更新対象のキャラクターID
 * @param {string} [column] 更新するカラム（任意）
 * @param {any} [value] 設定する値（任意）
 */
export const updateUserCtrlPanel = (userId: number, charId: number, column?: string, value?: any): void => {
    userCtrlPanel.update((data) => {
        const userData = data[userId].userData;
        const selectedChar = userData.characters.find((character) => character.id === charId)!;

        if (!column && !value) {
            return {
                ...data,
                [userId]: {
                    ...data[userId],
                    selectedChar,
                    activeCategories: {
                        username: false,
                        password: false,
                        rights: false,
                        return_expires: false,
                        gacha_premium: false,
                        gacha_trial: false,
                        frontier_points: false,
                        psn_id: false,
                        wiiu_key: false,
                        name: false,
                        bounty: false,
                        clan: false,
                        reupload_binary: false,
                    },
                },
            };
        } else {
            if (column === 'name') {
                const bounty = data[userId].selectedChar.discord!.bounty - 50000;

                return {
                    ...data,
                    [userId]: {
                        ...data[userId],
                        selectedChar: {
                            ...data[userId].selectedChar,
                            name: String(value)!,
                            discord: {
                                ...data[userId].selectedChar.discord!,
                                bounty,
                            },
                        },
                        activeCategories: {
                            username: false,
                            password: false,
                            rights: false,
                            return_expires: false,
                            gacha_premium: false,
                            gacha_trial: false,
                            frontier_points: false,
                            psn_id: false,
                            wiiu_key: false,
                            name: false,
                            bounty: false,
                            clan: false,
                            reupload_binary: false,
                        },
                    },
                };
            } else if (column === 'bounty') {
                return {
                    ...data,
                    [userId]: {
                        ...data[userId],
                        selectedChar: {
                            ...data[userId].selectedChar,
                            discord: {
                                ...data[userId].selectedChar.discord!,
                                bounty: Number(value),
                            },
                        },
                        activeCategories: {
                            username: false,
                            password: false,
                            rights: false,
                            return_expires: false,
                            gacha_premium: false,
                            gacha_trial: false,
                            frontier_points: false,
                            psn_id: false,
                            wiiu_key: false,
                            name: false,
                            bounty: false,
                            clan: false,
                            reupload_binary: false,
                        },
                    },
                };
            } else if (column === 'clan') {
                return {
                    ...data,
                    [userId]: {
                        ...data[userId],
                        selectedChar: {
                            ...data[userId].selectedChar,
                            guild_characters: null,
                        },
                        activeCategories: {
                            username: false,
                            password: false,
                            rights: false,
                            return_expires: false,
                            gacha_premium: false,
                            gacha_trial: false,
                            frontier_points: false,
                            psn_id: false,
                            wiiu_key: false,
                            name: false,
                            bounty: false,
                            clan: false,
                            reupload_binary: false,
                        },
                    },
                };
            } else if (column === 'link') {
                return Object.keys(data).map((user_id) => {
                    if (data[Number(user_id)].selectedChar && data[Number(user_id)].selectedChar.discord && data[Number(user_id)].selectedChar?.discord?.discord_id === value.discord_id) {
                        data[Number(user_id)].selectedChar.discord = null;
                    }

                    if (Number(user_id) === userId && data[Number(user_id)].selectedChar.id === charId) {
                        data[Number(user_id)].selectedChar.discord = value;
                    }

                    return data;
                })[0];
            } else {
                return { ...data };
            }
        }
    });
};

/**
 * 管理コンソールのコンテンツを有効または無効にする
 * @param {boolean} enable コンテンツを有効にするか無効にするかのフラグ
 */
export const consoleContDisable = (enable: boolean): void => {
    enable ? document.getElementsByClassName('console_contents')[0].classList.add('disabled_elm') : document.getElementsByClassName('console_contents')[0].classList.remove('disabled_elm');
};

/**
 * 認証中のボタンの状態を切り替える
 * @param {boolean} enable ボタンを有効化するか無効化するかのフラグ
 * @param {HTMLElement | null} btnElm 対象のボタン要素
 * @param {HTMLCollectionOf<Element> | null} [labelElm] 対象のラベル要素
 * @param {NodeListOf<Element> | null} [inputElm] 対象の入力フィールド要素
 */
export const switchBtnInAuth = (enable: boolean, btnElm: HTMLElement | null, labelElm: HTMLCollectionOf<Element> | null = null, inputElm: NodeListOf<Element> | null = null): void => {
    if (enable) {
        btnElm?.classList.remove('loading_btn', 'disabled_elm');

        if (labelElm) {
            Array.from(labelElm).forEach((elm) => {
                elm.classList.remove('disabled_elm');
            });
        }

        inputElm?.forEach((elm) => {
            elm.classList.remove('disabled_elm');
        });
    } else {
        btnElm?.classList.add('loading_btn', 'disabled_elm');

        if (labelElm) {
            Array.from(labelElm).forEach((elm) => {
                elm.classList.add('disabled_elm');
            });
        }

        inputElm?.forEach((elm) => {
            elm.classList.add('disabled_elm');
        });
    }
};
