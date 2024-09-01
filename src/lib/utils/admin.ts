import type { launcher_banner, launcher_info, users } from '@prisma/client/edge';
import type { PaginatedUsers, PaginatedCharacter, PaginationMeta, PaginatedClans, PaginatedAlliances } from '$lib/types';
import { get, writable } from 'svelte/store';

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
            [key in keyof Omit<users, 'id' | 'item_box' | 'last_character' | 'last_login' | 'web_login_key' | 'web_login_key_mobile'> | 'name' | 'bounty' | 'clan' | 'binary']: boolean;
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

/* Upload File
====================================================*/
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

/* Delete File
====================================================*/
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

/* Show Tooltip When Hovering Weapon Name
====================================================*/
export const showTipHoverWpn = (c_id: number): void | false => {
    const toolTipElm = document.getElementById(String(c_id));

    // for on:mouseleave
    if (toolTipElm?.classList.contains('wpn_name_hover')) {
        toolTipElm?.classList.remove('wpn_name_hover');

        return false;
    }

    toolTipElm?.classList.add('wpn_name_hover');
};

/* User Control
====================================================*/
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
                    binary: false,
                },
            },
        });
    });
};

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
                        binary: false,
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
                            binary: false,
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
                            binary: false,
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
                            binary: false,
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

export const setSelectedCharacter = (e: Event): void => {
    setTimeout(() => {
        const target = e.target as HTMLElement;
        const activeChar = target.getElementsByClassName('swiper-slide-active')[0].lastElementChild! as HTMLDivElement;
        const userId = Number(activeChar.dataset.userid);
        const charId = Number(activeChar.dataset.charid);

        // update object
        updateUserCtrlPanel(userId, charId);
    }, 100);
};

/**
 * Download user's binary (saved data)
 * @param {string} charId Target character ID
 */
export const downloadUserBinary = async (charId: string): Promise<void> => {
    const response = await fetch(`https://api.rain-server.com/download-binary/${charId}`);
    const data = await response.json()
    console.log(data);
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'files.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Release the object URL after download
    URL.revokeObjectURL(url);
};
