import ServerData, { db } from '.';
import type { PaginatedUsers, PaginationMeta } from '$lib/types';

/* Get Paginated User(s)
====================================================*/
export const getPaginatedUserData = async (filterParam: string, filterValue: string, status: string, take: number, cursor?: number, skip?: number): Promise<PaginatedUsers[]> => {
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
                                        contains: filterValue,
                                    },
                                },
                                include: {
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
                                                contains: filterValue,
                                            },
                                        },
                                    },
                                },
                                include: {
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
                                        contains: filterValue,
                                    },
                                },
                                include: {
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
                                                contains: filterValue,
                                            },
                                        },
                                    },
                                },
                                include: {
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

        default: {
            throw new Error('Invalid Status');
        }
    }
};

/* Get Pagination Meta Data
====================================================*/
export const getPaginationMeta = async (filterParam: string, filterValue: string, prevCursor: number, nextCursor: number): Promise<PaginationMeta> => {
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
                        contains: filterValue,
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
                        contains: filterValue,
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
                                contains: filterValue,
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
                                contains: filterValue,
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

        default: {
            throw new Error('Invalid Parameter');
        }
    }
};
