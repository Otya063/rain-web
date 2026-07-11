import type { Action, Actions, PageServerLoad } from './$types';
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
    type R2AssetsJsonData,
    type CharacterEditableItemType,
    type DistributionEditableItemType,
    type UserEditableItemType,
    type User,
    type LauncherSystem,
    type RainServerEditableItemType,
} from '$types';
import { getCourseByObjData, discordLinkConvertor, conv2DArrayToObject, isNumber, ManageDistribution, convHrToHrp } from '$utils/client';
import { checkBannerImage, deleteBannerFromR2, PostgresManager, uploadBannerToR2 } from '$utils/server';

const emptyMsg = 'Input value is empty.';
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)); // タイマー実行中に送信するとメッセージが即座に消えるのを防ぐ
const DEFAULT_RAIN_SERVER_PORT = '8080';
const DEFAULT_RAIN_SERVER_ENTRANCE_PORT = '53310';

export const load: PageServerLoad = async ({ platform }) => {
    const r2Response = await platform?.env.R2.get('EquipItemsEn.json');
    if (!r2Response) {
        error(404, { message: '', message1: undefined, message2: ['No r2-assets found.'], message3: undefined });
    }

    const r2JsonData = (await r2Response.json()) as R2AssetsJsonData;

    const { launcherSystem, rainServers, banners, distributions, charIdNamePair } = await new PostgresManager('transactions', 'initAdmin').execute();

    return {
        launcherSystem,
        rainServers,
        banners,
        distributions,
        r2JsonData,
        charIdNamePair,
    };
};

const updateSystemMode: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const column = Object.keys(data)[0] as keyof Omit<LauncherSystem, 'id'>;
    const value = Object.values(data)[0] as string;

    try {
        await new PostgresManager('update', 'launcherSystem', { column, value }).execute();

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

const createRainServer: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { name, host, port, entrance_port } = data as { name: string; host: string; port: string; entrance_port: string };

    if (!name || !host) {
        await delay(1000);
        return fail(400, { error: true, message: emptyMsg });
    }

    try {
        const createdRainServer = await new PostgresManager('create', 'rainServer', {
            name,
            host,
            port: Number(port || DEFAULT_RAIN_SERVER_PORT),
            entrancePort: Number(entrance_port || DEFAULT_RAIN_SERVER_ENTRANCE_PORT),
        }).execute();

        return {
            success: true,
            message: `The server (Name: ${name}) has been successfully created.`,
            createdRainServer,
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

const updateRainServer: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const id = Number(data.server_id);
    const column = Object.keys(data)[1] as RainServerEditableItemType;
    let value = Object.values(data)[1] as string;

    if (!value) {
        if (column === 'port') {
            value = DEFAULT_RAIN_SERVER_PORT;
        } else if (column === 'entrance_port') {
            value = DEFAULT_RAIN_SERVER_ENTRANCE_PORT;
        } else {
            await delay(1000);
            return fail(400, { error: true, message: emptyMsg });
        }
    }

    try {
        await new PostgresManager('update', 'rainServer', { id, column, value }).execute();

        return {
            success: true,
            message: `The server data (ID: ${id}, Column: ${column}) has been successfully updated.`,
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

const updateRainServerMaintenance: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const id = Number(data.server_id);
    const value = String(data.maintenance);

    try {
        await new PostgresManager('update', 'rainServerMaintenance', { id, value }).execute();

        return {
            success: true,
            message: `The server (ID: ${id}) maintenance mode has been successfully updated (${value === 'true' ? 'Enable' : 'Disable'}).`,
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

const deleteRainServer: Action = async ({ request }) => {
    const data = await request.formData();
    const deleteServerIds: number[] = String(data.get('selectedServerId')).split(',').map(Number);
    const deleteServerNames: string[] = String(data.get('selectedServerName')).split(',');

    try {
        await new PostgresManager('delete', 'rainServer', { deleteServerIds }).execute();

        return {
            success: true,
            message:
                deleteServerIds.length === 1
                    ? `The server (Name: ${deleteServerNames[0]}) has been successfully deleted.`
                    : `${deleteServerIds.length} servers have been successfully deleted.`,
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

// const createInformation: Action = async ({ request }) => {
//     const data = conv2DArrayToObject([...(await request.formData()).entries()]);
//     const title = data.title;
//     const url = data.url;
//     const type = data.type as InfoType;

//     if (!title || !type) {
//         await delay(1000);
//         return fail(400, { error: true, message: emptyMsg });
//     }

//     try {
//         const createdInformation: Information = await new PostgresManager('create', 'information', { title, url: url.indexOf('discord.com') ? discordLinkConvertor(url) : url, type }).execute();

//         return {
//             success: true,
//             message: `The information data (Title: ${createdInformation.title}) has been successfully created.`,
//             createdInformation,
//         };
//     } catch (err) {
//         if (err instanceof Error) {
//             return fail(400, { error: true, message: err.message });
//         } else if (typeof err === 'string') {
//             return fail(400, { error: true, message: err });
//         } else {
//             return fail(400, { error: true, message: 'Unexpected Error' });
//         }
//     }
// };

// const updateInformation: Action = async ({ request }) => {
//     const data = conv2DArrayToObject([...(await request.formData()).entries()]);
//     const infoId = Number(data.info_id);
//     const column = Object.keys(data)[1] as InformationEditableItemType;
//     const value = Object.values(data)[1] as string | null;

//     // url以外は空送信不可
//     if (!value && column !== 'url') {
//         await delay(1000);
//         return fail(400, { error: true, message: emptyMsg });
//     }

//     try {
//         await new PostgresManager('update', 'information', { infoId, column, value }).execute();

//         return {
//             success: true,
//             message: `The information data (ID: ${infoId}, Column: ${column}) has been successfully updated.`,
//         };
//     } catch (err) {
//         if (err instanceof Error) {
//             return fail(400, { error: true, message: err.message });
//         } else if (typeof err === 'string') {
//             return fail(400, { error: true, message: err });
//         } else {
//             return fail(400, { error: true, message: 'Unexpected Error' });
//         }
//     }
// };

// const deleteInformation: Action = async ({ request }) => {
//     const data = await request.formData();
//     const deleteInfoIds: number[] = String(data.get('selectedInformationId')).split(',').map(Number);

//     try {
//         const deletedInfoTitles: string[] = await new PostgresManager('delete', 'information', { deleteInfoIds }).execute();

//         return {
//             success: true,
//             message: `The information data (Title: ${deletedInfoTitles}) has been successfully deleted.`,
//         };
//     } catch (err) {
//         if (err instanceof Error) {
//             return fail(400, { error: true, message: err.message });
//         } else if (typeof err === 'string') {
//             return fail(400, { error: true, message: err });
//         } else {
//             return fail(400, { error: true, message: 'Unexpected Error' });
//         }
//     }
// };

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
                    await delay(1000);
                    return fail(400, { error: true, message: 'You must choose at least one course.' });
                }

                await new PostgresManager('update', 'courseControl', { rights: getCourseByObjData(data) }).execute();

                return {
                    success: true,
                    message: "All users' rights have been successfully updated.",
                };
            }

            case 'specified': {
                if (!data.specified_u_text) {
                    await delay(1000);
                    return fail(400, { error: true, message: 'Specify the user ID.' });
                }

                ids = data.specified_u_text.split('+').map(Number);
                delete data.specified_u_text;

                if (!Object.keys(data).length) {
                    await delay(1000);
                    return fail(400, { error: true, message: 'You must select at least one course.' });
                }

                if (ids.length > 10) {
                    await delay(1000);
                    return fail(400, { error: true, message: 'No more than 10 users can be specified.' });
                }

                await new PostgresManager('update', 'courseControl', { rights: getCourseByObjData(data), userIds: ids }).execute();

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
    const { filter_param, filter_value } = data as {
        filter_param: 'username' | 'character_name' | 'user_id' | 'character_id';
        filter_value: string;
    };

    if (!filter_value || !filter_param) {
        await delay(1000);
        return fail(400, { error: true, message: emptyMsg });
    } else if ((filter_param === 'user_id' || filter_param === 'character_id') && !isNumber(filter_value)) {
        // 数値に変換可能かどうか確認
        await delay(1000);
        return fail(400, { error: true, message: `If "${filter_param}" is selected, no strings are allowed.` });
    }

    const searchedUsers: User[] | [null] = await new PostgresManager('get', 'paginatedUsers', { filterParam: filter_param, filterValue: filter_value }).execute();
    if (!searchedUsers.length) {
        return fail(400, {
            error: true,
            message:
                filter_param === 'username'
                    ? `The user(s) with the entered username (${filter_value}) doesn't exist.`
                    : filter_param === 'character_name'
                      ? `The character(s) with the entered character name (${filter_value}) doesn't exist.`
                      : `The account with the entered ${filter_param} (${filter_value}) doesn't exist.`,
        });
    } else if (!searchedUsers[0]) {
        // 1000件以上のデータがある場合（[null]）は、エラーを返す
        return fail(400, {
            error: true,
            message: 'Too many results. Please narrow down the search criteria.',
        });
    }

    return { searchedUsers };
};

const getPaginatedClans: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { filter_param, filter_value } = data as { filter_param: 'clan_name' | 'clan_id'; filter_value: string };

    if (!filter_value || !filter_param) {
        await delay(1000);
        return fail(400, { error: true, message: emptyMsg });
    } else if (filter_param === 'clan_id' && !isNumber(filter_value)) {
        await delay(1000);
        return fail(400, { error: true, message: `If "${filter_param}" is selected, no strings are allowed.` });
    }

    const searchedClans = await new PostgresManager('get', 'paginatedClans', { filterParam: filter_param, filterValue: filter_value }).execute();

    if (!searchedClans.length) {
        return fail(400, {
            error: true,
            message: `The clan with the entered ${filter_param} (${filter_value}) doesn't exist.`,
        });
    } else if (!searchedClans[0]) {
        return fail(400, { error: true, message: 'Too many results. Please narrow down the search criteria.' });
    }

    return { searchedClans };
};

const getPaginatedAlliances: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { filter_param, filter_value } = data as { filter_param: 'alliance_name' | 'alliance_id'; filter_value: string };

    if (!filter_value || !filter_param) {
        await delay(1000);
        return fail(400, { error: true, message: emptyMsg });
    } else if (filter_param === 'alliance_id' && !isNumber(filter_value)) {
        await delay(1000);
        return fail(400, { error: true, message: `If "${filter_param}" is selected, no strings are allowed.` });
    }

    const { alliances: searchedAlliances, clanNames } = await new PostgresManager('get', 'paginatedAlliances', { filterParam: filter_param, filterValue: filter_value }).execute();

    if (!searchedAlliances.length) {
        return fail(400, {
            error: true,
            message: `The alliance with the entered ${filter_param} (${filter_value}) doesn't exist.`,
        });
    } else if (!searchedAlliances[0]) {
        return fail(400, { error: true, message: 'Too many results. Please narrow down the search criteria.' });
    }

    return { searchedAlliances, clanNames };
};

const updateUser: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const id = Number(data.user_id);
    const column = Object.keys(data)[1] as UserEditableItemType;
    const value = Object.values(data)[1] as string | number;
    let rightsData: Record<string, any> = {};

    if (!value) {
        switch (column) {
            case 'username':
            case 'password':
            case 'return_expires': {
                await delay(1000);
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

    const dbValue =
        column === 'rights'
            ? getCourseByObjData(rightsData)
            : column === 'return_expires'
              ? DateTime.fromISO(String(value)).setZone('utc').toString()! // valueは現地時間なので、UTCに変換して保存
              : ['frontier_points', 'gacha_premium', 'gacha_trial'].includes(column)
                ? !value
                    ? null
                    : Number(value)
                : ['psn_id', 'wiiu_key'].includes(column) && !value
                  ? null
                  : value;

    try {
        await new PostgresManager('update', 'user', { id, column, value: dbValue }).execute();

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

const updateCharacter: Action = async ({ request }) => {
    const form = await request.formData();
    const data = conv2DArrayToObject([...form.entries()]);
    const id = Number(data.character_id);
    const column = Object.keys(data)[2] as CharacterEditableItemType;
    const value = Object.values(data)[2] as string | number;

    switch (column) {
        case 'name': {
            const bountyCoin = Number(data.bounty_coin);
            if (!data.discord_id) {
                await delay(1000);
                return fail(400, { error: true, message: "This character isn't linked to a discord account." });
            } else if (bountyCoin < 50000) {
                await delay(1000);
                return fail(400, { error: true, message: `Insufficient bounty coins (Owned: ${bountyCoin}).` });
            }

            const { success, message } = await new PostgresManager('update', 'charName', { charId: id, newName: String(value), bountyCoin }).execute();
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
                await new PostgresManager('update', 'bounty', { charId: id, amount: Number(value) }).execute();

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
                await new PostgresManager('update', 'leaveClan', { charId: id, clanId, isLastMember: clanCharNum - 1 === 0 }).execute();

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
                await delay(1000);
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

            await new PostgresManager('update', 'characterBinary', { charId: id, binaryData }).execute();

            return {
                success: true,
                message: `The binary data (${Object.keys(binaryData).join(', ')}) has been successfully updated.`,
            };
        }

        default: {
            await delay(1000);
            error(400, { message: '', message1: '', message2: [`Unsupported data type: ${column}.`], message3: undefined });
        }
    }
};

const deleteUsers: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);

    const userIds: number[] = data.user_ids ? JSON.parse(String(data.user_ids)).map(Number) : [Number(data.user_id)];
    const usernames: string[] = data.usernames ? JSON.parse(String(data.usernames)) : [String(data.username)];

    try {
        await new PostgresManager('delete', 'users', { userIds }).execute();

        return {
            success: true,
            message: userIds.length === 1 ? `The user account (Username: ${usernames[0]}) has been successfully deleted.` : `${userIds.length} user accounts have been successfully deleted.`,
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

const suspendUsers: Action = async ({ request, locals }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const zoneName = String(data.zoneName);

    // user_ids JSON配列が存在する場合は複数ユーザー、そうでなければ単一ユーザー
    const userIds: number[] = data.user_ids ? JSON.parse(String(data.user_ids)).map(Number) : [Number(data.user_id)];
    const usernames: string[] = data.usernames ? JSON.parse(String(data.usernames)) : [String(data.username)];

    // reason_type_0 が存在する場合はユーザーごとに個別設定された複数ユーザーモード
    const isPerUserMode = data.reason_type_0 !== undefined;

    let entries: { userId: number; username: string; reasonType: number; permanent: boolean; untilAt?: string; otherReason?: string }[];

    if (isPerUserMode) {
        for (let i = 0; i < userIds.length; i++) {
            if (!data[`reason_type_${i}`] || (data[`permanent_${i}`] !== 'on' && !data[`until_at_${i}`]) || (Number(data[`reason_type_${i}`]) === 0 && !data[`other_reason_${i}`])) {
                await delay(1000);

                return fail(400, { error: true, message: emptyMsg });
            }
        }

        entries = userIds.map((userId, i) => ({
            userId,
            username: usernames[i],
            reasonType: Number(data[`reason_type_${i}`]),
            permanent: data[`permanent_${i}`] === 'on',
            untilAt: data[`until_at_${i}`] ? String(data[`until_at_${i}`]) : undefined,
            otherReason: data[`other_reason_${i}`] ? String(data[`other_reason_${i}`]) : undefined,
        }));
    } else {
        const { reason_type, permanently_del, until_at, other_reason } = data as { reason_type: number; permanently_del: string; until_at?: string; other_reason?: string };

        if (!reason_type || (permanently_del !== 'on' && !until_at) || (Number(reason_type) === 0 && !other_reason)) {
            await delay(1000);

            return fail(400, { error: true, message: emptyMsg });
        }

        entries = userIds.map((userId, i) => ({
            userId,
            username: usernames[i],
            reasonType: Number(reason_type),
            permanent: permanently_del === 'on',
            untilAt: until_at ? String(until_at) : undefined,
            otherReason: other_reason ? String(other_reason) : undefined,
        }));
    }

    try {
        await new PostgresManager('update', 'suspendUsers', { entries, zoneName, byWhom: locals.adminUserId }).execute();

        return {
            success: true,
            message: userIds.length === 1 ? `The user account (Username: ${usernames[0]}) has been successfully suspended.` : `${userIds.length} user accounts have been successfully suspended.`,
            suspendedBy: locals.adminUserId !== null ? { id: locals.adminUserId, username: locals.adminUsername } : null,
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

const unsuspendUsers: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const userIds: number[] = data.user_ids ? JSON.parse(String(data.user_ids)).map(Number) : [Number(data.user_id)];
    const usernames: string[] = data.usernames ? JSON.parse(String(data.usernames)) : [String(data.username)];

    try {
        await new PostgresManager('update', 'unsuspendUsers', { userIds }).execute();

        return { success: true, message: `The user account (Username: ${usernames[0]}) has been successfully unsuspended.` };
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

const createBanner: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const bnrName = data.bnr_name;
    const jaFile = data.ja_file as File;
    const enFile = data.en_file as File;
    let bnrUrl = data.bnr_url as string | null;

    if (!jaFile.size || !enFile.size || !bnrName) {
        await delay(1000);
        return fail(400, { error: true, message: 'No file selected or banner name is empty.' });
    }

    if (jaFile.name !== `${bnrName}_ja.png` || enFile.name !== `${bnrName}_en.png`) {
        await delay(1000);
        return fail(400, { error: true, message: 'Invalid file name.<br />File name example: [name]_ja.png / [name]_en.png' });
    }

    const [jaResult, enResult] = await Promise.all([checkBannerImage(jaFile), checkBannerImage(enFile)]);
    if (!jaResult.success) {
        await delay(1000);
        return fail(400, { error: true, message: `Failed to create Japanese banner.<br />${jaResult.error}` });
    }
    if (!enResult.success) {
        await delay(1000);
        return fail(400, { error: true, message: `Failed to create English banner.<br />${enResult.error}` });
    }

    bnrUrl = !bnrUrl ? null : bnrUrl.indexOf('discord.com') ? discordLinkConvertor(bnrUrl) : bnrUrl;

    try {
        await Promise.all([uploadBannerToR2(jaFile, 'ja'), uploadBannerToR2(enFile, 'en')]);

        const createdBanner = await new PostgresManager('create', 'banner', {
            bnrName,
            bnrUrl,
            jaImgSrc: `https://${R2_BNR_UNIQUE_URL}/ja/${jaFile.name}`,
            enImgSrc: `https://${R2_BNR_UNIQUE_URL}/en/${enFile.name}`,
        }).execute();

        return { success: true, message: `The banner (Name: ${bnrName}) has been successfully created.`, createdBanner };
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

const updateBanner: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const bnrId = Number(data.bnr_id);
    const bnrName = data.bnr_name;
    const jaFile = data.ja_file as File;
    const enFile = data.en_file as File;
    const file = !jaFile.size ? enFile : jaFile;
    const lang = !jaFile.size ? 'en' : 'ja';
    const isBnrUrlEdited = data.hasOwnProperty('bnr_url');
    const bnrUrl = isBnrUrlEdited ? data.bnr_url : '';

    try {
        if (!isBnrUrlEdited) {
            if (!file.size) {
                await delay(1000);
                return fail(400, { error: true, message: 'No file selected.' });
            }

            if (file.name !== `${bnrName}_${lang}.png`) {
                await delay(1000);
                return fail(400, { error: true, message: 'Invalid file name.<br />File name example: [name]_ja.png / [name]_en.png' });
            }

            const result = await checkBannerImage(file);
            if (!result.success) {
                await delay(1000);
                return fail(400, { error: true, message: result.error ?? 'Image validation failed.' });
            }

            await deleteBannerFromR2(file.name, lang);
            await uploadBannerToR2(file, lang);

            return { success: true, message: `The banner (ID: ${bnrId}) has been successfully re-uploaded.` };
        } else {
            await new PostgresManager('update', 'banner', { bnrId, value: !bnrUrl ? null : bnrUrl.indexOf('discord.com') ? discordLinkConvertor(bnrUrl) : bnrUrl }).execute();

            return { success: true, message: `The banner (ID: ${bnrId}, Column: bnr_url) has been successfully updated.` };
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

const deleteBanner: Action = async ({ request }) => {
    const data = await request.formData();
    const deleteBnrIds: number[] = String(data.get('selectedBannerId')).split(',').map(Number);
    const deleteBnrNames: string[] = String(data.get('selectedBannerName')).split(',');

    try {
        await Promise.all(deleteBnrNames.flatMap((bnrName) => [deleteBannerFromR2(`${bnrName}_ja.png`, 'ja'), deleteBannerFromR2(`${bnrName}_en.png`, 'en')]));

        await new PostgresManager('delete', 'banner', { deleteBnrIds }).execute();

        return { success: true, message: `The banner (Name: ${deleteBnrNames.join(', ')}) has been successfully deleted.` };
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
        await delay(1000);
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
        await new PostgresManager('update', 'linkDiscord', { userId: Number(user_id), charId: Number(char_id), discordId: discord_id }).execute();

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
        await new PostgresManager('delete', 'unlinkDiscord', { discordId: discord_id }).execute();

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
    const charId = Number(data.char_id);
    const charName = String(data.char_name);
    const permanent = data.permanently_del === 'on';

    try {
        await new PostgresManager('delete', 'character', { charId, permanent }).execute();

        return {
            success: true,
            message: permanent
                ? `The character (Character Name: ${charName}) has been permanently deleted. (Not Restorable)`
                : `The character (Character Name: ${charName}) has been successfully deleted.`,
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

const restoreCharacter: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const charId = Number(data.char_id);
    const charName = String(data.char_name);

    try {
        await new PostgresManager('update', 'restoreCharacter', { charId }).execute();

        return {
            success: true,
            message: `The character (Character Name: ${charName}) has been successfully restored.`,
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

const rebuildClans: Action = async ({ request }) => {
    const formData = await request.formData();
    const clanIds = formData
        .getAll('clan_ids')
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);

    if (!clanIds.length) {
        await delay(1000);
        return fail(400, { error: true, message: 'No clan IDs provided.' });
    }

    try {
        const results = await new PostgresManager('update', 'rebuildClans', { clanIds }).execute();

        return {
            success: true,
            message:
                results.length === 1
                    ? `The clan data (Name: ${results[0].name ?? 'Unknown'}, New ID: ${results[0].newId}) has been successfully rebuilt.`
                    : `${results.length} clan data have been successfully rebuilt.`,
            rebuiltClans: results,
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

const deleteClans: Action = async ({ request }) => {
    const formData = await request.formData();
    const clanIds = formData
        .getAll('clan_ids')
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);

    if (!clanIds.length) {
        await delay(1000);
        return fail(400, { error: true, message: 'No clan IDs provided.' });
    }

    try {
        await new PostgresManager('delete', 'deleteClans', { clanIds }).execute();

        return {
            success: true,
            message: clanIds.length === 1 ? 'The clan has been successfully deleted.' : `${clanIds.length} clans have been successfully deleted.`,
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

const deleteAlliances: Action = async ({ request }) => {
    const formData = await request.formData();
    const allianceIds = formData
        .getAll('alliance_ids')
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);

    if (!allianceIds.length) {
        await delay(1000);
        return fail(400, { error: true, message: 'No alliance IDs provided.' });
    }

    try {
        await new PostgresManager('delete', 'deleteAlliances', { allianceIds }).execute();

        return {
            success: true,
            message: allianceIds.length === 1 ? 'The alliance has been successfully deleted.' : `${allianceIds.length} alliances have been successfully deleted.`,
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

const updateAlliance: Action = async ({ request }) => {
    const data = conv2DArrayToObject([...(await request.formData()).entries()]);
    const { alliance_id, first_clan, second_clan } = data as { alliance_id: number; first_clan: string | null; second_clan: string | null };
    let clan1Id: number, clan1Name: string, clan2Id: number | null, clan2Name: string | null;

    if (!first_clan && !second_clan) {
        await delay(1000);
        return fail(400, { error: true, message: 'The first clan must be set at least.' });
    } else if (first_clan === second_clan) {
        await delay(1000);
        return fail(400, { error: true, message: 'The first and second clans must be different from each other.' });
    } else if (!first_clan && second_clan) {
        await delay(1000);
        return fail(400, { error: true, message: 'Before setting the second clan, the first clan must be set.' });
    }

    // 第１加入猟団（セット必須）
    const match1 = first_clan!.match(/\[(\d+)\] - (.+)/);
    if (match1) {
        clan1Id = Number(match1[1]);
        clan1Name = match1[2];
    } else {
        await delay(1000);
        return fail(400, { error: true, message: `String format is invalid: ${first_clan}` });
    }

    // 第２加入猟団（任意）
    const match2 = second_clan?.match(/\[(\d+)\] - (.+)/);
    if (match2) {
        clan2Id = Number(match2[1]);
        clan2Name = match2[2];
    } else {
        clan2Id = null;
        clan2Name = null;
    }

    try {
        await new PostgresManager('update', 'allianceData', {
            allianceId: Number(alliance_id),
            sub1Id: clan1Id,
            sub2Id: clan2Id,
        }).execute();

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
            message: data.error_message || 'Unexpected Error',
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
        await delay(1000);
        return fail(400, { error: true, message: emptyMsg });
    }

    // dataカラムの場合、配布コンテンツデータのみにする
    if (column === 'data') {
        delete data.dist_id;
        delete data.data;
    }

    try {
        if (column !== 'data') {
            await new PostgresManager('update', 'distribution', { distId, column, value }).execute();

            return {
                success: true,
                message: `The distribution data (ID: ${distId}, Column: ${column}) has been successfully updated.`,
            };
        } else {
            const contentsData = ManageDistribution.getHexString(data);
            if (!contentsData) {
                await delay(1000);
                return fail(400, { error: true, message: 'Failed to get contents data.<br />Source data format is invalid.' });
            }

            await new PostgresManager('update', 'distribution', { distId, column, value: contentsData }).execute();

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
        const deletedDistTitles: string[] = await new PostgresManager('delete', 'distributions', { deleteDistIds }).execute();

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
    if (!data.category || !data.event_name || !data.description || !data.times_acceptable) {
        await delay(1000);
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
    const minHr = Number(data.min_hr) === 0 ? null : convHrToHrp(Number(data.min_hr));
    const maxHr = Number(data.max_hr) === 0 ? null : convHrToHrp(Number(data.max_hr));
    const minGr = Number(data.min_gr) === 0 ? null : Number(data.min_gr);
    const maxGr = Number(data.max_gr) === 0 ? null : Number(data.max_gr);

    try {
        const keysToRemove = ['category', 'deadline', 'event_name', 'description', 'times_acceptable', 'character_id', 'min_hr', 'max_hr', 'min_gr', 'max_gr'];

        data = Object.fromEntries(Object.entries(data).filter(([key]) => !keysToRemove.includes(key))); // 配布コンテンツデータ以外を削除
        const contentsData = ManageDistribution.getHexString(data);
        if (!contentsData) {
            await delay(1000);
            return fail(400, { error: true, message: 'Failed to get contents data.<br />Source data format is invalid.' });
        }

        const base64 = Buffer.from(contentsData, 'hex').toString('base64');

        const createdDistribution: Distribution = await new PostgresManager('create', 'distribution', {
            charId,
            category,
            deadline,
            title,
            description,
            remaining,
            minHr,
            maxHr,
            minGr,
            maxGr,
            base64,
        }).execute();

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
        const deletedDistTitles: string[] = await new PostgresManager('delete', 'claimedDistributions', { charId, deleteDistIds }).execute();

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
    createRainServer,
    updateRainServer,
    updateRainServerMaintenance,
    deleteRainServer,
    // createInformation,
    // updateInformation,
    // deleteInformation,
    courseControl,
    getPaginatedUsers,
    getPaginatedClans,
    getPaginatedAlliances,
    updateUser,
    updateCharacter,
    deleteUsers,
    suspendUsers,
    unsuspendUsers,
    createBanner,
    updateBanner,
    deleteBanner,
    linkDiscord,
    unlinkDiscord,
    deleteCharacter,
    restoreCharacter,
    rebuildClans,
    deleteClans,
    deleteAlliances,
    updateAlliance,
    downloadBinary,
    updateDistribution,
    deleteDistribution,
    createDistribution,
    deleteClaimedDistribution,
};
