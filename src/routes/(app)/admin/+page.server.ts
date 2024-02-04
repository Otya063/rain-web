import type { Action, Actions, PageServerLoad } from './$types';
import type { discord, discord_register, launcher_banner, launcher_info, launcher_system, users } from '@prisma/client/edge';
import { error, fail } from '@sveltejs/kit';
import { R2_BNR_UNIQUE_URL } from '$env/static/private';
import ServerData, { db, getPaginatedUserData, getPaginationMeta } from '$lib/database';
import type { PaginatedUsers, PaginationMeta } from '$lib/types';
import { getCourseByObjData, deleteFileViaApi, discordLinkConvertor, conv2DArrayToObject, uploadFileViaApi } from '$lib/utils';
import { Buffer } from 'node:buffer';
import { DateTime } from 'luxon';

const emptyMsg = 'Input value is empty.';
const requiredMsg = 'Required field is empty.';

export const load: PageServerLoad = async ({ url, locals: { authUser } }) => {
    const launcherSystem = (await ServerData.getLauncherSystem()) as launcher_system;

    // check rain admin
    if (!url.origin.includes('localhost')) {
        const isAdmin: boolean = launcherSystem['rain_admins'].includes(authUser.username);

        if (!isAdmin) {
            throw error(403);
        }
    }

    const launcherInformation = (await ServerData.getInformation('ALL')) as { [key: string]: launcher_info[] };

    const launcherBanner: launcher_banner[] = await ServerData.getBannerData();

    return {
        launcherSystem,
        launcherInformation,
        launcherBanner,
    };
};

const updateSystemMode: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    let column = Object.keys(data)[0] as keyof Omit<launcher_system, 'id' | 'rain_admins'> | 'client_data_0' | 'client_data_1';
    let value = Object.values(data)[0] as string;

    if (column === 'client_data_0' && !value) {
        return fail(400, { error: true, message: emptyMsg });
    }

    // client_data column
    column === 'client_data_0' && Object.keys(data)[1] === 'client_data_1' && (column = 'client_data');

    try {
        await db.launcher_system.update({
            where: {
                id: 1,
            },
            data: {
                [column]: column === 'client_data' ? [value.length === 1 ? `${value}.0` : value, Object.values(data)[1]] : value === 'true',
            },
        });

        return {
            success: true,
            message: `The system mode (${column}) has been successfully updated.`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const updateAllMaintData: Action = async ({ request }) => {
    const data = await request.formData();
    const value = data.get('maint_all') as string;

    try {
        await db.launcher_system.update({
            where: {
                id: 1,
            },
            data: {
                RainJP: value === 'true',
                RainEU: value === 'true',
                RainUS: value === 'true',
            },
        });

        return {
            success: true,
            message: `All maintenance modes have been successfully updated (${value === 'true' ? 'Enable' : 'Disable'}).`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const createInfoData: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { title, type } = data as {
        title: string;
        type: 'Important' | 'Defects and Troubles' | 'Management and Service' | 'In-Game Events' | 'Updates and Maintenance' | 'Select the type of information here.';
    };
    let url = data.url as string | null;

    if (type === 'Select the type of information here.' || !title) {
        return fail(400, { error: true, message: requiredMsg });
    }

    try {
        const createdInfo = await db.launcher_info.create({
            data: {
                title,
                url: !url ? null : url.indexOf('discord.com') ? discordLinkConvertor(url) : url,
                type,
            },
        });

        return {
            success: true,
            message: `The information data (ID: ${createdInfo.id}) has been successfully created.`,
            createdInfo,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const updateInfoData: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const id = Number(data.info_id);
    const column = Object.keys(data)[2] as keyof Omit<launcher_info, 'id' | 'created_at'>;
    let value = Object.values(data)[2] as string | null;

    if ((column === 'title' || column === 'type') && !value) {
        return fail(400, { error: true, message: emptyMsg });
    }

    try {
        const updatedInfo = await db.launcher_info.update({
            where: {
                id,
            },
            data: {
                [column]: column !== 'url' ? value : !value ? null : value.indexOf('discord.com') ? discordLinkConvertor(value) : value,
            },
        });

        return {
            success: true,
            message: `The information data (ID: ${id}, Type: ${column}) has been successfully updated.`,
            updatedInfo,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
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

        return {
            success: true,
            message: `The information data (ID: ${id}) has been successfully deleted.`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const courseControl: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { target_u_radio } = data as { target_u_radio: string };
    let ids: number[];
    delete data.target_u_radio;

    if (!Object.keys(data).length) {
        return fail(400, { error: true, message: 'You must choose at least one course.' });
    }

    switch (target_u_radio) {
        case 'all': {
            const userIds = await ServerData.getAllUsers();
            ids = userIds.map((obj) => obj.id);
            break;
        }

        case 'specified': {
            ids = data.specified_u_text.split('+').map(Number);
            delete data.specified_u_text;
            break;
        }

        default: {
            return fail(400, { error: true, message: 'Select the target user type.' });
        }
    }

    try {
        for (const id of ids) {
            await db.users.update({
                where: {
                    id,
                },
                data: {
                    rights: getCourseByObjData(data),
                },
            });
        }

        return {
            success: true,
            message: target_u_radio === 'all' ? "All users' rights have been successfully updated." : `The specified user's (ID: ${ids}) rights have been successfully updated.`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const getPaginatedUsers: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { filter_param, filter_value, status, cursor } = data as { filter_param: 'username' | 'character_name'; filter_value: string; status: string; cursor: number };

    if (!filter_value) {
        return fail(400, { error: true, message: emptyMsg });
    }

    let paginatedUsers: PaginatedUsers[];
    let paginationMeta: PaginationMeta;

    switch (status) {
        case 'init': {
            paginatedUsers = await getPaginatedUserData(filter_param, filter_value, 'init', 5);
            if (!paginatedUsers.length) {
                return fail(400, {
                    error: true,
                    message: filter_param === 'username' ? "The user(s) with the entered username doesn't exist." : "The character(s) with the entered name doesn't exist.",
                });
            }

            const nextCursor = paginatedUsers[4]?.id || 0;
            paginationMeta = await getPaginationMeta(filter_param, filter_value, 0, nextCursor);

            break;
        }

        case 'back':
        case 'next': {
            paginatedUsers = await getPaginatedUserData(filter_param, filter_value, 'back', status === 'back' ? -5 : 5, Number(cursor), 1);
            if (!paginatedUsers.length) {
                return fail(400, {
                    error: true,
                    message: filter_param === 'username' ? "The user(s) with the entered username doesn't exist." : "The character(s) with the entered name doesn't exist.",
                });
            }

            const prevCursor = paginatedUsers[0]?.id || 0;
            const nextCursor = paginatedUsers[4]?.id || 0;
            paginationMeta = await getPaginationMeta(filter_param, filter_value, prevCursor, nextCursor);

            break;
        }

        default: {
            throw new Error('Invalid Status');
        }
    }

    return { paginatedUsers, paginationMeta };
};

const updateUserData: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const id = Number(data.user_id);
    const zoneName = String(data.zoneName);
    const column = Object.keys(data)[1] as keyof Omit<users, 'id' | 'last_character' | 'last_login' | 'item_box' | 'web_login_key'>;
    const value = Object.values(data)[1] as string | number;
    let rightsData: Record<string, any> = {};

    if (!value) {
        switch (column) {
            case 'username':
            case 'password':
            case 'return_expires': {
                return fail(400, { error: true, message: emptyMsg });
            }
        }
    }

    if (column === 'rights') {
        const keys = Object.keys(data);
        const rightsKeys = keys.slice(2);
        rightsKeys.forEach((key) => {
            rightsData[key] = data[key];
        });

        if (!Object.keys(rightsData).length) {
            return fail(400, { error: true, message: 'You must choose at least one course.' });
        }
    }

    try {
        await db.users.update({
            where: {
                id,
            },
            data: {
                [column]:
                    column === 'rights'
                        ? getCourseByObjData(rightsData)
                        : column === 'return_expires'
                        ? DateTime.fromISO(String(value), { zone: zoneName }).toString()!
                        : column === 'frontier_points' || column === 'gacha_premium' || column === 'gacha_trial'
                        ? !value
                            ? null
                            : Number(value)
                        : value,
            },
        });

        return {
            success: true,
            message: `The user data (Type: ${column}) has been successfully updated.`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const updateCharacterData: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const id = Number(data.character_id);
    const column = Object.keys(data)[1] as 'id' | 'name' | 'savedata';
    const value = Object.values(data)[1] as string;

    try {
        switch (column) {
            case 'name': {
                const { success, message } = await db.characters.editName(id, value);

                if (!success) {
                    return fail(400, { error: true, message });
                } else {
                    return {
                        success: true,
                        message: `The character name (New Name: ${value}) has been successfully updated.`,
                    };
                }
            }

            case 'savedata': {
                const uint8Arr = new Uint8Array(value.split(',').map(Number));
                const base64 = Buffer.from(uint8Arr).toString('base64');
                if (!base64) {
                    return fail(400, { error: true, message: 'No file selected.' });
                }

                await db.characters.setBinary('savedata', id, base64);

                return {
                    success: true,
                    message: `The binary data (Binary Type: ${column}) of the character has been successfully updated.`,
                };
            }

            default: {
                throw new Error('Invalid Column');
            }
        }
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const suspendUser: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { user_id, username, reason_type, permanently_del, until_at, zoneName } = data as {
        user_id: number;
        username: string;
        reason_type: number;
        permanently_del: string;
        until_at: string;
        zoneName: string;
    };

    if (!reason_type) {
        return fail(400, { error: true, message: emptyMsg });
    }

    try {
        if (permanently_del === 'on') {
            const suspendedAccount = await db.suspended_account.create({
                data: {
                    user_id: Number(user_id),
                    username,
                    reason: Number(reason_type),
                    until_at: DateTime.utc(9999, 1, 1).toISO()!,
                    permanent: true,
                },
            });

            await db.characters.deleteMany({
                where: {
                    user_id: Number(user_id),
                },
            });

            return {
                success: true,
                message: `The user account (Username: ${username}) was successfully suspended. (Not Restorable)`,
                suspendedAccount,
            };
        } else {
            if (!until_at) {
                return fail(400, { error: true, message: emptyMsg });
            }

            const suspendedAccount = await db.suspended_account.create({
                data: {
                    user_id: Number(user_id),
                    username,
                    reason: Number(reason_type),
                    until_at: DateTime.fromISO(String(until_at), { zone: zoneName }).toString()!,
                    permanent: false,
                },
            });

            await db.characters.updateMany({
                where: {
                    user_id: Number(user_id),
                },
                data: {
                    deleted: true,
                },
            });

            return {
                success: true,
                message: `The user account (Username: ${username}) was successfully suspended. (Restorable)`,
                suspendedAccount,
            };
        }
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const unsuspendUser: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { user_id, username } = data as { user_id: number; username: string };

    try {
        await db.characters.updateMany({
            where: {
                user_id: Number(user_id),
            },
            data: {
                deleted: false,
            },
        });

        await db.suspended_account.delete({
            where: {
                user_id: Number(user_id),
            },
        });

        return {
            success: true,
            message: `The user account (Username: ${username}) was successfully unsuspended.`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const createBnrData: Action = async ({ request, url }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { ja_file, en_file, bnr_name } = data as { ja_file: File; en_file: File; bnr_name: string };
    let bnr_url = data.bnr_url as string | null;

    // file check
    if (ja_file.size === 0 || en_file.size === 0 || !bnr_name) {
        return fail(400, { error: true, message: `Failed to upload the files. ${requiredMsg} ` });
    }

    // file name validation
    if (ja_file.name !== `${bnr_name}_ja.png` || en_file.name !== `${bnr_name}_en.png`) {
        return fail(400, { error: true, message: 'Failed to upload the files. Invalid file name' });
    }

    // file type validation
    if (ja_file.type !== 'image/png' || en_file.type !== 'image/png') {
        return fail(400, { error: true, message: 'Failed to upload the files. Invalid type of file.' });
    }

    // url convertor
    bnr_url = !bnr_url ? null : bnr_url.indexOf('discord.com') ? discordLinkConvertor(bnr_url) : bnr_url;

    const uploadJa: Promise<boolean> = uploadFileViaApi(url.origin, ja_file, 'ja');
    const uploadEn: Promise<boolean> = uploadFileViaApi(url.origin, en_file, 'en');
    const result: boolean[] = await Promise.all([uploadJa, uploadEn]);
    if (result.every((boolean) => boolean !== true)) {
        return fail(400, { error: true, message: 'Failed to upload the files. Please try again.' });
    }

    try {
        const createdBnr = await db.launcher_banner.create({
            data: {
                bnr_name,
                bnr_url,
                ja_img_src: `https://${R2_BNR_UNIQUE_URL}/ja/${ja_file.name}`,
                en_img_src: `https://${R2_BNR_UNIQUE_URL}/en/${en_file.name}`,
            },
        });

        return { success: true, message: `The banner data (Banner Name: ${bnr_name}) was successfully created.`, createdBnr };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const updateBnrData: Action = async ({ request, url }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const column = Object.keys(data)[1] as 'bnr_url' | 'file';
    const { bnr_id, file, bnr_name, lang } = data as { bnr_id: number; file?: File; bnr_name?: string; lang?: string };
    let bnr_url = data.bnr_url as string | null | undefined;

    try {
        if (!file) {
            bnr_url = !bnr_url ? null : bnr_url.indexOf('discord.com') ? discordLinkConvertor(bnr_url) : bnr_url;

            await db.launcher_banner.update({
                where: {
                    id: Number(bnr_id),
                },
                data: {
                    bnr_url,
                },
            });

            return { success: true, message: `The banner data (ID: ${bnr_id} / Type: ${column}) has been successfully updated.` };
        } else {
            // file check
            if (file.size === 0 || !bnr_name || !lang) {
                return fail(400, { error: true, message: "Failed to re-upload the files. You haven't selected an image to update." });
            }

            // file name validation
            if (file.name !== `${bnr_name}_${lang}.png`) {
                return fail(400, { error: true, message: 'Failed to re-upload the files. Invalid file name' });
            }

            // file type validation
            if (file.type !== 'image/png') {
                return fail(400, { error: true, message: 'Failed to re-upload the files. Invalid type of file.' });
            }

            // delete and upload file
            const result = Promise.resolve()
                .then(() => deleteFileViaApi(url.origin, file.name, lang))
                .then(() => uploadFileViaApi(url.origin, file, lang))
                .then(() => {
                    return { success: true, message: `The banner (ID: ${bnr_id}) has been successfully re-uploaded.` };
                })
                .catch(() => {
                    return fail(400, { error: true, message: 'Failed to re-upload the files. Please try again.' });
                });

            return await result;
        }
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const deleteBnrData: Action = async ({ request, url }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { bnr_id, bnr_name } = data as { bnr_id: number; bnr_name: string };

    const deletedJa: Promise<boolean> = deleteFileViaApi(url.origin, `${bnr_name}_ja.png`, 'ja');
    const deletedEn: Promise<boolean> = deleteFileViaApi(url.origin, `${bnr_name}_en.png`, 'en');
    const result: boolean[] = await Promise.all([deletedJa, deletedEn]);
    if (result.every((boolean) => boolean !== true)) {
        return fail(400, { error: true, message: 'Failed to upload the files. Please try again.' });
    }

    try {
        await db.launcher_banner.delete({
            where: {
                id: Number(bnr_id),
            },
        });

        return { success: true, message: `The banner data (ID: ${bnr_id} / Banner Name: ${bnr_name}) has been successfully deleted.` };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const linkDiscord: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { user_id, char_id, discord_id } = data as { user_id: number; char_id: number; discord_id: string };
    let createdDiscord: discord;

    if (!discord_id) {
        return fail(400, { error: true, message: emptyMsg });
    }

    try {
        // discord (character)
        const discord: discord | null = await ServerData.getLinkedCharactersByDiscordId(discord_id);
        if (discord) {
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
            } = discord;

            await db.discord.delete({
                where: {
                    id,
                },
            });

            createdDiscord = await db.discord.create({
                data: {
                    char_id: Number(char_id),
                    discord_id,
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
            createdDiscord = await db.discord.create({
                data: {
                    char_id: Number(char_id),
                    discord_id,
                },
            });
        }

        // discord_register (user)
        const discordRegister: discord_register | null = await ServerData.getLinkedUserByDiscordId(discord_id);
        if (discordRegister) {
            const { id } = discordRegister;
            await db.discord_register.delete({
                where: {
                    id,
                },
            });
        }

        await db.discord_register.create({
            data: {
                user_id: Number(user_id),
                discord_id,
            },
        });

        return {
            success: true,
            message: `The character (Character ID: ${char_id}) has been successfully linked to the discord account (Discord ID: ${discord_id}).`,
            createdDiscord,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const unlinkDiscord: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { char_id, discord_id } = data as { char_id: number; discord_id: string };

    try {
        const discord = await db.discord.findFirst({
            where: {
                discord_id,
            },
        });

        const discordRegister = await db.discord_register.findFirst({
            where: {
                discord_id,
            },
        });

        const id1 = discord!['id'];
        const id2 = discordRegister!['id'];

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

        return {
            success: true,
            message: `The character (Character ID: ${char_id}) has been successfully unlinked.`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const deleteCharacter: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { char_id, char_name, permanently_del } = data as { char_id: number; char_name: string; permanently_del: string };

    try {
        if (permanently_del === 'on') {
            await db.characters.delete({
                where: {
                    id: Number(char_id),
                },
            });

            return {
                success: true,
                message: `The character (Character Name: ${char_name}) has been successfully deleted. (Not Restorable)`,
            };
        } else {
            await db.characters.update({
                where: {
                    id: Number(char_id),
                },
                data: {
                    deleted: true,
                },
            });

            return {
                success: true,
                message: `The character (Character Name: ${char_name}) has been successfully deleted. (Restorable)`,
            };
        }
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

const restoreCharacter: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { char_id, char_name } = data as { char_id: number; char_name: string };

    try {
        await db.characters.update({
            where: {
                id: Number(char_id),
            },
            data: {
                deleted: false,
            },
        });

        return {
            success: true,
            message: `The character (Character Name: ${char_name}) has been successfully restored.`,
        };
    } catch (err) {
        if (err instanceof Error) {
            return fail(400, { error: true, message: err.message });
        } else if (typeof err === 'string') {
            return fail(400, { error: true, message: err });
        } else {
            return fail(400, { error: true, message: 'Unexpected Error' });
        }
    }
};

export const actions: Actions = {
    updateSystemMode,
    updateAllMaintData,
    createInfoData,
    updateInfoData,
    deleteInfoData,
    courseControl,
    getPaginatedUsers,
    updateUserData,
    updateCharacterData,
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
