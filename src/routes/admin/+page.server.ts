import { convDateToUnix, convFormDataToObj, getCourseByFormDat, deleteFileViaApi } from '$ts/main';
import { getServerData } from '$ts/database';
import { redirect } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import { db } from '$ts/database';

export const load: PageServerLoad = async () => {
    const launcherSystem = await getServerData('getLauncherSystem');

    const important = await getServerData('getInformation', 1);

    const defectsAndTroubles = await getServerData('getInformation', 2);

    const managementAndService = await getServerData('getInformation', 3);

    const ingameEvents = await getServerData('getInformation', 4);

    const updatesAndMaintenance = await getServerData('getInformation', 5);

    const users = await getServerData('getAllUsers');
    const usersWithoutBytes = users.map(({ item_box, ...rest }) => rest);

    const characters = await getServerData('getAllCharacters');
    const charactersWithoutBytes = characters.map(
        ({
            savedata,
            decomyset,
            hunternavi,
            otomoairou,
            partner,
            platebox,
            platedata,
            platemyset,
            rengokudata,
            savemercenary,
            minidata,
            gacha_items,
            house_info,
            login_boost,
            skin_hist,
            scenariodata,
            savefavoritequest,
            mezfes,
            ...rest
        }) => rest
    );

    const bannedUsers = await getServerData('getAllBannedUsers');

    const launcherBanner = await getServerData('getBannerData');

    const linkedCharacters = await getServerData('getAllLinkedCharacters');

    return {
        launcherSystem,
        important,
        defectsAndTroubles,
        managementAndService,
        ingameEvents,
        updatesAndMaintenance,
        usersWithoutBytes,
        charactersWithoutBytes,
        bannedUsers,
        launcherBanner,
        linkedCharacters,
    };
};

const updateSystemMode: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const column: string = Object.keys(data_obj)[0];
    let value: boolean | string = Object.values(data_obj)[0];
    if (column === 'launcher_ver' && value.length === 1) {
        value = value + '.0';
    }

    try {
        // when updating the system mode one by one (success)
        await db.launcher_system.update({
            where: {
                id: 1,
            },
            data: {
                [column]: value,
            },
        });

        return { success: true, status: 'system_updated' };
    } catch (err) {
        // when updating the system mode one by one (error)
        if (column !== 'maint_all') {
            if (err instanceof Error) {
                return { error: true, err_details: err.message };
            } else if (typeof err === 'string') {
                return { error: true, err_details: err };
            } else {
                return { error: true, err_details: 'Unexpected Error.' };
            }
        }

        try {
            // when updating all maintenance modes (success)
            await db.launcher_system.update({
                where: {
                    id: 1,
                },
                data: {
                    RainJP: value,
                    RainEU: value,
                    RainUS: value,
                },
            });

            return { success: true, status: 'maint_all_updated' };
        } catch (err) {
            // when updating all maintenance modes (error)
            if (err instanceof Error) {
                return { error: true, err_details: err.message };
            } else if (typeof err === 'string') {
                return { error: true, err_details: err };
            } else {
                return { error: true, err_details: 'Unexpected Error.' };
            }
        }
    }
};

const createInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const title: string = data_obj['title'];
    const url: string = data_obj['url'];
    const type: string = data_obj['type'];
    const created_at: number = Math.floor(Date.now() / 1000);

    try {
        await db.launcher_info.create({
            data: {
                title,
                url,
                type,
                created_at,
            },
        });

        return { success: true, status: 'info_created' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const updateInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const id: number = Number(data_obj['info_id']);
    const column: string = Object.keys(data_obj)[1];
    let value: string | number = Object.values(data_obj)[1];
    column === 'created_at' && (value = convDateToUnix(value));

    try {
        await db.launcher_info.update({
            where: {
                id,
            },
            data: {
                [column]: value,
            },
        });

        return { success: true, status: 'info_updated', targetId: id };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const deleteInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('info_id'));

    try {
        await db.launcher_info.delete({
            where: {
                id,
            },
        });

        return { success: true, status: 'info_deleted', targetId: id };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const updateUserData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const id: number = Number(data_obj['user_id']);
    let adminCtrlMode: boolean = false;
    let ids: string[];
    let column: string;
    let value: string | number;

    if (Object.values(data_obj).some((value) => value === 'on')) {
        // course
        column = 'rights';
        value = getCourseByFormData(data_obj);

        // for admin control panel handling
        if (isNaN(id)) {
            switch (data_obj['target_u_radio']) {
                case 'all':
                    adminCtrlMode = true;
                    const users = await getServerData('getAllUsers');
                    ids = users.map((obj) => obj.id);
                    column = 'rights';
                    delete data_obj.target_u_radio;
                    value = getCourseByFormData(data_obj);

                    break;

                case 'specified':
                    adminCtrlMode = true;
                    const u_ids: string = data_obj['specified_u_text'];
                    ids = u_ids.split('+');
                    column = 'rights';
                    delete data_obj.target_u_radio;
                    delete data_obj.specified_u_text;
                    value = getCourseByFormData(data_obj);
                    break;
            }
        }
    } else {
        // the others
        column = Object.keys(data_obj)[1];
        value = Object.values(data_obj)[1];

        // switch between string or number depending on column
        switch (column) {
            case 'gacha_premium':
            case 'gacha_trial':
            case 'frontier_points':
                value = Number(value);
                value === 0 && (value = null);
                break;

            default:
                value = String(value);
        }
    }

    try {
        if (adminCtrlMode) {
            for (const id of ids) {
                await db.users.update({
                    where: {
                        id: Number(id),
                    },
                    data: {
                        [column]: value,
                    },
                });
            }
        } else {
            await db.users.update({
                where: {
                    id,
                },
                data: {
                    [column]: value,
                },
            });
        }

        return { success: true, status: 'user_updated' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const banUser: Action = async ({ request }) => {
    const data = await request.formData();
    const character_id = data.getAll('character_id');
    const user_id = Number(data.get('user_id'));
    const username = String(data.get('user_username'));
    const date = Math.floor(Date.now() / 1000);

    console.log(user_id, username, character_id);

    try {
        for (const char_id of character_id) {
            await db.characters.update({
                where: {
                    id: Number(char_id),
                },
                data: {
                    deleted: true,
                },
            });
        }

        await db.account_ban.create({
            data: {
                user_id,
                username,
                reason: 'test reason.',
                date,
            },
        });

        return { success: true, status: 'suspend_user' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const removeBanUser: Action = async ({ request }) => {
    const data = await request.formData();
    const character_id = data.getAll('character_id');
    const user_id = Number(data.get('user_id'));

    try {
        for (const char_id of character_id) {
            await db.characters.update({
                where: {
                    id: Number(char_id),
                },
                data: {
                    deleted: false,
                },
            });
        }

        await db.account_ban.delete({
            where: {
                user_id,
            },
        });

        return { success: true, status: 'unsuspend_user' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const createBnrData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const { ja_file_name, en_file_name, bnr_name, bnr_url } = data_obj;

    // file check
    if (ja_file_name === '' || en_file_name === '' || bnr_name === '') {
        return { error: true, err_details: 'Failed to upload the files. Please make sure that all files are selected and the banner name is entered.' };
    }

    // file format validation
    if (ja_file_name.indexOf(bnr_name) === -1 || en_file_name.indexOf(bnr_name)) {
        return { error: true, err_details: "Failed to upload the files. The banner name in the file name doesn't match the banner name entered." };
    }

    // file extension validation
    if (ja_file_name.split('.').pop() !== 'png' || en_file_name.split('.').pop() !== 'png') {
        return { error: true, err_details: 'Failed to upload the files. File extension is incorrect.' };
    }

    try {
        await db.launcher_banner.create({
            data: {
                bnr_name,
                bnr_url,
                ja_img_src: `https://${import.meta.env.VITE_R2_BNR_UNIQUE_URL}/bnr/bnr_ja/${ja_file_name}`,
                en_img_src: `https://${import.meta.env.VITE_R2_BNR_UNIQUE_URL}/bnr/bnr_en/${en_file_name}`,
            },
        });

        return { success: true, status: 'bnr_created' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const updateBnrData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const { bnr_id, file_name, bnr_name, bnr_url } = data_obj;

    try {
        if (!data_obj.hasOwnProperty('bnr_url')) {
            // file check
            if (file_name === '') {
                return { error: true, err_details: 'Failed to reupload the files. Please make sure that the file is selected.' };
            }

            // file format validation
            if (file_name.indexOf(bnr_name) === -1) {
                return { error: true, err_details: "Failed to reupload the files. The banner name in the file name doesn't match the banner name already set." };
            }

            // file extension validation
            if (file_name.split('.').pop() !== 'png') {
                return { error: true, err_details: 'Failed to upload the files. File extension is incorrect.' };
            }

            return { success: true, status: 'bnr_updated', targetId: bnr_id };
        } else {
            await db.launcher_banner.update({
                where: {
                    id: Number(bnr_id),
                },
                data: {
                    bnr_url,
                },
            });

            return { success: true, status: 'bnr_updated', targetId: bnr_id };
        }
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const deleteBnrData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const { bnr_id, bnr_name } = data_obj;

    try {
        await db.launcher_banner.delete({
            where: {
                id: Number(bnr_id),
            },
        });

        return { success: true, status: 'bnr_deleted', targetId: bnr_id };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const linkDiscord: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const { user_id, char_id, discord_id } = data_obj;

    try {
        const discordExist = await db.discord.findFirst({
            where: {
                discord_id: String(discord_id),
            },
        });

        const discordRegisterExist = await db.discord_register.findFirst({
            where: {
                discord_id: String(discord_id),
            },
        });

        if (discordExist) {
            const {
                id,
                is_male,
                bounty,
                road_champion,
                rain_demolizer,
                bounty_champion,
                bounty_master,
                bounty_expert,
                gacha,
                pity,
                boostcd,
                newbie,
                latest_bounty,
                latest_bounty_time,
                transfercd,
                title,
                gold,
                silver,
                bronze,
            } = discordExist;

            await db.discord.delete({
                where: {
                    id,
                },
            });

            await db.discord.create({
                data: {
                    char_id: Number(char_id),
                    discord_id: String(discord_id),
                    is_male,
                    bounty,
                    road_champion,
                    rain_demolizer,
                    bounty_champion,
                    bounty_master,
                    bounty_expert,
                    gacha,
                    pity,
                    boostcd,
                    newbie,
                    latest_bounty,
                    latest_bounty_time,
                    transfercd,
                    title,
                    gold,
                    silver,
                    bronze,
                },
            });
        } else {
            await db.discord.create({
                data: {
                    char_id: Number(char_id),
                    discord_id: String(discord_id),
                },
            });
        }

        if (discordRegisterExist) {
            const { id } = discordRegisterExist;
            await db.discord_register.delete({
                where: {
                    id,
                },
            });
        }

        await db.discord_register.create({
            data: {
                user_id: Number(user_id),
                discord_id: String(discord_id),
            },
        });

        return { success: true, status: 'link_discord' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const unlinkDiscord: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const { user_id, char_id, discord_id } = data_obj;
    console.log(data_obj);

    try {
        const discordExist = await db.discord.findFirst({
            where: {
                discord_id: String(discord_id),
            },
        });

        const discordRegisterExist = await db.discord_register.findFirst({
            where: {
                discord_id: String(discord_id),
            },
        });

        const id1 = discordExist['id'];
        const id2 = discordRegisterExist['id'];

        await db.discord.delete({
            where: {
                id: id1,
            },
        });

        await db.discord_register.delete({
            where: {
                id: id2,
            },
        });

        return { success: true, status: 'unlink_discord' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

export const actions: Actions = {
    updateSystemMode,
    createInfoData,
    updateInfoData,
    deleteInfoData,
    updateUserData,
    banUser,
    removeBanUser,
    createBnrData,
    updateBnrData,
    deleteBnrData,
    linkDiscord,
    unlinkDiscord,
};
