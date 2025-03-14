import type { Action, Actions, PageServerLoad } from './$types';
import type { discord, discord_register, launcher_system } from '@prisma/client/edge';
import { error, fail } from '@sveltejs/kit';
import { DateTime } from 'luxon';
import { Buffer } from 'node:buffer'; // Node.jsとの互換性により、追加しないと「ReferenceError: Buffer is not defined」が発生する
import { R2_BNR_UNIQUE_URL } from '$env/static/private';
import {
    DistributionCategoryObj,
    BinaryTypesArray,
    type BinaryTypes,
    type Distribution,
    type DistributionCategoryName,
    type PaginatedUsersResult,
    type R2AssetsJsonData,
    type CharacterEditableItemType,
    type DistributionEditableItemType,
    type InfoType,
    type Information,
    type InformationEditableItemType,
    type UserEditableItemType,
} from '$types';
import { getCourseByObjData, deleteFileViaApi, discordLinkConvertor, conv2DArrayToObject, uploadFileViaApi, isNumber, ManageDistribution, getDistributionUpdatedValue } from '$utils/client';
import ServerData, { db, editName, getPaginatedAllianceData, getPaginatedClanData, getPaginationMeta, IsCharLogin, PostgresManager } from '$utils/server';

const emptyMsg = 'Input value is empty.';
const requiredMsg = 'Required field is empty.';

export const load: PageServerLoad = async ({ url, locals: { LL, authUsername }, platform }) => {
    const r2Response = await platform?.env.R2.get('EquipItemsEn.json');
    if (!r2Response) {
        error(404, { message: '', message1: undefined, message2: ['No r2-assets found.'], message3: undefined });
    }

    const r2JsonData = (await r2Response.json()) as R2AssetsJsonData;

    const sql = new PostgresManager('transactions', 'initAdmin');
    const { launcherSystem, information, banners, distributions, charIdNamePair } = await sql.execute();

    // 管理者確認
    if (!url.origin.includes('localhost')) {
        const isAdmin: boolean = launcherSystem['rain_admins'].includes(authUsername);

        if (!isAdmin) {
            error(403, { message: '', message1: undefined, message2: undefined, message3: LL.error['adminForbidden']() });
        }
    }

    return {
        launcherSystem,
        information,
        banners,
        distributions,
        r2JsonData,
        charIdNamePair,
    };
};

const updateSystemMode: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    let column = Object.keys(data)[0] as keyof Omit<launcher_system, 'id'> | 'client_data_0' | 'client_data_1';
    let value = Object.values(data)[0] as string;

    if ((column === 'client_data_0' || column === 'rain_admins') && !value) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    }

    // client_dataカラム
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

const createInformation: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const title = data.title;
    const url = data.url;
    const type = data.type as InfoType;

    if (!title || !type) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: requiredMsg });
    }

    try {
        const sql = new PostgresManager('create', 'information', { title, url: url.indexOf('discord.com') ? discordLinkConvertor(url) : url, type });
        const createdInformation: Information = await sql.execute();

        return {
            success: true,
            message: `The information data (Title: ${createdInformation.title}) has been successfully created.`,
            createdInformation,
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

const updateInformation: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const infoId = Number(data.info_id);
    const column = Object.keys(data)[1] as InformationEditableItemType;
    const value = Object.values(data)[1] as string | null;

    // url以外は空送信不可
    if (!value && column !== 'url') {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    }

    try {
        const sql = new PostgresManager('update', 'information', { infoId, column, value });
        await sql.execute();

        return {
            success: true,
            message: `The information data (ID: ${infoId}, Column: ${column}) has been successfully updated.`,
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

const deleteInformation: Action = async ({ request }) => {
    const data = await request.formData();
    const deleteInfoIds: number[] = String(data.get('selectedInformationId')).split(',').map(Number);

    try {
        const sql = new PostgresManager('delete', 'information', { deleteInfoIds });
        const deletedInfoTitles: string[] = await sql.execute();

        return {
            success: true,
            message: `The information data (Title: ${deletedInfoTitles.map((title) => title.replace(/~C(\d{2})/g, ''))}) has been successfully deleted.`,
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
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
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
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                    return fail(400, { error: true, message: 'Specify the user ID.' });
                }

                ids = data.specified_u_text.split('+').map(Number);
                delete data.specified_u_text;

                if (!Object.keys(data).length) {
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                    return fail(400, { error: true, message: 'You must select at least one course.' });
                }

                if (ids.length > 10) {
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
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
        filter_value: string;
        status: 'init' | 'back' | 'next';
        cursor: number;
    };

    if (!filter_value || !filter_param) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    } else if ((filter_param === 'user_id' || filter_param === 'character_id') && !isNumber(filter_value)) {
        // 数値に変換可能かどうか確認
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: `If "${filter_param}" is selected, no strings are allowed.` });
    }

    const sql = new PostgresManager('get', 'paginatedUsers', {
        filterParam: filter_param,
        filterValue: filter_value,
        status,
        cursor,
    });
    const result: PaginatedUsersResult = await sql.execute();

    // const { paginatedUsers, paginationMeta } = await (async () => {
    //     switch (status) {
    //         case 'init': {
    //             const paginatedUsers = await getPaginatedUserData(filter_param, filter_value, 'init', 5);

    //             const nextCursor = paginatedUsers[4]?.id || 0;
    //             const paginationMeta = await getPaginationMeta(filter_param, filter_value, 0, nextCursor);

    //             return { paginatedUsers, paginationMeta };
    //         }

    //         case 'back':
    //         case 'next': {
    //             const paginatedUsers = await getPaginatedUserData(filter_param, filter_value, 'back', status === 'back' ? -5 : 5, Number(cursor), 1);

    //             const prevCursor = paginatedUsers[0]?.id || 0;
    //             const nextCursor = paginatedUsers[4]?.id || 0;
    //             const paginationMeta = await getPaginationMeta(filter_param, filter_value, prevCursor, nextCursor);

    //             return { paginatedUsers, paginationMeta };
    //         }

    //         default: {
    //             error(400, { message: '', message1: '', message2: ['Invalid status.'], message3: undefined });
    //         }
    //     }
    // })();

    if (!result.users.length) {
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

    return { searchResult: result };
};

const getPaginatedClans: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { filter_param, filter_value, status, cursor } = data as { filter_param: 'clan_name' | 'clan_id'; filter_value: string; status: string; cursor: number };

    if (!filter_value || !filter_param) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    } else if (filter_param === 'clan_id' && !isNumber(filter_value)) {
        // 数値に変換可能かどうか確認
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
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
                error(400, { message: '', message1: '', message2: ['Invalid status.'], message3: undefined });
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
    const { filter_param, filter_value, status, cursor } = data as { filter_param: 'alliance_name' | 'alliance_id'; filter_value: string; status: string; cursor: number };

    if (!filter_value || !filter_param) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    } else if (filter_param === 'alliance_id' && !isNumber(filter_value)) {
        // 数値に変換可能かどうか確認
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
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
                error(400, { message: '', message1: '', message2: ['Invalid status.'], message3: undefined });
            }
        }
    })();

    const clanNames = await db.guilds.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            id: 'asc',
        },
    });
    const nameArr = clanNames.map((clan) => `[${clan.id}] - ${clan.name}`) as string[];

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
    const column = Object.keys(data)[1] as UserEditableItemType;
    const value = Object.values(data)[1] as string | number;
    let rightsData: Record<string, any> = {};

    if (!value) {
        switch (column) {
            case 'username':
            case 'password':
            case 'return_expires': {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
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
            message: `The user data (Column: ${column}) has been successfully updated.`,
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
    const form = await request.formData();
    const data = conv2DArrayToObject([...form.entries()]);
    const id = Number(data.character_id);
    const column = Object.keys(data)[2] as CharacterEditableItemType;
    const value = Object.values(data)[2] as string | number;

    switch (column) {
        case 'name': {
            const bountyCoin = Number(data.bounty_coin);
            if (!data.discord_id) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                return fail(400, { error: true, message: "This character isn't linked to a discord account." });
            } else if (bountyCoin < 50000) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                return fail(400, { error: true, message: `Insufficient bounty coins (Owned: ${bountyCoin}).` });
            }

            const { success, message } = await editName(id, String(value), bountyCoin);
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

        case 'reupload_binary': {
            const files = form.getAll('file');
            const binaryData: { [key in BinaryTypes]?: ArrayBuffer } = {};

            // ファイル未選択時
            if (files.length === 1 && !(files[0] as File).name && !(files[0] as File).size) {
                return fail(400, { error: true, message: 'No file selected.' });
            }

            for (const file of files) {
                const f = file as File;
                const fileName = f.name.split('.')[0] as BinaryTypes; // 「.bin」より前の部分を取り出す（カラム名と一致）

                // ファイル名がBinaryTypes型に一致しない時
                if (!Object.values(BinaryTypesArray).includes(fileName)) {
                    return fail(400, { error: true, message: `Invalid file name: ${fileName}.` });
                }

                // ファイル名重複時
                if (binaryData.hasOwnProperty(fileName)) {
                    return fail(400, { error: true, message: `Duplicate file name: ${fileName}.` });
                }

                const arrayBuffer = await f.arrayBuffer();
                binaryData[fileName] = arrayBuffer;
            }

            const sql = new PostgresManager('update', 'characterBinary', { charId: id, binaryData });
            await sql.execute();

            return {
                success: true,
                message: `The binary data (${Object.keys(binaryData).join(', ')}) has been successfully updated.`,
            };
        }

        default: {
            error(400, { message: '', message1: '', message2: [`Unsupported data type: ${column}.`], message3: undefined });
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
            message: `The user account (Username: ${username}) has been successfully deleted.`,
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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    }

    const { success, message, suspendedAccount } = await db.users.suspend(Number(user_id), username, Number(reason_type), permanently_del === 'on', zoneName, until_at);
    if (!success || !suspendedAccount) {
        return fail(400, { error: true, message });
    } else {
        return {
            success: true,
            message: `The user account (Username: ${username}) has been successfully suspended. (Restorable)`,
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
            message: `The user account (Username: ${username}) has been successfully unsuspended.`,
        };
    }
};

const createBnrData: Action = async ({ request, url }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { ja_file, en_file, bnr_name } = data as { ja_file: File; en_file: File; bnr_name: string };
    let bnr_url = data.bnr_url as string | null;

    // ファイル存在確認
    if (ja_file.size === 0 || en_file.size === 0 || !bnr_name) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: `Failed to upload the files. ${requiredMsg} ` });
    }

    // ファイル名検証
    if (ja_file.name !== `${bnr_name}_ja.png` || en_file.name !== `${bnr_name}_en.png`) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: 'Failed to upload the files. Invalid file name' });
    }

    // ファイル対応検証
    if (ja_file.type !== 'image/png' || en_file.type !== 'image/png') {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: 'Failed to upload the files. Invalid type of file.' });
    }

    // url変換
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

        return { success: true, message: `The banner data (Banner Name: ${bnr_name}) has been successfully created.`, createdBnr };
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

            return { success: true, message: `The banner data (ID: ${bnr_id}, Column: ${column}) has been successfully updated.` };
        } else {
            // ファイル存在確認
            if (file.size === 0 || !bnr_name || !lang) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                return fail(400, { error: true, message: "Failed to re-upload the files. You haven't selected an image to update." });
            }

            // ファイル名検証
            if (file.name !== `${bnr_name}_${lang}.png`) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                return fail(400, { error: true, message: 'Failed to re-upload the files. Invalid file name' });
            }

            // ファイル対応検証
            if (file.type !== 'image/png') {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                return fail(400, { error: true, message: 'Failed to re-upload the files. Invalid type of file.' });
            }

            // ファイル削除/アップロード
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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    }

    /**
     * ディスコードアカウント連携OK例
     *
     * 「未連携キャラクターA（ユーザーA）」に、「未連携ディスコードA」を連携
     * 　-> 新規連携
     *
     * 「ディスコードAと連携済みキャラクターA（連携済みユーザーA）」の状態で、「ディスコードAを未連携キャラクターB（連携済みユーザーA）」に再連携（キャラクターA（連携済みユーザーA）は連携解除）
     * 　-> 同一ユーザー内の異なるキャラクター間でディスコード連携の切り替えが可能（/switchコマンドと同様）
     *
     * 「ディスコードAと連携済みキャラクターA（連携済みユーザーA）」の状態で、「ディスコードAを未連携キャラクターA（未連携ユーザーB）」に再連携（キャラクターA（連携済みユーザーA）は連携解除）
     * 　-> 再連携先ユーザーが未連携である場合のみ、異なるユーザー間でディスコード連携の切り替えが可能
     */

    /**
     * ディスコードアカウント連携NG例
     *
     * 「未連携ディスコードA」もしくは「ディスコードAと連携済みキャラクターA（連携済みユーザーA）」の状態で、「ディスコードAを未連携キャラクターA（ディスコードBと連携済みユーザーB）」に再連携
     * 　-> 再連携先ユーザーが連携済みである場合は、ディスコード連携の切り替えが不可能
     */

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

        // discord (character)
        const discord: discord | null = await ServerData.getLinkedCharactersByDiscordId(discord_id);
        if (discord) {
            await db.discord.update({
                where: {
                    discord_id,
                },
                data: {
                    char_id: Number(char_id),
                },
            });
        } else {
            await db.discord.create({
                data: {
                    char_id: Number(char_id),
                    discord_id,
                },
            });
        }

        return {
            success: true,
            message: `The character (Character ID: ${char_id}) has been successfully linked to the discord account (Discord ID: ${discord_id}).`,
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

    const { success, message } = await db.guilds.rebuild(Number(clan_id), clan_name);
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
    const { alliance_id, first_clan, second_clan } = data as { alliance_id: number; first_clan: string | null; second_clan: string | null };
    let clan1Id: number, clan1Name: string, clan2Id: number, clan2Name: string;

    if (!first_clan && !second_clan) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: 'The first clan must be set at least.' });
    } else if (first_clan === second_clan) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: 'The first and second clans must be different from each other.' });
    } else if (!first_clan && second_clan) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: 'Before setting the second clan, the first clan must be set.' });
    }

    // 第１加入猟団
    const match1 = first_clan!.match(/\[(\d+)\] - (.+)/);
    if (match1) {
        clan1Id = Number(match1[1]);
        clan1Name = match1[2];
    } else {
        // 第１加入猟団はセット必須であり、正規表現には必ずマッチすると想定する
        // マッチしないということは通常起こりえないため、エラーを返す
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: `String format is invalid: ${first_clan}` });
    }

    // 第２加入猟団
    const match2 = second_clan?.match(/\[(\d+)\] - (.+)/);
    if (match2) {
        clan2Id = Number(match2[1]);
        clan2Name = match2[2];
    } else {
        // 第２加入猟団はセットしない可能性があり、その際は正規表現にマッチしないため、初期値を代入
        clan2Id = 0;
        clan2Name = '';
    }

    try {
        // 第１加入猟団が所属している同盟データ
        const clan1JoinedAll = await db.guild_alliances.findFirst({
            where: {
                OR: [{ parent_id: clan1Id }, { sub1_id: clan1Id }, { sub2_id: clan1Id }],
            },
            select: {
                id: true,
                name: true,
            },
        });

        // 第２加入猟団が所属している同盟データ
        const clan2JoinedAll = await db.guild_alliances.findFirst({
            where: {
                OR: [{ parent_id: clan2Id }, { sub1_id: clan2Id }, { sub2_id: clan2Id }],
            },
            select: {
                id: true,
                name: true,
            },
        });

        // 所属同盟重複チェック
        // 各加入猟団がどこかの同盟に所属していて、それが現在編集中の同盟でない場合は重複所属になるのでエラー
        if (clan1JoinedAll && clan1JoinedAll.id !== Number(alliance_id)) {
            return fail(400, { error: true, message: `The selected 1st clan has already joined the alliance (Name: ${clan1JoinedAll.name}).` });
        } else if (clan2JoinedAll && clan2JoinedAll.id !== Number(alliance_id)) {
            return fail(400, { error: true, message: `The selected 2nd clan has already joined the alliance (Name: ${clan2JoinedAll.name}).` });
        }

        await db.guild_alliances.update({
            where: {
                id: Number(alliance_id),
            },
            data: {
                sub1_id: clan1Id,
                sub2_id: clan2Id || null, // 第２加入猟団はnullの可能性がある
            },
        });

        const updatedAllianceData = {
            id: Number(alliance_id),
            firstChildClan: clan1Name,
            secondChildClan: clan2Name,
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

const downloadBinary: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);

    if (data.result === 'S') {
        return {
            success: true,
            message: 'The binary data has been successfully downloaded.',
        };
    } else {
        return fail(400, {
            error: true,
            message: "The download failed for one of the following reasons:<br />ー The character doesn't exist.<br />ー All binary data are NULL.<br />ー Couldn't access API server.",
        });
    }
};

const updateDistribution: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const distId = Number(data.dist_id);
    const column = Object.keys(data)[1] as DistributionEditableItemType;
    const value = Object.values(data)[1] as string | null;

    // deadlineとcharacter_id以外は空送信不可
    if (!value && column !== 'deadline' && column !== 'character_id') {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    }

    // dataカラムの場合、配布コンテンツデータのみにする
    if (column === 'data') {
        delete data.dist_id;
        delete data.data;
    }

    try {
        if (column !== 'data') {
            const sql = new PostgresManager('update', 'distribution', { distId, column, value });
            await sql.execute();

            return {
                success: true,
                message: `The distribution data (ID: ${distId}, Column: ${column}) has been successfully updated.`,
            };
        } else {
            const contentsData = ManageDistribution.getHexString(data);
            if (!contentsData) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
                return fail(400, { error: true, message: 'Failed to get contents data.<br />Source data format is invalid.' });
            }

            const sql = new PostgresManager('update', 'distribution', { distId, column, value: contentsData });
            await sql.execute();

            return {
                success: true,
                message: `The distribution data (ID: ${distId}, Column: ${column}) has been successfully updated.`,
                updatedContentsData: contentsData,
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

const deleteDistribution: Action = async ({ request }) => {
    const data = await request.formData();
    const deleteDistIds: number[] = String(data.get('selectedDistributionId')).split(',').map(Number);

    try {
        const sql = new PostgresManager('delete', 'distributions', { deleteDistIds });
        const deletedDistTitles: string[] = await sql.execute();

        return {
            success: true,
            message: `The distribution data (Title: ${deletedDistTitles.map((title) => title.replace(/~C(\d{2})/g, ''))}) has been successfully deleted.`,
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

const createDistribution: Action = async ({ request }) => {
    let data = conv2DArrayToObject([...(await request.formData()).entries()]);

    // 必須項目空欄エラー
    if (!data.type || !data.event_name || !data.description || !data.times_acceptable) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
        return fail(400, { error: true, message: emptyMsg });
    }

    const charId = Number(data.character_id);
    const category = DistributionCategoryObj[data.category as DistributionCategoryName];
    const deadline = !data.deadline ? null : DateTime.fromISO(data.deadline).setZone('utc').toJSDate(); // data.deadlineは現地時間なので、UTCに変換して保存（ゲーム内では+9日本時間に変換される）
    //const title = convertColorString('colorNum', data.event_name, 'event_name');
    const title = data.event_name.replace(/ /g, ' '); // スペースのバグ（16進数：20ではなくなぜか803Fになる）を修正する
    //const description = convertColorString('colorNum', data.description, 'description');
    const description = data.description.replace(/ /g, ' '); // スペースのバグ（16進数：20ではなくなぜか803Fになる）を修正する
    const remaining = Number(data.times_acceptable);
    const minHr = Number(data.min_hr) === 0 ? 65535 : Number(data.min_hr);
    const maxHr = Number(data.max_hr) === 0 ? 65535 : Number(data.max_hr);
    const minGr = Number(data.min_gr) === 0 ? 65535 : Number(data.min_gr);
    const maxGr = Number(data.max_gr) === 0 ? 65535 : Number(data.max_gr);

    try {
        const keysToRemove = ['type', 'deadline', 'zonename', 'event_name', 'description', 'times_acceptable', 'character_id', 'min_hr', 'max_hr', 'min_gr', 'max_gr'];

        data = Object.keys(data)
            .filter((key) => !keysToRemove.includes(key))
            .reduce(
                (obj, key) => {
                    obj[key] = data[key];
                    return obj;
                },
                {} as { [key: string]: string },
            ); // 配布コンテンツデータ以外を削除
        const contentsData = ManageDistribution.getHexString(data);
        if (!contentsData) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
            return fail(400, { error: true, message: 'Failed to get contents data.<br />Source data format is invalid.' });
        }

        const base64 = Buffer.from(contentsData, 'hex').toString('base64');

        const sql = new PostgresManager('create', 'distribution', { charId, category, deadline, title, description, remaining, minHr, maxHr, minGr, maxGr, base64 });
        const createdDistribution: Distribution = await sql.execute();

        return {
            success: true,
            message: `The distribution data (Title: ${title.replace(/~C(\d{2})/g, '')}) has been successfully created.`,
            createdDistribution,
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

const deleteClaimedDistribution: Action = async ({ request }) => {
    const data = await request.formData();
    const charId = Number(data.get('charId'));
    const deleteDistIds: number[] = String(data.get('selectedDistributionId')).split(',').map(Number);

    try {
        const sql = new PostgresManager('delete', 'claimedDistributions', { charId, deleteDistIds });
        const deletedDistTitles: string[] = await sql.execute();

        return { success: true, message: `The distribution data (Title: ${deletedDistTitles.map((title) => title.replace(/~C(\d{2})/g, ''))}) has been successfully deleted.` };
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
    createInformation,
    updateInformation,
    deleteInformation,
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
    downloadBinary,
    updateDistribution,
    deleteDistribution,
    createDistribution,
    deleteClaimedDistribution,
};
