import { convFormDataToObj, getCourseByFormData, deleteFileViaApi, discordLinkConvertor } from '$ts/main';
import { db, getServerData } from '$ts/database';
import { error } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import { R2_BNR_UNIQUE_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, locals: { locale, authUser }, cookies }) => {
    const launcherSystem = await getServerData('getLauncherSystem');

    // when prod env, check if the user is an admin
    if (!url.origin.includes('localhost')) {
        const isAdmin: boolean = launcherSystem['rain_admins'].includes(authUser.username);

        if (!isAdmin) {
            throw error(403);
        }
    }

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

    const bannedUsers = await getServerData('getAllSuspendedUsers');

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
    const dataObj = convFormDataToObj(data);
    let column: string = Object.keys(dataObj)[0];
    let value: boolean | string = Object.values(dataObj)[0];
    if (column === 'client_data_0' && Object.keys(dataObj)[1] === 'client_data_1') {
        value = [value.length === 1 ? value + '.0' : value, Object.values(dataObj)[1]];
        column = 'client_data';
    }

    try {
        // when updating something that isn't main_all (success)
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
        // when updating something that isn't main_all (error)
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
    const dataObj = convFormDataToObj(data);
    const { title, type } = dataObj;
    let { url } = dataObj;

    if (url.indexOf('discord.com')) {
        url = discordLinkConvertor(url);
    }

    try {
        await db.launcher_info.create({
            data: {
                title: String(title),
                url: String(url),
                type: String(type),
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
    const dataObj = convFormDataToObj(data);
    const { info_id } = dataObj;
    const column: string = Object.keys(dataObj)[1];
    let value: string | number = Object.values(dataObj)[1];

    if (column === 'url' && value.indexOf('discord.com')) {
        value = discordLinkConvertor(value);
    }

    try {
        await db.launcher_info.update({
            where: {
                id: Number(info_id),
            },
            data: {
                [column]: value,
            },
        });

        return { success: true, status: 'info_updated', targetNumber: info_id };
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
    const dataObj = convFormDataToObj(data);
    const { info_id } = dataObj;

    try {
        await db.launcher_info.delete({
            where: {
                id: Number(info_id),
            },
        });

        return { success: true, status: 'info_deleted', targetNumber: info_id };
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
    const dataObj = convFormDataToObj(data);
    const { user_id, target_u_radio } = dataObj;
    let adminCtrlMode: boolean = false;
    let ids: number[];
    let column: string;
    let value: string | number | Date;

    // for admin control panel handling
    if (user_id === undefined) {
        // course
        column = 'rights';
        value = getCourseByFormData(dataObj);

        switch (target_u_radio) {
            case 'all':
                adminCtrlMode = true;
                const users = await getServerData('getAllUsers');
                ids = users.map((obj) => obj.id);
                column = 'rights';
                delete dataObj.target_u_radio;
                value = getCourseByFormData(dataObj);
                break;

            case 'specified':
                adminCtrlMode = true;
                const u_ids: string = dataObj['specified_u_text'];
                ids = u_ids.split('+');
                column = 'rights';
                delete dataObj.target_u_radio;
                delete dataObj.specified_u_text;
                value = getCourseByFormData(dataObj);
                break;
        }
    } else {
        if (Object.values(dataObj).some((value) => value === 'on')) {
            // course
            column = 'rights';
            value = getCourseByFormData(dataObj);
        } else {
            // the others
            column = Object.keys(dataObj)[1];
            value = Object.values(dataObj)[1];

            // switch between string or number depending on column
            switch (column) {
                case 'gacha_premium':
                case 'gacha_trial':
                case 'frontier_points':
                    value = Number(value);
                    value === 0 && (value = null);
                    break;

                case 'return_expires':
                    value = new Date(value);
                    break;

                default:
                    value = String(value);
            }
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
                    id: Number(user_id),
                },
                data: {
                    [column]: value,
                },
            });
        }

        return { success: true, status: 'user_updated', targetString: column };
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

const suspendUser: Action = async ({ request }) => {
    const data = await request.formData();
    const dataObj = convFormDataToObj(data);
    const { user_id, username, character_id, reason_type, permanently_del } = dataObj;

    try {
        if (permanently_del === 'on') {
            for (const char_id of character_id) {
                await db.distribution.deleteMany({
                    where: {
                        character_id: Number(char_id),
                    },
                });
            }

            await db.suspended_account.create({
                data: {
                    user_id: Number(user_id),
                    username: String(username),
                    reason: Number(reason_type),
                    permanent: true,
                },
            });

            await db.users.delete({
                where: {
                    id: Number(user_id),
                },
            });

            return { success: true, status: 'permanently_suspend_user', targetString: username };
        } else {
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

            await db.suspended_account.create({
                data: {
                    user_id: Number(user_id),
                    username: String(username),
                    reason: Number(reason_type),
                    date,
                    permanent: false,
                },
            });

            return { success: true, status: 'suspend_user', targetString: username };
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

const unsuspendUser: Action = async ({ request }) => {
    const data = await request.formData();
    const dataObj = convFormDataToObj(data);
    const { user_id, username } = dataObj;
    const character_id = data.getAll('character_id');

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

        await db.suspended_account.delete({
            where: {
                user_id: Number(user_id),
            },
        });

        return { success: true, status: 'unsuspend_user', targetString: username };
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
    const dataObj = convFormDataToObj(data);
    const { ja_file_name, en_file_name, bnr_name } = dataObj;
    let { bnr_url } = dataObj;

    // file check
    if (ja_file_name === '' || en_file_name === '' || bnr_name === '') {
        return { error: true, err_details: 'Failed to upload the files. Please make sure that all files are selected and the banner name is entered.' };
    }

    // file format validation1
    if (ja_file_name.indexOf(bnr_name) === -1 || en_file_name.indexOf(bnr_name) === -1) {
        return { error: true, err_details: "Failed to upload the files. The banner name in the file name doesn't match the banner name entered." };
    }

    // file format validation2
    if (ja_file_name.indexOf('_ja') === -1 || en_file_name.indexOf('_en') === -1) {
        return { error: true, err_details: 'Failed to upload the files. There is no language information in the file name.' };
    }

    // file extension validation
    if (ja_file_name.split('.').pop() !== 'png' || en_file_name.split('.').pop() !== 'png') {
        return { error: true, err_details: 'Failed to upload the files. File extension is incorrect.' };
    }

    // url convertor
    if (bnr_url.indexOf('discord.com')) {
        bnr_url = discordLinkConvertor(bnr_url);
    }

    try {
        await db.launcher_banner.create({
            data: {
                bnr_name,
                bnr_url,
                ja_img_src: `https://${R2_BNR_UNIQUE_URL}/bnr/bnr_ja/${ja_file_name}`,
                en_img_src: `https://${R2_BNR_UNIQUE_URL}/bnr/bnr_en/${en_file_name}`,
            },
        });

        return { success: true, status: 'bnr_created', targetString: bnr_name };
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
    const dataObj = convFormDataToObj(data);
    const { bnr_id, file_name, bnr_name, lang } = dataObj;
    let { bnr_url } = dataObj;

    try {
        if (!dataObj.hasOwnProperty('bnr_url')) {
            // file check
            if (file_name === '') {
                return { error: true, err_details: 'Failed to reupload the files. Please make sure that the file is selected.' };
            }

            // file format validation1
            if (file_name.indexOf(bnr_name) === -1) {
                return { error: true, err_details: "Failed to reupload the files. The banner name in the file name doesn't match the banner name already set." };
            }

            // file format validation2
            switch (lang) {
                case 'ja':
                    if (file_name.indexOf('ja') === -1) {
                        return { error: true, err_details: 'Failed to upload the files. There is no language information in the file name.' };
                    }
                    break;

                case 'en':
                    if (file_name.indexOf('en') === -1) {
                        return { error: true, err_details: 'Failed to upload the files. There is no language information in the file name.' };
                    }
                    break;
            }

            // file extension validation
            if (file_name.split('.').pop() !== 'png') {
                return { error: true, err_details: 'Failed to upload the files. File extension is incorrect.' };
            }

            return { success: true, status: 'bnr_updated', targetNumber: bnr_id, targetString: bnr_name };
        } else {
            // url convertor
            if (bnr_url.indexOf('discord.com')) {
                bnr_url = discordLinkConvertor(bnr_url);
            }

            await db.launcher_banner.update({
                where: {
                    id: Number(bnr_id),
                },
                data: {
                    bnr_url,
                },
            });

            return { success: true, status: 'bnr_updated', targetNumber: bnr_id, targetString: bnr_name };
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
    const dataObj = convFormDataToObj(data);
    const { bnr_id, bnr_name } = dataObj;

    try {
        await db.launcher_banner.delete({
            where: {
                id: Number(bnr_id),
            },
        });

        return { success: true, status: 'bnr_deleted', targetNumber: bnr_id, targetString: bnr_name };
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
    const dataObj = convFormDataToObj(data);
    const { user_id, char_id, discord_id } = dataObj;

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
    const dataObj = convFormDataToObj(data);
    const { user_id, char_id, discord_id } = dataObj;

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

const deleteCharacter: Action = async ({ request }) => {
    const data = await request.formData();
    const dataObj = convFormDataToObj(data);
    const { char_id, char_name, permanently_del } = dataObj;

    try {
        if (permanently_del === 'on') {
            await db.distribution.deleteMany({
                where: {
                    character_id: Number(char_id),
                },
            });

            await db.characters.delete({
                where: {
                    id: Number(char_id),
                },
            });

            return { success: true, status: 'permanently_delete_character', targetString: char_name };
        } else {
            await db.characters.update({
                where: {
                    id: Number(char_id),
                },
                data: {
                    deleted: true,
                },
            });

            return { success: true, status: 'delete_character', targetString: char_name };
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

const restoreCharacter: Action = async ({ request }) => {
    const data = await request.formData();
    const dataObj = convFormDataToObj(data);
    const { char_id, char_name } = dataObj;

    try {
        await db.characters.update({
            where: {
                id: Number(char_id),
            },
            data: {
                deleted: false,
            },
        });

        return { success: true, status: 'restore_character', targetString: char_name };
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
    suspendUser,
    unsuspendUser,
    createBnrData,
    updateBnrData,
    deleteBnrData,
    linkDiscord,
    unlinkDiscord,
    deleteCharacter,
    restoreCharacter,
};
