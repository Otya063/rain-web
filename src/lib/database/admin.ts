import { error } from '@sveltejs/kit';
import { Buffer } from 'node:buffer';
import type { PaginatedUsers, PaginationMeta, PaginatedClans, PaginatedAlliances } from '$lib/types';
import { ManageBinary, encodeToShiftJIS } from '$lib/utils';
import ServerData, { IsCharLogin, db } from '.';

/**
 * ページングされたユーザーのデータを取得する
 * @param {'username' | 'character_name' | 'user_id' | 'character_id'} filterParam フィルターの種類
 * @param {string | number} filterValue フィルターに使用する値
 * @param {string} status フィルタリング時のページングの状態
 * @param {number} take 取得するデータの数
 * @param {number} cursor データ検索の開始位置
 * @param {number} skip スキップするカーソルの数（通常は1を使用）
 * @returns {Promise<PaginatedUsers[]>} ページングされたユーザーデータの配列を返す
 */
export const getPaginatedUserData = async (
    filterParam: 'username' | 'character_name' | 'user_id' | 'character_id',
    filterValue: string | number,
    status: string,
    take: number,
    cursor?: number,
    skip?: number,
): Promise<PaginatedUsers[]> => {
    switch (status) {
        case 'init': {
            switch (filterParam) {
                case 'username': {
                    return await Promise.all(
                        (
                            await db.users.findMany({
                                take,
                                where: {
                                    username: {
                                        contains: filterValue as string,
                                    },
                                },
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
                                        },
                                        orderBy: {
                                            id: 'asc',
                                        },
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (user) => {
                            // 各ユーザーのキャラクターにplaytimeを追加
                            const charactersWithPlaytime = await Promise.all(
                                user.characters.map(async (character) => {
                                    const savedata = (
                                        await db.characters.findFirst({
                                            where: {
                                                id: character.id,
                                            },
                                            select: {
                                                savedata: true,
                                            },
                                        })
                                    )?.savedata;

                                    return {
                                        ...character,
                                        playtime: !savedata ? 0 : ManageBinary.getDataFromSavedata('playtime', savedata),
                                    };
                                }),
                            );

                            return {
                                ...user,
                                characters: charactersWithPlaytime,
                                suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                            };
                        }),
                    );
                }

                case 'character_name': {
                    return await Promise.all(
                        (
                            await db.users.findMany({
                                take,
                                where: {
                                    characters: {
                                        some: {
                                            name: {
                                                contains: filterValue as string,
                                            },
                                        },
                                    },
                                },
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
                                        },
                                        orderBy: {
                                            id: 'asc',
                                        },
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (user) => {
                            // 各ユーザーのキャラクターにplaytimeを追加
                            const charactersWithPlaytime = await Promise.all(
                                user.characters.map(async (character) => {
                                    const savedata = (
                                        await db.characters.findFirst({
                                            where: {
                                                id: character.id,
                                            },
                                            select: {
                                                savedata: true,
                                            },
                                        })
                                    )?.savedata;

                                    return {
                                        ...character,
                                        playtime: !savedata ? 0 : ManageBinary.getDataFromSavedata('playtime', savedata),
                                    };
                                }),
                            );

                            return {
                                ...user,
                                characters: charactersWithPlaytime,
                                suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                            };
                        }),
                    );
                }

                case 'user_id': {
                    return await Promise.all(
                        (
                            await db.users.findMany({
                                take,
                                where: {
                                    id: Number(filterValue),
                                },
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
                                        },
                                        orderBy: {
                                            id: 'asc',
                                        },
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (user) => {
                            // 各ユーザーのキャラクターにplaytimeを追加
                            const charactersWithPlaytime = await Promise.all(
                                user.characters.map(async (character) => {
                                    const savedata = (
                                        await db.characters.findFirst({
                                            where: {
                                                id: character.id,
                                            },
                                            select: {
                                                savedata: true,
                                            },
                                        })
                                    )?.savedata;

                                    return {
                                        ...character,
                                        playtime: !savedata ? 0 : ManageBinary.getDataFromSavedata('playtime', savedata),
                                    };
                                }),
                            );

                            return {
                                ...user,
                                characters: charactersWithPlaytime,
                                suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                            };
                        }),
                    );
                }

                case 'character_id': {
                    return await Promise.all(
                        (
                            await db.users.findMany({
                                take,
                                where: {
                                    characters: {
                                        some: {
                                            id: Number(filterValue),
                                        },
                                    },
                                },
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
                                        },
                                        orderBy: {
                                            id: 'asc',
                                        },
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (user) => {
                            // 各ユーザーのキャラクターにplaytimeを追加
                            const charactersWithPlaytime = await Promise.all(
                                user.characters.map(async (character) => {
                                    const savedata = (
                                        await db.characters.findFirst({
                                            where: {
                                                id: character.id,
                                            },
                                            select: {
                                                savedata: true,
                                            },
                                        })
                                    )?.savedata;

                                    return {
                                        ...character,
                                        playtime: !savedata ? 0 : ManageBinary.getDataFromSavedata('playtime', savedata),
                                    };
                                }),
                            );

                            return {
                                ...user,
                                characters: charactersWithPlaytime,
                                suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                            };
                        }),
                    );
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
                }
            }
        }

        case 'back':
        case 'next': {
            switch (filterParam) {
                case 'username': {
                    return await Promise.all(
                        (
                            await db.users.findMany({
                                take,
                                skip,
                                cursor: {
                                    id: cursor,
                                },
                                where: {
                                    username: {
                                        contains: filterValue as string,
                                    },
                                },
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
                                        },
                                        orderBy: {
                                            id: 'asc',
                                        },
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (user) => {
                            // 各ユーザーのキャラクターにplaytimeを追加
                            const charactersWithPlaytime = await Promise.all(
                                user.characters.map(async (character) => {
                                    const savedata = (
                                        await db.characters.findFirst({
                                            where: {
                                                id: character.id,
                                            },
                                            select: {
                                                savedata: true,
                                            },
                                        })
                                    )?.savedata;

                                    return {
                                        ...character,
                                        playtime: !savedata ? 0 : ManageBinary.getDataFromSavedata('playtime', savedata),
                                    };
                                }),
                            );

                            return {
                                ...user,
                                characters: charactersWithPlaytime,
                                suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                            };
                        }),
                    );
                }

                case 'character_name': {
                    return await Promise.all(
                        (
                            await db.users.findMany({
                                take,
                                skip,
                                cursor: {
                                    id: cursor,
                                },
                                where: {
                                    characters: {
                                        some: {
                                            name: {
                                                contains: filterValue as string,
                                            },
                                        },
                                    },
                                },
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
                                        },
                                        orderBy: {
                                            id: 'asc',
                                        },
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (user) => {
                            // 各ユーザーのキャラクターにplaytimeを追加
                            const charactersWithPlaytime = await Promise.all(
                                user.characters.map(async (character) => {
                                    const savedata = (
                                        await db.characters.findFirst({
                                            where: {
                                                id: character.id,
                                            },
                                            select: {
                                                savedata: true,
                                            },
                                        })
                                    )?.savedata;

                                    return {
                                        ...character,
                                        playtime: !savedata ? 0 : ManageBinary.getDataFromSavedata('playtime', savedata),
                                    };
                                }),
                            );

                            return {
                                ...user,
                                characters: charactersWithPlaytime,
                                suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                            };
                        }),
                    );
                }

                case 'user_id':
                case 'character_id': {
                    break;
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
                }
            }
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Invalid status: ${status}.`], message3: undefined });
        }
    }
};

/**
 * ページングのメタデータを取得する
 * @param {'username' | 'character_name' | 'user_id' | 'character_id' | 'clan_name' | 'clan_id' | 'alliance_name' | 'alliance_id'} filterParam フィルターの種類
 * @param {string | number} filterValue フィルターに使用する値
 * @param {number} prevCursor 前のデータを検索する位置
 * @param {number} nextCursor 次のデータを検索する位置
 * @returns {Promise<PaginationMeta>} ページングメタデータのオブジェクトを返す
 */
export const getPaginationMeta = async (
    filterParam: 'username' | 'character_name' | 'user_id' | 'character_id' | 'clan_name' | 'clan_id' | 'alliance_name' | 'alliance_id',
    filterValue: string | number,
    prevCursor: number,
    nextCursor: number,
): Promise<PaginationMeta> => {
    switch (filterParam) {
        case 'username': {
            const prevData = await db.users.findFirst({
                take: -1,
                skip: 1,
                cursor: {
                    id: prevCursor,
                },
                where: {
                    username: {
                        contains: filterValue as string,
                    },
                },
                select: {
                    id: true,
                },
            });

            const nextData = await db.users.findFirst({
                take: 1,
                skip: 1,
                cursor: {
                    id: nextCursor,
                },
                where: {
                    username: {
                        contains: filterValue as string,
                    },
                },
                select: {
                    id: true,
                },
            });

            return { prevCursor, nextCursor, hasPrevPage: !!prevData, hasNextPage: !!nextData };
        }

        case 'character_name': {
            const prevData = await db.users.findFirst({
                take: -1,
                skip: 1,
                cursor: {
                    id: prevCursor,
                },
                where: {
                    characters: {
                        some: {
                            name: {
                                contains: filterValue as string,
                            },
                        },
                    },
                },
                include: {
                    characters: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            const nextData = await db.users.findFirst({
                take: 1,
                skip: 1,
                cursor: {
                    id: nextCursor,
                },
                where: {
                    characters: {
                        some: {
                            name: {
                                contains: filterValue as string,
                            },
                        },
                    },
                },
                include: {
                    characters: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            return { prevCursor, nextCursor, hasPrevPage: !!prevData, hasNextPage: !!nextData };
        }

        case 'clan_name': {
            const prevData = await db.guilds.findFirst({
                take: -1,
                skip: 1,
                cursor: {
                    id: prevCursor,
                },
                where: {
                    name: {
                        contains: filterValue as string,
                    },
                },
                select: {
                    id: true,
                },
            });

            const nextData = await db.guilds.findFirst({
                take: 1,
                skip: 1,
                cursor: {
                    id: nextCursor,
                },
                where: {
                    name: {
                        contains: filterValue as string,
                    },
                },
                select: {
                    id: true,
                },
            });

            return { prevCursor, nextCursor, hasPrevPage: !!prevData, hasNextPage: !!nextData };
        }

        case 'alliance_name': {
            const prevData = await db.guild_alliances.findFirst({
                take: -1,
                skip: 1,
                cursor: {
                    id: prevCursor,
                },
                where: {
                    name: {
                        contains: filterValue as string,
                    },
                },
                select: {
                    id: true,
                },
            });

            const nextData = await db.guild_alliances.findFirst({
                take: 1,
                skip: 1,
                cursor: {
                    id: nextCursor,
                },
                where: {
                    name: {
                        contains: filterValue as string,
                    },
                },
                select: {
                    id: true,
                },
            });

            return { prevCursor, nextCursor, hasPrevPage: !!prevData, hasNextPage: !!nextData };
        }

        case 'user_id':
        case 'character_id':
        case 'clan_id':
        case 'alliance_id': {
            return { hasPrevPage: false, hasNextPage: false, prevCursor: 0, nextCursor: 0 };
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
        }
    }
};

/**
 * ページングされた同盟データを取得する
 * @param {'alliance_name' | 'alliance_id'} filterParam フィルターの種類
 * @param {string | number} filterValue フィルターに使用する値
 * @param {string} status フィルタリング時のページングの状態
 * @param {number} take 取得するデータの数
 * @param {number} cursor データ検索の開始位置
 * @param {number} skip スキップするカーソルの数（通常は1を使用）
 * @returns {Promise<PaginatedAlliances[]>} ページングされた同盟データの配列を返す
 */
export const getPaginatedAllianceData = async (
    filterParam: 'alliance_name' | 'alliance_id',
    filterValue: string | number,
    status: string,
    take: number,
    cursor?: number,
    skip?: number,
): Promise<PaginatedAlliances[]> => {
    switch (status) {
        case 'init': {
            switch (filterParam) {
                case 'alliance_name': {
                    return await Promise.all(
                        (
                            await db.guild_alliances.findMany({
                                take,
                                where: {
                                    name: {
                                        contains: filterValue as string,
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (alliance) => ({
                            ...alliance,
                            parent_clan: await (async () => {
                                const guildData = await db.guilds.findFirst({
                                    where: {
                                        id: alliance.parent_id,
                                    },
                                    select: {
                                        name: true,
                                        leader_id: true,
                                    },
                                });

                                const charData = await db.characters.findFirst({
                                    where: {
                                        id: guildData!.leader_id,
                                    },
                                    select: {
                                        name: true,
                                    },
                                });

                                return { clan_name: guildData!.name, leader_name: charData!.name };
                            })(),
                            first_child_clan: await (async () => {
                                if (!alliance.sub1_id) {
                                    return { clan_name: null, leader_name: null };
                                } else {
                                    const guildData = await db.guilds.findFirst({
                                        where: {
                                            id: alliance.sub1_id,
                                        },
                                        select: {
                                            name: true,
                                            leader_id: true,
                                        },
                                    });

                                    const charData = await db.characters.findFirst({
                                        where: {
                                            id: guildData!.leader_id,
                                        },
                                        select: {
                                            name: true,
                                        },
                                    });

                                    return { clan_name: guildData!.name, leader_name: charData!.name };
                                }
                            })(),
                            second_child_clan: await (async () => {
                                if (!alliance.sub2_id) {
                                    return { clan_name: null, leader_name: null };
                                } else {
                                    const guildData = await db.guilds.findFirst({
                                        where: {
                                            id: alliance.sub2_id,
                                        },
                                        select: {
                                            name: true,
                                            leader_id: true,
                                        },
                                    });

                                    const charData = await db.characters.findFirst({
                                        where: {
                                            id: guildData!.leader_id,
                                        },
                                        select: {
                                            name: true,
                                        },
                                    });

                                    return { clan_name: guildData!.name, leader_name: charData!.name };
                                }
                            })(),
                        })),
                    );
                }

                case 'alliance_id': {
                    return await Promise.all(
                        (
                            await db.guild_alliances.findMany({
                                take,
                                where: {
                                    id: Number(filterValue),
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (alliance) => ({
                            ...alliance,
                            parent_clan: await (async () => {
                                const guildData = await db.guilds.findFirst({
                                    where: {
                                        id: alliance.parent_id,
                                    },
                                    select: {
                                        name: true,
                                        leader_id: true,
                                    },
                                });

                                const charData = await db.characters.findFirst({
                                    where: {
                                        id: guildData!.leader_id,
                                    },
                                    select: {
                                        name: true,
                                    },
                                });

                                return { clan_name: guildData!.name, leader_name: charData!.name };
                            })(),
                            first_child_clan: await (async () => {
                                if (!alliance.sub1_id) {
                                    return { clan_name: null, leader_name: null };
                                } else {
                                    const guildData = await db.guilds.findFirst({
                                        where: {
                                            id: alliance.sub1_id,
                                        },
                                        select: {
                                            name: true,
                                            leader_id: true,
                                        },
                                    });

                                    const charData = await db.characters.findFirst({
                                        where: {
                                            id: guildData!.leader_id,
                                        },
                                        select: {
                                            name: true,
                                        },
                                    });

                                    return { clan_name: guildData!.name, leader_name: charData!.name };
                                }
                            })(),
                            second_child_clan: await (async () => {
                                if (!alliance.sub2_id) {
                                    return { clan_name: null, leader_name: null };
                                } else {
                                    const guildData = await db.guilds.findFirst({
                                        where: {
                                            id: alliance.sub2_id,
                                        },
                                        select: {
                                            name: true,
                                            leader_id: true,
                                        },
                                    });

                                    const charData = await db.characters.findFirst({
                                        where: {
                                            id: guildData!.leader_id,
                                        },
                                        select: {
                                            name: true,
                                        },
                                    });

                                    return { clan_name: guildData!.name, leader_name: charData!.name };
                                }
                            })(),
                        })),
                    );
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
                }
            }
        }

        case 'back':
        case 'next': {
            switch (filterParam) {
                case 'alliance_name': {
                    return await Promise.all(
                        (
                            await db.guild_alliances.findMany({
                                take,
                                skip,
                                cursor: {
                                    id: cursor,
                                },
                                where: {
                                    name: {
                                        contains: filterValue as string,
                                    },
                                },
                                orderBy: {
                                    id: 'asc',
                                },
                            })
                        ).map(async (alliance) => ({
                            ...alliance,
                            parent_clan: await (async () => {
                                const guildData = await db.guilds.findFirst({
                                    where: {
                                        id: alliance.parent_id,
                                    },
                                    select: {
                                        name: true,
                                        leader_id: true,
                                    },
                                });

                                const charData = await db.characters.findFirst({
                                    where: {
                                        id: guildData!.leader_id,
                                    },
                                    select: {
                                        name: true,
                                    },
                                });

                                return { clan_name: guildData!.name, leader_name: charData!.name };
                            })(),
                            first_child_clan: await (async () => {
                                if (!alliance.sub1_id) {
                                    return { clan_name: null, leader_name: null };
                                } else {
                                    const guildData = await db.guilds.findFirst({
                                        where: {
                                            id: alliance.sub1_id,
                                        },
                                        select: {
                                            name: true,
                                            leader_id: true,
                                        },
                                    });

                                    const charData = await db.characters.findFirst({
                                        where: {
                                            id: guildData!.leader_id,
                                        },
                                        select: {
                                            name: true,
                                        },
                                    });

                                    return { clan_name: guildData!.name, leader_name: charData!.name };
                                }
                            })(),
                            second_child_clan: await (async () => {
                                if (!alliance.sub2_id) {
                                    return { clan_name: null, leader_name: null };
                                } else {
                                    const guildData = await db.guilds.findFirst({
                                        where: {
                                            id: alliance.sub2_id,
                                        },
                                        select: {
                                            name: true,
                                            leader_id: true,
                                        },
                                    });

                                    const charData = await db.characters.findFirst({
                                        where: {
                                            id: guildData!.leader_id,
                                        },
                                        select: {
                                            name: true,
                                        },
                                    });

                                    return { clan_name: guildData!.name, leader_name: charData!.name };
                                }
                            })(),
                        })),
                    );
                }

                case 'alliance_id': {
                    break;
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
                }
            }
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Invalid status: ${status}.`], message3: undefined });
        }
    }
};

/**
 * ページングされたクランデータを取得する
 * @param {'clan_name' | 'clan_id'} filterParam フィルターの種類
 * @param {string | number} filterValue フィルターに使用する値
 * @param {string} status フィルタリング時のページングの状態
 * @param {number} take 取得するデータの数
 * @param {number} cursor データ検索の開始位置
 * @param {number} skip スキップするカーソルの数（通常は1を使用）
 * @returns {Promise<PaginatedClans[]>} ページングされたクランデータの配列を返す
 */
export const getPaginatedClanData = async (
    filterParam: 'clan_name' | 'clan_id',
    filterValue: string | number,
    status: string,
    take: number,
    cursor?: number,
    skip?: number,
): Promise<PaginatedClans[]> => {
    switch (status) {
        case 'init': {
            switch (filterParam) {
                case 'clan_name': {
                    return await Promise.all(
                        (
                            await db.guilds.findMany({
                                take,
                                where: {
                                    name: {
                                        contains: filterValue as string,
                                    },
                                },
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
                            })
                        ).map(async (clan) => ({
                            ...clan,
                            leader_name: (await db.characters.findFirst({
                                where: {
                                    id: clan.leader_id,
                                },
                                select: {
                                    name: true,
                                },
                            }))!.name,
                        })),
                    );
                }

                case 'clan_id': {
                    return await Promise.all(
                        (
                            await db.guilds.findMany({
                                take,
                                where: {
                                    id: Number(filterValue),
                                },
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
                            })
                        ).map(async (clan) => ({
                            ...clan,
                            leader_name: (await db.characters.findFirst({
                                where: {
                                    id: clan.leader_id,
                                },
                                select: {
                                    name: true,
                                },
                            }))!.name,
                        })),
                    );
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
                }
            }
        }

        case 'back':
        case 'next': {
            switch (filterParam) {
                case 'clan_name': {
                    return await Promise.all(
                        (
                            await db.guilds.findMany({
                                take,
                                skip,
                                cursor: {
                                    id: cursor,
                                },
                                where: {
                                    name: {
                                        contains: filterValue as string,
                                    },
                                },
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
                            })
                        ).map(async (clan) => ({
                            ...clan,
                            leader_name: (await db.characters.findFirst({
                                where: {
                                    id: clan.leader_id,
                                },
                                select: {
                                    name: true,
                                },
                            }))!.name,
                        })),
                    );
                }

                case 'clan_id': {
                    break;
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Invalid parameter: ${filterParam}.`], message3: undefined });
                }
            }
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Invalid status: ${status}.`], message3: undefined });
        }
    }
};

/**
 * キャラクターの名前を編集する
 * @param {number} characterId 編集するキャラクターID
 * @param {string} newName 変更後の新しい名前
 * @param bountyCoin 保有しているバウンティコイン数
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
