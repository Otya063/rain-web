import ServerData, { db } from '.';
import type { PaginatedUsers, PaginationMeta } from '$lib/types';
import { TextEncoderSJIS } from '$lib/utils';

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

/* Edit Character Name
====================================================*/
export const editName = async (
    characterId: number,
    setName: string
): Promise<{
    success: boolean;
    message: string;
}> => {
    const encoder = new TextEncoderSJIS();
    const sjisBytes = encoder.encode(setName);
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
    await db.$queryRaw`UPDATE characters SET savedata = decode(${base64}, 'base64'), name = ${setName} WHERE id = ${characterId}`;

    return { success: true, message: '' };
};

/* Manage Character Binary
====================================================*/
export class ManageBinary {
    constructor(private type: 'savedata', private characterId: number, private base64: string) {}

    public async set(): Promise<void> {
        switch (this.type) {
            case 'savedata': {
                await db.$queryRaw`UPDATE characters SET savedata = decode(${this.base64}, 'base64') WHERE id = ${this.characterId}`;

                break;
            }

            default: {
                throw new Error('Invalid Binary Type');
            }
        }
    }
}
