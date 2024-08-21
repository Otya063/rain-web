import ServerData, { IsCharLogin, db } from '.';
import type { PaginatedUsers, PaginationMeta, BinaryTypes, PaginatedClans, PaginatedAlliances } from '$lib/types';
//import { TextEncoderSJIS } from '$lib/utils';
import { Buffer } from 'node:buffer';
import { encodeToShiftJIS } from '$lib/utils';

/**
 * Get paginated user(s) data.
 * @param {'username' | 'character_name' | 'user_id' | 'character_id'} filterParam Type to filter.
 * @param {string | number} filterValue Value to filter.
 * @param {string} status Pegination status at filtering.
 * @param {number} take Number of data to be obtained.
 * @param {number} cursor Position for searching for data.
 * @param {number} skip Number of cursors to skip. (Normally 1 is used.)
 * @returns {Promise<PaginatedUsers[]>} Return an array of paginated user(s) data.
 */
export const getPaginatedUserData = async (
    filterParam: 'username' | 'character_name' | 'user_id' | 'character_id',
    filterValue: string | number,
    status: string,
    take: number,
    cursor?: number,
    skip?: number
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
                        ).map(async (user) => ({
                            ...user,
                            suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                        }))
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
                        ).map(async (user) => ({
                            ...user,
                            suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                        }))
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
                        ).map(async (user) => ({
                            ...user,
                            suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                        }))
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
                        ).map(async (user) => ({
                            ...user,
                            suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                        }))
                    );
                }

                default: {
                    throw new Error('Invalid Parameter');
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
                        ).map(async (user) => ({
                            ...user,
                            suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                        }))
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
                        ).map(async (user) => ({
                            ...user,
                            suspended_account: await ServerData.getSuspendedUsersByUserId(user.id),
                        }))
                    );
                }

                case 'user_id':
                case 'character_id': {
                    break;
                }

                default: {
                    throw new Error('Invalid Parameter');
                }
            }
        }

        default: {
            throw new Error('Invalid Status');
        }
    }
};

/**
 * Get pagination meta data.
 * @param {'username' | 'character_name' | 'user_id' | 'character_id' | 'clan_name' | 'clan_id' | 'alliance_name' | 'alliance_id'} filterParam
 * @param {string | number} filterValue Value to filter.
 * @param {number} prevCursor Position for searching for previous data.
 * @param {number} nextCursor Position for searching for next data.
 * @returns {Promise<PaginationMeta>} Return pagination meta object.
 */
export const getPaginationMeta = async (
    filterParam: 'username' | 'character_name' | 'user_id' | 'character_id' | 'clan_name' | 'clan_id' | 'alliance_name' | 'alliance_id',
    filterValue: string | number,
    prevCursor: number,
    nextCursor: number
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
            throw new Error('Invalid Parameter');
        }
    }
};

/**
 * Get paginated alliance(s) data.
 * @param {'alliance_name' | 'alliance_id'} filterParam Type to filter.
 * @param {string | number} filterValue Value to filter.
 * @param {string} status Pegination status at filtering.
 * @param {number} take Number of data to be obtained.
 * @param {number} cursor Position for searching for data.
 * @param {number} skip Number of cursors to skip. (Normally 1 is used.)
 * @returns {Promise<PaginatedAlliances[]>} Return an array of paginated alliance(s) data.
 */
export const getPaginatedAllianceData = async (
    filterParam: 'alliance_name' | 'alliance_id',
    filterValue: string | number,
    status: string,
    take: number,
    cursor?: number,
    skip?: number
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
                        }))
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
                        }))
                    );
                }

                default: {
                    throw new Error('Invalid Parameter');
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
                        }))
                    );
                }

                case 'alliance_id': {
                    break;
                }

                default: {
                    throw new Error('Invalid Parameter');
                }
            }
        }

        default: {
            throw new Error('Invalid Status');
        }
    }
};

/**
 * Get paginated clan(s) data.
 * @param {'clan_name' | 'clan_id'} filterParam Type to filter.
 * @param {string | number} filterValue Value to filter.
 * @param {string} status Pegination status at filtering.
 * @param {number} take Number of data to be obtained.
 * @param {number} cursor Position for searching for data.
 * @param {number} skip Number of cursors to skip. (Normally 1 is used.)
 * @returns {Promise<PaginatedClans[]>} Return an array of paginated clan(s) data.
 */
export const getPaginatedClanData = async (
    filterParam: 'clan_name' | 'clan_id',
    filterValue: string | number,
    status: string,
    take: number,
    cursor?: number,
    skip?: number
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
                        }))
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
                        }))
                    );
                }

                default: {
                    throw new Error('Invalid Parameter');
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
                        }))
                    );
                }

                case 'clan_id': {
                    break;
                }

                default: {
                    throw new Error('Invalid Parameter');
                }
            }
        }

        default: {
            throw new Error('Invalid Status');
        }
    }
};

/**
 * Edit character's name.
 * @param {number} characterId Character ID to be edited.
 * @param {string} setName New name after change.
 * @param bountyCoin Number of bounty coins owned.
 * @returns {Promise<{success: boolean; message: string;}>} Return the result.
 */
export const editName = async (
    characterId: number,
    setName: string,
    bountyCoin: number
): Promise<{
    success: boolean;
    message: string;
}> => {
    const isLogin = await new IsCharLogin(characterId).checkSingle();
    if (isLogin) {
        return { success: false, message: "Can't be processed while the target character is logged in." };
    }

    //const encoded = new TextEncoder().encode(setName);
    //console.log(encoded);
    /* const encoder = new TextEncoderSJIS();
    const sjisBytes = encoder.encode(setName);
    console.log(sjisBytes); */
    const sjisBytes = encodeToShiftJIS(setName);
    const hexString = Array.from(sjisBytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    if (hexString.length > 24 || hexString.length === 0) {
        return { success: false, message: 'Character name must be 1-12 characters (1-6 characters in Japanese).' };
    }

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

    const uint8Arr = Uint8Array.from(savedata);
    const index255 = uint8Arr.indexOf(255);
    const index0 = uint8Arr.indexOf(0, index255);
    const array1 = uint8Arr.slice(0, index255 + 1);
    const oldNameArr = uint8Arr.slice(index255 + 1, index0);
    const array2 = uint8Arr.slice(index0 + 1);

    const nameArr = (hexString + '0').match(/.{1,2}/g)?.map((hex) => parseInt(hex, 16))!;
    array2[0] = array2[0] - (sjisBytes.length - oldNameArr.length);
    const finalArr = new Uint8Array([...array1, ...nameArr, ...array2]);

    const base64 = Buffer.from(finalArr).toString('base64');

    try {
        await db.$queryRaw`UPDATE characters SET savedata = decode(${base64}, 'base64'), name = ${setName} WHERE id = ${characterId}`;

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

/**
 * Manage binary data of the character.
 * @class
 */
export class ManageBinary {
    /**
     * Create an instance of ManageBinary.
     * @param {number} characterId Target character's ID.
     * @param {{ [key in BinaryTypes]: string }} binaryData Binary data of the target character.
     */
    constructor(private characterId: number, private binaryData: { [key in BinaryTypes]: string }) {}

    /**
     * Set binary data.
     * @returns {Promise<{ success: boolean; message: string; }>} Return the result.
     */
    public async set(): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            const isNull = {
                savedata: !this.binaryData.savedata ? 'NULL' : 'NOT_NULL',
                decomyset: !this.binaryData.decomyset ? 'NULL' : 'NOT_NULL',
                hunternavi: !this.binaryData.hunternavi ? 'NULL' : 'NOT_NULL',
                otomoairou: !this.binaryData.otomoairou ? 'NULL' : 'NOT_NULL',
                partner: !this.binaryData.partner ? 'NULL' : 'NOT_NULL',
                platebox: !this.binaryData.platebox ? 'NULL' : 'NOT_NULL',
                platedata: !this.binaryData.platedata ? 'NULL' : 'NOT_NULL',
                platemyset: !this.binaryData.platemyset ? 'NULL' : 'NOT_NULL',
                rengokudata: !this.binaryData.rengokudata ? 'NULL' : 'NOT_NULL',
                savemercenary: !this.binaryData.savemercenary ? 'NULL' : 'NOT_NULL',
                skin_hist: !this.binaryData.skin_hist ? 'NULL' : 'NOT_NULL',
                minidata: !this.binaryData.minidata ? 'NULL' : 'NOT_NULL',
                scenariodata: !this.binaryData.scenariodata ? 'NULL' : 'NOT_NULL',
                savefavoritequest: !this.binaryData.savefavoritequest ? 'NULL' : 'NOT_NULL',
            };

            await db.$queryRaw`UPDATE characters SET savedata = CASE ${isNull.savedata} WHEN 'NULL' THEN decode((SELECT encode(savedata, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.savedata}, 'base64') END, decomyset = CASE ${isNull.decomyset} WHEN 'NULL' THEN decode((SELECT encode(decomyset, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.decomyset}, 'base64') END, hunternavi = CASE ${isNull.hunternavi} WHEN 'NULL' THEN decode((SELECT encode(hunternavi, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.hunternavi}, 'base64') END, otomoairou = CASE ${isNull.otomoairou} WHEN 'NULL' THEN decode((SELECT encode(otomoairou, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.otomoairou}, 'base64') END, partner = CASE ${isNull.partner} WHEN 'NULL' THEN decode((SELECT encode(partner, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.partner}, 'base64') END, platebox = CASE ${isNull.platebox} WHEN 'NULL' THEN decode((SELECT encode(platebox, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.platebox}, 'base64') END, platedata = CASE ${isNull.platedata} WHEN 'NULL' THEN decode((SELECT encode(platedata, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.platedata}, 'base64') END, platemyset = CASE ${isNull.platemyset} WHEN 'NULL' THEN decode((SELECT encode(platemyset, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.platemyset}, 'base64') END, rengokudata = CASE ${isNull.rengokudata} WHEN 'NULL' THEN decode((SELECT encode(rengokudata, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.rengokudata}, 'base64') END, savemercenary = CASE ${isNull.savemercenary} WHEN 'NULL' THEN decode((SELECT encode(savemercenary, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.savemercenary}, 'base64') END, skin_hist = CASE ${isNull.skin_hist} WHEN 'NULL' THEN decode((SELECT encode(skin_hist, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.skin_hist}, 'base64') END, minidata = CASE ${isNull.minidata} WHEN 'NULL' THEN decode((SELECT encode(minidata, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.minidata}, 'base64') END, scenariodata = CASE ${isNull.scenariodata} WHEN 'NULL' THEN decode((SELECT encode(scenariodata, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.scenariodata}, 'base64') END, savefavoritequest = CASE ${isNull.savefavoritequest} WHEN 'NULL' THEN decode((SELECT encode(savefavoritequest, 'base64') FROM characters WHERE id = ${this.characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${this.binaryData.savefavoritequest}, 'base64') END WHERE id = ${this.characterId}`;

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
    }
}
