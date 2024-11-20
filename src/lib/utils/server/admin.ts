import { error } from '@sveltejs/kit';
import { Buffer } from 'node:buffer'; // Node.jsとの互換性により、追加しないと「ReferenceError: Buffer is not defined」が発生する
import type { PaginatedUsers, PaginationMeta, PaginatedClans, PaginatedAlliances } from '$types';
import ServerData, { IsCharLogin, db, ManageBinary, encodeToShiftJIS } from '.';

/**
 * ページングされたユーザーのデータを取得する
 * @param {'username' | 'character_name' | 'user_id' | 'character_id'} filterParam フィルターの種類
 * @param {string} filterValue フィルターに使用する値
 * @param {'init' | 'back' | 'next'} status フィルタリング時のページングの状態
 * @param {number} take 取得するデータの数
 * @param {number} [cursor] データ検索の開始位置
 * @param {number} [skip=1] スキップするカーソルの数（通常は1を使用）
 * @returns {Promise<PaginatedUsers[]>} ページングされたユーザーデータの配列を返す
 */
export const getPaginatedUserData = async (
    filterParam: 'username' | 'character_name' | 'user_id' | 'character_id',
    filterValue: string,
    status: 'init' | 'back' | 'next',
    take: number,
    cursor?: number,
    skip: number = 1,
): Promise<PaginatedUsers[]> => {
    // クエリ条件を動的に構築
    const query = buildQuery(filterParam, filterValue, status, take, skip, cursor);

    // データを取得
    const users = await db.users.findMany(query);

    // データを加工
    return Promise.all(users.map(async (user) => moddedUserData(user)));
};

/**
 * クエリ条件を構築
 * @param {'username' | 'character_name' | 'user_id' | 'character_id'} filterParam フィルターの種類
 * @param {string} filterValue フィルターに使用する値
 * @param {'init' | 'back' | 'next'} status フィルタリング時のページングの状態
 * @param {number} take 取得するデータの数
 * @param {number} skip スキップするカーソルの数（通常は1を使用）
 * @param {number} [cursor] データ検索の開始位置
 * @returns {any} prismaでのデータ取得に使用するクエリ
 */
const buildQuery = (
    filterParam: 'username' | 'character_name' | 'user_id' | 'character_id',
    filterValue: string,
    status: 'init' | 'back' | 'next',
    take: number,
    skip: number,
    cursor?: number,
): any => {
    const baseQuery: any = {
        take,
        orderBy: { id: 'asc' },
        select: {
            id: true,
            username: true,
            password: true,
            rights: true,
            last_character: true,
            last_login: true,
            return_expires: true,
            gacha_premium: true,
            gacha_trial: true,
            frontier_points: true,
            psn_id: true,
            wiiu_key: true,
            web_login_key: true,
            web_login_key_mobile: true,
            characters: {
                select: {
                    id: true,
                    user_id: true,
                    is_female: true,
                    is_new_character: true,
                    name: true,
                    gr: true,
                    hrp: true,
                    weapon_type: true,
                    weapon_id: true,
                    last_login: true,
                    deleted: true,
                    discord: true,
                    guild_characters: {
                        select: {
                            guilds: {
                                select: {
                                    id: true,
                                    name: true,
                                    guild_characters: true,
                                },
                            },
                        },
                    },
                    savedata: true,
                },
                orderBy: { id: 'asc' },
            },
        },
    };

    // ページング条件
    if (status !== 'init') {
        baseQuery.skip = skip;
        baseQuery.cursor = { id: cursor };
    }

    // フィルター条件
    switch (filterParam) {
        case 'username': {
            baseQuery.where = { username: { contains: filterValue } };

            break;
        }

        case 'character_name': {
            baseQuery.where = {
                characters: {
                    some: { name: { contains: filterValue } },
                },
            };

            break;
        }

        case 'user_id': {
            baseQuery.where = { id: Number(filterValue) };

            break;
        }

        case 'character_id': {
            baseQuery.where = {
                characters: { some: { id: Number(filterValue) } },
            };

            break;
        }

        default:
            error(400, { message: '', message1: undefined, message2: [`Invalid status: ${status}.`], message3: undefined });
    }

    return baseQuery;
};

/**
 * ユーザーデータを加工
 * @param {any} user 元のユーザーデータ
 * @returns {Promise<PaginatedUsers>} 加工済みユーザーデータ
 */
const moddedUserData = async (user: any): Promise<PaginatedUsers> => {
    // savedataから必要プロパティを追加する
    const newCharacters = user.characters.map((character: any) => {
        const { savedata, ...rest } = character;
        return {
            ...rest,
            playtime: ManageBinary.getDataFromSavedata('playtime', savedata),
        };
    });

    // 停止アカウント情報を追加
    const suspendedAccount = await ServerData.getSuspendedUsersByUserId(user.id);

    return {
        ...user,
        characters: newCharacters,
        suspended_account: suspendedAccount,
    };
};

/**
 * ページングのメタデータを取得する
 * @param {'username' | 'character_name' | 'user_id' | 'character_id' | 'clan_name' | 'clan_id' | 'alliance_name' | 'alliance_id'} filterParam フィルターの種類
 * @param {string} filterValue フィルターに使用する値
 * @param {number} prevCursor 前のデータを検索する位置
 * @param {number} nextCursor 次のデータを検索する位置
 * @returns {Promise<PaginationMeta>} ページングメタデータのオブジェクトを返す
 */
export const getPaginationMeta = async (
    filterParam: 'username' | 'character_name' | 'user_id' | 'character_id' | 'clan_name' | 'clan_id' | 'alliance_name' | 'alliance_id',
    filterValue: string,
    prevCursor: number,
    nextCursor: number,
): Promise<PaginationMeta> => {
    // 共通のロジックを抽出した関数
    const findPaginationData = async (tableName: any, cursor: number, take: number, filterCondition: object) => {
        return tableName.findFirst({
            take,
            skip: 1,
            cursor: { id: cursor },
            where: filterCondition,
            select: { id: true },
        });
    };

    // テーブルと条件のマッピング
    const tableMapping: Record<string, { table: any; condition: object }> = {
        username: {
            table: db.users,
            condition: { username: { contains: filterValue } },
        },
        character_name: {
            table: db.users,
            condition: { characters: { some: { name: { contains: filterValue } } } },
        },
        clan_name: {
            table: db.guilds,
            condition: { name: { contains: filterValue } },
        },
        alliance_name: {
            table: db.guild_alliances,
            condition: { name: { contains: filterValue } },
        },
    };

    // 固定返り値の条件
    if (['user_id', 'character_id', 'clan_id', 'alliance_id'].includes(filterParam)) {
        return { hasPrevPage: false, hasNextPage: false, prevCursor: 0, nextCursor: 0 };
    }

    // マッピングの存在確認
    if (!tableMapping[filterParam]) {
        error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
    }

    // マッピングからテーブルと条件を取得
    const { table, condition } = tableMapping[filterParam];

    // 前後のデータを取得
    const [prevData, nextData] = await Promise.all([findPaginationData(table, prevCursor, -1, condition), findPaginationData(table, nextCursor, 1, condition)]);

    return { prevCursor, nextCursor, hasPrevPage: !!prevData, hasNextPage: !!nextData };
};

/**
 * ページングされた同盟データを取得する
 * @param {'alliance_name' | 'alliance_id'} filterParam フィルターの種類
 * @param {string} filterValue フィルターに使用する値
 * @param {string} status フィルタリング時のページングの状態
 * @param {number} take 取得するデータの数
 * @param {number} [cursor] データ検索の開始位置
 * @param {number} [skip=1] スキップするカーソルの数（通常は1を使用）
 * @returns {Promise<PaginatedAlliances[]>} ページングされた同盟データの配列を返す
 */
export const getPaginatedAllianceData = async (
    filterParam: 'alliance_name' | 'alliance_id',
    filterValue: string,
    status: string,
    take: number,
    cursor?: number,
    skip: number = 1,
): Promise<PaginatedAlliances[]> => {
    const where = filterParam === 'alliance_name' ? { name: { contains: filterValue } } : { id: Number(filterValue) };

    const queryOptions: any = {
        take,
        where,
        orderBy: { id: 'asc' },
    };

    if (status === 'back' || status === 'next') {
        if (cursor) {
            queryOptions.cursor = { id: cursor };
        }

        if (skip) {
            queryOptions.skip = skip;
        }
    }

    const alliances = await db.guild_alliances.findMany(queryOptions);

    return Promise.all(alliances.map(moddedAllianceData));
};

/**
 * クラン情報を取得する共通関数
 * @param {number | null} clanId クランID
 * @returns {Promise<{ clan_name: string | null; leader_name: string | null }>} クラン名とリーダー名を含むオブジェクト
 */
const getClanInfo = async (clanId: number | null): Promise<{ clan_name: string | null; leader_name: string | null }> => {
    if (!clanId) {
        return { clan_name: null, leader_name: null };
    }

    const guildData = await db.guilds.findFirst({
        where: { id: clanId },
        select: { name: true, leader_id: true },
    });
    if (!guildData) {
        return { clan_name: null, leader_name: null };
    }

    const charData = await db.characters.findFirst({
        where: { id: guildData.leader_id },
        select: { name: true },
    });

    return {
        clan_name: guildData.name,
        leader_name: charData?.name || null,
    };
};

/**
 * 改変された同盟データを取得する
 * @param {any} alliance 同盟データ
 * @returns {Promise<any>} 改変箇所を含む同盟データ
 */
const moddedAllianceData = async (alliance: any): Promise<any> => {
    return {
        ...alliance,
        parent_clan: await getClanInfo(alliance.parent_id),
        first_child_clan: await getClanInfo(alliance.sub1_id),
        second_child_clan: await getClanInfo(alliance.sub2_id),
    };
};

/**
 * ページングされたクランデータを取得する
 * @param {'clan_name' | 'clan_id'} filterParam フィルターの種類
 * @param {string} filterValue フィルターに使用する値
 * @param {string} status フィルタリング時のページングの状態
 * @param {number} take 取得するデータの数
 * @param {number} [cursor] データ検索の開始位置
 * @param {number} [skip=1] スキップするカーソルの数（通常は1を使用）
 * @returns {Promise<PaginatedClans[]>} ページングされたクランデータの配列を返す
 */
export const getPaginatedClanData = async (filterParam: 'clan_name' | 'clan_id', filterValue: string, status: string, take: number, cursor?: number, skip: number = 1): Promise<PaginatedClans[]> => {
    // フィルタ条件の生成
    const filter = filterParam === 'clan_name' ? { name: { contains: filterValue } } : { id: Number(filterValue) };

    // 状態に応じた処理
    if (!['init', 'back', 'next'].includes(status)) {
        throw error(400, { message: '', message1: undefined, message2: [`Invalid status: ${status}.`], message3: undefined });
    }

    const guilds = await findGuilds(filter, take, status === 'init' ? undefined : skip, cursor);

    return await Promise.all(guilds.map(addLeaderName));
};

/**
 * クランデータを取得するための共通関数
 * @param {Record<string, any>} filter フィルタ条件のオブジェクト
 * @param {number} take 取得するデータの数
 * @param {number} [skip] スキップするカーソルの数（通常は1を使用）
 * @param {number} [cursor] データ検索の開始位置
 * @returns {Promise<any[]>} クランデータ
 */
const findGuilds = async (filter: Record<string, any>, take: number, skip?: number, cursor?: number): Promise<any[]> => {
    return await db.guilds.findMany({
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: filter,
        select: {
            id: true,
            name: true,
            created_at: true,
            leader_id: true,
            guild_characters: {
                select: {
                    order_index: true,
                    characters: {
                        select: {
                            id: true,
                            name: true,
                            hrp: true,
                            gr: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

/**
 * クランリーダーの名前を追加する関数
 * @param {any} clan 元のクランデータ
 * @returns {Promise<any>} クランリーダ名を追加したクランデータオブジェクト
 */
const addLeaderName = async (clan: any): Promise<any> => {
    const leader = await db.characters.findFirst({
        where: { id: clan.leader_id },
        select: { name: true },
    });

    return {
        ...clan,
        leader_name: leader?.name || null,
    };
};

/**
 * キャラクターの名前を編集する
 * @param {number} characterId 編集するキャラクターID
 * @param {string} newName 変更後の新しい名前
 * @param {number} bountyCoin 保有しているバウンティコイン数
 * @returns {Promise<{success: boolean; message: string;}>} 成功したか否か、結果を返す
 */
export const editName = async (
    characterId: number,
    newName: string,
    bountyCoin: number,
): Promise<{
    success: boolean;
    message: string;
}> => {
    const isLogin = await new IsCharLogin(characterId).checkSingle();
    if (isLogin) {
        return { success: false, message: "Can't be processed while the target character is logged in." };
    }

    // 名前のbuffer生成（12バイト以下でないといけない、2文字で1バイト扱いなのでlengthは24）
    const nameBuffer = encodeToShiftJIS(newName);
    if (nameBuffer.toString('hex').length > 24 || nameBuffer.toString('hex').length === 0) {
        return { success: false, message: 'Character name must be 1-12 characters (1-6 characters in Japanese).' };
    }

    // 名前のbufferの残りを「0」で埋めて12バイトにする
    const paddedNameBuffer = Buffer.alloc(24);
    nameBuffer.copy(paddedNameBuffer);

    const savedata = (
        await db.characters.findFirst({
            where: {
                id: characterId,
            },
            select: {
                savedata: true,
            },
        })
    )?.savedata;
    if (!savedata) {
        return { success: false, message: 'Savedata not found.' };
    }

    const base64 = ManageBinary.exportEditedSavedata('name', savedata, paddedNameBuffer);

    try {
        await db.$executeRaw`UPDATE characters SET savedata = decode(${base64}, 'base64'), name = ${newName} WHERE id = ${characterId}`;

        await db.discord.update({
            where: {
                char_id: characterId,
            },
            data: {
                bounty: bountyCoin - 50000,
            },
        });

        return { success: true, message: '' };
    } catch (err) {
        if (err instanceof Error) {
            return { success: false, message: err.message };
        } else if (typeof err === 'string') {
            return { success: false, message: err };
        } else {
            return { success: false, message: 'Unexpected Error' };
        }
    }
};
