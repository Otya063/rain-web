import type { Action, Actions, PageServerLoad } from './$types';
import type { discord, discord_register, launcher_banner, launcher_info, launcher_system, users } from '@prisma/client/edge';
import { error, fail } from '@sveltejs/kit';
import { R2_BNR_UNIQUE_URL } from '$env/static/private';
import ServerData, { db, getPaginatedAllianceData, getPaginatedClanData, getPaginatedUserData, getPaginationMeta, IsCharLogin } from '$lib/database';
import type { BinaryTypes } from '$lib/types';
import { getCourseByObjData, deleteFileViaApi, discordLinkConvertor, conv2DArrayToObject, uploadFileViaApi } from '$lib/utils';
import { DateTime } from 'luxon';
import { Buffer } from 'node:buffer';

const emptyMsg = 'Input value is empty.';
const requiredMsg = 'Required field is empty.';

export const load: PageServerLoad = async ({ url, locals: { LL, authUser } }) => {
    const launcherSystem = (await ServerData.getLauncherSystem()) as launcher_system;

    // check rain admin
    if (!url.origin.includes('localhost')) {
        const isAdmin: boolean = launcherSystem['rain_admins'].includes(authUser.username);

        if (!isAdmin) {
            throw error(403, { message: '', message1: undefined, message2: undefined, message3: LL.error['adminForbidden']() });
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
    let column = Object.keys(data)[0] as keyof Omit<launcher_system, 'id'> | 'client_data_0' | 'client_data_1';
    let value = Object.values(data)[0] as string;

    if ((column === 'client_data_0' || column === 'rain_admins') && !value) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
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
                [column]: column === 'client_data' ? [value.length === 1 ? `${value}.0` : value, Object.values(data)[1]] : column === 'rain_admins' ? value.split(',') : value === 'true',
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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
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
    const zonename = data.zonename;
    const column = Object.keys(data)[2] as keyof Omit<launcher_info, 'id'>;
    let value = Object.values(data)[2] as string | null;
    if (!value) {
        switch (column) {
            case 'title':
            case 'type':
            case 'created_at': {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                return fail(400, { error: true, message: emptyMsg });
            }

            default: {
                break;
            }
        }
    }

    try {
        const updatedInfo = await db.launcher_info.update({
            where: {
                id,
            },
            data: {
                [column]:
                    column !== 'url'
                        ? column === 'created_at'
                            ? DateTime.fromISO(String(value), { zone: zonename }).toString()!
                            : value
                        : !value
                        ? null
                        : value.indexOf('discord.com')
                        ? discordLinkConvertor(value)
                        : value,
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

    try {
        switch (target_u_radio) {
            case 'all': {
                delete data.specified_u_text;

                if (!Object.keys(data).length) {
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                    return fail(400, { error: true, message: 'You must choose at least one course.' });
                }

                await db.$queryRaw`UPDATE users SET rights = ${getCourseByObjData(data)}`;

                return {
                    success: true,
                    message: "All users' rights have been successfully updated.",
                };
            }

            case 'specified': {
                if (!data.specified_u_text) {
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                    return fail(400, { error: true, message: 'Specify the user ID.' });
                }

                ids = data.specified_u_text.split('+').map(Number);
                delete data.specified_u_text;

                if (!Object.keys(data).length) {
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                    return fail(400, { error: true, message: 'You must select at least one course.' });
                }

                if (ids.length > 10) {
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                    return fail(400, { error: true, message: 'No more than 10 users can be specified.' });
                }

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
                    message: `The specified users' (ID: ${ids.join(', ')}) rights have been successfully updated.`,
                };
            }

            default: {
                return fail(400, { error: true, message: 'Select the target user type.' });
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

const getPaginatedUsers: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { filter_param, filter_value, status, cursor } = data as {
        filter_param: 'username' | 'character_name' | 'user_id' | 'character_id';
        filter_value: string | number;
        status: string;
        cursor: number;
    };

    if (!filter_value) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: emptyMsg });
    } else if ((filter_param === 'user_id' || filter_param === 'character_id') && isNaN(filter_value as number)) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: `If "${filter_param}" is selected, no strings are allowed.` });
    }

    const { paginatedUsers, paginationMeta } = await (async () => {
        switch (status) {
            case 'init': {
                const paginatedUsers = await getPaginatedUserData(filter_param, filter_value, 'init', 5);

                const nextCursor = paginatedUsers[4]?.id || 0;
                const paginationMeta = await getPaginationMeta(filter_param, filter_value, 0, nextCursor);

                return { paginatedUsers, paginationMeta };
            }

            case 'back':
            case 'next': {
                const paginatedUsers = await getPaginatedUserData(filter_param, filter_value, 'back', status === 'back' ? -5 : 5, Number(cursor), 1);

                const prevCursor = paginatedUsers[0]?.id || 0;
                const nextCursor = paginatedUsers[4]?.id || 0;
                const paginationMeta = await getPaginationMeta(filter_param, filter_value, prevCursor, nextCursor);

                return { paginatedUsers, paginationMeta };
            }

            default: {
                throw new Error('Invalid Status');
            }
        }
    })();

    if (!paginatedUsers.length) {
        return fail(400, {
            error: true,
            message:
                filter_param === 'username'
                    ? `The user(s) with the entered username (${filter_value}) doesn't exist.`
                    : filter_param === 'character_name'
                    ? `The character(s) with the entered character name (${filter_value}) doesn't exist.`
                    : `The account with the entered ${filter_param} (${filter_value}) doesn't exist.`,
        });
    }

    return { paginatedUsers, paginationMeta };
};

const getPaginatedClans: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { filter_param, filter_value, status, cursor } = data as { filter_param: 'clan_name' | 'clan_id'; filter_value: string | number; status: string; cursor: number };

    if (!filter_value) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: emptyMsg });
    } else if (filter_param === 'clan_id' && isNaN(filter_value as number)) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: `If "${filter_param}" is selected, no strings are allowed.` });
    }

    const { paginatedClans, paginationClanMeta } = await (async () => {
        switch (status) {
            case 'init': {
                const paginatedClans = await getPaginatedClanData(filter_param, filter_value, 'init', 5);

                const nextCursor = paginatedClans[4]?.id || 0;
                const paginationClanMeta = await getPaginationMeta(filter_param, filter_value, 0, nextCursor);

                return { paginatedClans, paginationClanMeta };
            }

            case 'back':
            case 'next': {
                const paginatedClans = await getPaginatedClanData(filter_param, filter_value, 'back', status === 'back' ? -5 : 5, Number(cursor), 1);

                const prevCursor = paginatedClans[0]?.id || 0;
                const nextCursor = paginatedClans[4]?.id || 0;
                const paginationClanMeta = await getPaginationMeta(filter_param, filter_value, prevCursor, nextCursor);

                return { paginatedClans, paginationClanMeta };
            }

            default: {
                throw new Error('Invalid Status');
            }
        }
    })();

    if (!paginatedClans.length) {
        return fail(400, {
            error: true,
            message: `The clan with the entered ${filter_param} (${filter_value}) doesn't exist.`,
        });
    }

    return { paginatedClans, paginationClanMeta, paginatedAlliances: [], paginationAllianceMeta: { hasPrevPage: false, hasNextPage: false, prevCursor: 0, nextCursor: 0 }, clanNames: [] };
};

const getPaginatedAlliances: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { filter_param, filter_value, status, cursor } = data as { filter_param: 'alliance_name' | 'alliance_id'; filter_value: string | number; status: string; cursor: number };

    if (!filter_value) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: emptyMsg });
    } else if (filter_param === 'alliance_id' && isNaN(filter_value as number)) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: `If "${filter_param}" is selected, no strings are allowed.` });
    }

    const { paginatedAlliances, paginationAllianceMeta } = await (async () => {
        switch (status) {
            case 'init': {
                const paginatedAlliances = await getPaginatedAllianceData(filter_param, filter_value, 'init', 5);

                const nextCursor = paginatedAlliances[4]?.id || 0;
                const paginationAllianceMeta = await getPaginationMeta(filter_param, filter_value, 0, nextCursor);

                return { paginatedAlliances, paginationAllianceMeta };
            }

            case 'back':
            case 'next': {
                const paginatedAlliances = await getPaginatedAllianceData(filter_param, filter_value, 'back', status === 'back' ? -5 : 5, Number(cursor), 1);

                const prevCursor = paginatedAlliances[0]?.id || 0;
                const nextCursor = paginatedAlliances[4]?.id || 0;
                const paginationAllianceMeta = await getPaginationMeta(filter_param, filter_value, prevCursor, nextCursor);

                return { paginatedAlliances, paginationAllianceMeta };
            }

            default: {
                throw new Error('Invalid Status');
            }
        }
    })();

    const clanNames = await db.guilds.findMany({
        select: {
            name: true,
        },
        orderBy: {
            id: 'asc',
        },
    });
    const nameArr = clanNames.map((a) => a.name) as string[];

    if (!paginatedAlliances.length) {
        return fail(400, {
            error: true,
            message: `The clan with the entered ${filter_param} (${filter_value}) doesn't exist.`,
        });
    }

    return { paginatedClans: [], paginationClanMeta: { hasPrevPage: false, hasNextPage: false, prevCursor: 0, nextCursor: 0 }, paginatedAlliances, paginationAllianceMeta, nameArr };
};

const updateUserData: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const id = Number(data.user_id);
    const zonename = data.zonename;
    const column = Object.keys(data)[1] as keyof Omit<users, 'id' | 'last_character' | 'last_login' | 'item_box' | 'web_login_key'>;
    const value = Object.values(data)[1] as string | number;
    let rightsData: Record<string, any> = {};

    if (!value) {
        switch (column) {
            case 'username':
            case 'password':
            case 'return_expires': {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                return fail(400, { error: true, message: emptyMsg });
            }

            default: {
                break;
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
                        ? DateTime.fromISO(String(value), { zone: zonename }).toString()!
                        : column === 'frontier_points' || column === 'gacha_premium' || column === 'gacha_trial'
                        ? !value
                            ? null
                            : Number(value)
                        : (column === 'psn_id' || column === 'wiiu_key') && !value
                        ? null
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
    const column = Object.keys(data)[2] as 'name' | 'bounty' | 'clan' | 'binary';
    const value = Object.values(data)[2] as string | number;

    switch (column) {
        case 'name': {
            const discordLinked = data.not_linked === 'false';
            const bountyCoin = Number(data.bounty_coin);
            if (!discordLinked) {
                return fail(400, { error: true, message: "This character isn't linked to a discord account." });
            } else if (bountyCoin < 50000) {
                return fail(400, { error: true, message: `Insufficient bounty coins (Owned: ${bountyCoin}).` });
            }

            const { success, message } = await db.characters.editName(id, String(value), bountyCoin);
            console.log(success, message);
            if (!success) {
                return fail(400, { error: true, message });
            } else {
                return {
                    success: true,
                    message: `The character name (New Name: ${value}) has been successfully updated.`,
                };
            }
        }

        case 'bounty': {
            try {
                await db.discord.update({
                    where: {
                        char_id: id,
                    },
                    data: {
                        bounty: Number(value),
                    },
                });

                return {
                    success: true,
                    message: `Bounty coin data has been successfully updated (Owned: ${value}).`,
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
        }

        case 'clan': {
            const clanId = Number(data.clan_id);
            const clanCharNum = Number(data.clan_length);
            const clanName = data.clan_name;

            try {
                if (clanCharNum - 1 === 0) {
                    await db.guilds.delete({
                        where: {
                            id: clanId,
                        },
                    });
                } else {
                    await db.guild_characters.delete({
                        where: {
                            character_id: id,
                        },
                    });
                }

                return {
                    success: true,
                    message: `The character (ID: ${id}) has successfully left the "${clanName}."`,
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
        }

        case 'binary': {
            const file = data.file as File;
            if (file.size === 0) {
                return fail(400, { error: true, message: 'No file selected.' });
            }

            delete data.user_id;
            delete data.character_id;
            delete data.binary;
            delete data.file;

            const binaryData: { [key in BinaryTypes]: string } = data as { [key in BinaryTypes]: string };
            Object.keys(data).forEach((_value) => {
                const value = _value as BinaryTypes;
                const base64 = Buffer.from(new Uint8Array(data[value].split(',').map(Number))).toString('base64');
                binaryData[value] = base64 === 'AA==' ? '' : base64;
            });

            const { success, message } = await db.characters.setBinary(id, binaryData);
            if (!success) {
                return fail(400, { error: true, message });
            } else {
                return {
                    success: true,
                    message: `The binary data of the character (ID: ${id}) has been successfully updated.`,
                };
            }
        }

        default: {
            throw new Error('Invalid Column');
        }
    }
};

const deleteUser: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { user_id, username } = data as { user_id: number; username: string };

    const charIds = (
        await db.characters.findMany({
            where: {
                user_id: Number(user_id),
            },
            select: {
                id: true,
            },
        })
    ).map((char) => char.id);

    const result = await new IsCharLogin(charIds).checkMulti();
    if (result.check && result.charIds.length) {
        return fail(400, { error: true, message: `Couldn't process because all characters haven't logged out.<br />Logged-In Character's ID: ${result.charIds}` });
    }

    try {
        await db.users.delete({
            where: {
                id: Number(user_id),
            },
        });

        return {
            success: true,
            message: `The user account (Username: ${username}) was successfully deleted.`,
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

const suspendUser: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { user_id, username, reason_type, permanently_del, until_at, zoneName } = data as {
        user_id: number;
        username: string;
        reason_type: number;
        permanently_del: string;
        until_at?: string;
        zoneName: string;
    };

    if (!reason_type || (permanently_del !== 'on' && !until_at)) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: emptyMsg });
    }

    const { success, message, suspendedAccount } = await db.users.suspend(Number(user_id), username, Number(reason_type), permanently_del === 'on', zoneName, until_at);
    if (!success || !suspendedAccount) {
        return fail(400, { error: true, message });
    } else {
        return {
            success: true,
            message: `The user account (Username: ${username}) was successfully suspended. (Restorable)`,
            suspendedAccount,
        };
    }
};

const unsuspendUser: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { user_id, username } = data as { user_id: number; username: string };

    const { success, message } = await db.users.unsuspend(Number(user_id));
    if (!success) {
        return fail(400, { error: true, message });
    } else {
        return {
            success: true,
            message: `The user account (Username: ${username}) was successfully unsuspended.`,
        };
    }
};

const createBnrData: Action = async ({ request, url }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { ja_file, en_file, bnr_name } = data as { ja_file: File; en_file: File; bnr_name: string };
    let bnr_url = data.bnr_url as string | null;

    // file check
    if (ja_file.size === 0 || en_file.size === 0 || !bnr_name) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: `Failed to upload the files. ${requiredMsg} ` });
    }

    // file name validation
    if (ja_file.name !== `${bnr_name}_ja.png` || en_file.name !== `${bnr_name}_en.png`) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: 'Failed to upload the files. Invalid file name' });
    }

    // file type validation
    if (ja_file.type !== 'image/png' || en_file.type !== 'image/png') {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
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
                await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                return fail(400, { error: true, message: "Failed to re-upload the files. You haven't selected an image to update." });
            }

            // file name validation
            if (file.name !== `${bnr_name}_${lang}.png`) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
                return fail(400, { error: true, message: 'Failed to re-upload the files. Invalid file name' });
            }

            // file type validation
            if (file.type !== 'image/png') {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
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

    if (!discord_id) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: emptyMsg });
    }

    try {
        const discordRegisterByUserId: discord_register | null = await ServerData.getLinkedUserByUserId(Number(user_id));
        if (discordRegisterByUserId && discordRegisterByUserId.discord_id !== discord_id) {
            return fail(400, {
                error: true,
                message: 'This user account is already linked to another discord account.<br>Linked data can only be transferred between characters with the same discord ID (account).',
            });
        }

        // discord_register (user)
        const discordRegister: discord_register | null = await ServerData.getLinkedUserByDiscordId(discord_id);
        (async () => {
            if (discordRegister) {
                await db.discord_register.update({
                    where: {
                        discord_id,
                    },
                    data: {
                        user_id: Number(user_id),
                    },
                });
            } else {
                await db.discord_register.create({
                    data: {
                        user_id: Number(user_id),
                        discord_id,
                    },
                });
            }
        })();

        // discord (character)
        const discord: discord | null = await ServerData.getLinkedCharactersByDiscordId(discord_id);
        const { newDiscord } = await (async () => {
            if (discord) {
                const newDiscord = await db.discord.update({
                    where: {
                        discord_id,
                    },
                    data: {
                        char_id: Number(char_id),
                    },
                });

                return { newDiscord };
            } else {
                const newDiscord = await db.discord.create({
                    data: {
                        char_id: Number(char_id),
                        discord_id,
                    },
                });

                return { newDiscord };
            }
        })();

        return {
            success: true,
            message: `The character (Character ID: ${char_id}) has been successfully linked to the discord account (Discord ID: ${discord_id}).`,
            newDiscord,
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

    const { success, message } = await db.characters.remove(Number(char_id), permanently_del === 'on');
    if (!success) {
        return fail(400, { error: true, message });
    } else {
        return {
            success: true,
            message: `The character (Character Name: ${char_name}) has been successfully deleted. (Not Restorable)`,
        };
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

const rebuildClan: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { clan_id, clan_name } = data as { clan_id: number; clan_name: string };

    const charIds = (
        await db.guild_characters.findMany({
            where: {
                guild_id: Number(clan_id),
            },
            select: {
                character_id: true,
            },
        })
    ).map((character) => character.character_id!);

    const result = await new IsCharLogin(charIds).checkMulti();
    if (result.check && !!result.charIds.length) {
        return fail(400, { error: true, message: `Couldn't process because all characters haven't logged out.<br />Logged-In Character's ID: ${result.charIds}` });
    }

    const { success, message } = await db.guilds.rebuild(Number(clan_id));
    if (!success) {
        return fail(400, { error: true, message });
    } else {
        return {
            success: true,
            message: `The clan data (Name: ${clan_name}, New ID: ${message}) has been successfully rebuilt.`,
        };
    }
};

const updateAllianceData: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { alliance_id, first_clan_name, second_clan_name } = data as { alliance_id: number; first_clan_name: string; second_clan_name: string };

    if (first_clan_name && second_clan_name && JSON.parse(first_clan_name).value === JSON.parse(second_clan_name).value) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: 'The first and second clan must be different.' });
    } else if (!first_clan_name && second_clan_name) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // prevent messages from disappearing instantly when submitting while timer is running
        return fail(400, { error: true, message: 'Before selecting the second clan, the first clan must be selected.' });
    }

    try {
        // get each selected clan data
        const firstClanData = await (async () => {
            if (!first_clan_name) {
                return null;
            } else {
                return await db.guilds.findFirst({
                    where: {
                        name: JSON.parse(first_clan_name).value,
                    },
                    select: {
                        id: true,
                        name: true,
                        leader_id: true,
                    },
                });
            }
        })();
        const secondClanData = await (async () => {
            if (!second_clan_name) {
                return null;
            } else {
                return await db.guilds.findFirst({
                    where: {
                        name: JSON.parse(second_clan_name).value,
                    },
                    select: {
                        id: true,
                        name: true,
                        leader_id: true,
                    },
                });
            }
        })();

        const isExist1 = firstClanData?.id
            ? await db.guild_alliances.findFirst({
                  where: {
                      OR: [{ parent_id: firstClanData.id }, { sub1_id: firstClanData.id }, { sub2_id: firstClanData.id }],
                  },
              })
            : null;
        const isExist2 = secondClanData?.id
            ? await db.guild_alliances.findFirst({
                  where: {
                      OR: [{ parent_id: secondClanData.id }, { sub1_id: secondClanData.id }, { sub2_id: secondClanData.id }],
                  },
              })
            : null;
        if (isExist1 && isExist1.name !== firstClanData?.name) {
            return fail(400, { error: true, message: `The selected 1st clan has already joined the alliance (Name: ${isExist1.name}).` });
        } else if (isExist2 && isExist2.name !== secondClanData?.name) {
            return fail(400, { error: true, message: `The selected 2nd clan has already joined the alliance (Name: ${isExist2.name}).` });
        }

        await db.guild_alliances.update({
            where: {
                id: Number(alliance_id),
            },
            data: {
                sub1_id: firstClanData?.id || null,
                sub2_id: secondClanData?.id || null,
            },
        });

        // get each clan leader name
        const firstClanLeader = await (async () => {
            if (!firstClanData) {
                return null;
            } else {
                return (await db.characters.findFirst({
                    where: {
                        id: firstClanData.leader_id,
                    },
                    select: {
                        name: true,
                    },
                }))!.name;
            }
        })();
        const secondClanLeader = await (async () => {
            if (!secondClanData) {
                return null;
            } else {
                return (await db.characters.findFirst({
                    where: {
                        id: secondClanData.leader_id,
                    },
                    select: {
                        name: true,
                    },
                }))!.name;
            }
        })();

        const updatedAllianceData = {
            id: Number(alliance_id),
            first_child_clan: {
                clan_name: firstClanData?.name || null,
                leader_name: firstClanLeader || null,
            },
            second_child_clan: {
                clan_name: secondClanData?.name || null,
                leader_name: secondClanLeader || null,
            },
        };

        return {
            success: true,
            message: `Alliance data (ID: ${alliance_id}) has been successfully updated.`,
            updatedAllianceData,
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
    getPaginatedClans,
    getPaginatedAlliances,
    updateUserData,
    updateCharacterData,
    deleteUser,
    suspendUser,
    unsuspendUser,
    createBnrData,
    updateBnrData,
    deleteBnrData,
    linkDiscord,
    unlinkDiscord,
    deleteCharacter,
    restoreCharacter,
    rebuildClan,
    updateAllianceData,
};
