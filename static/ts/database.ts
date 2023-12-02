import _ from 'lodash';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const db = new PrismaClient({
    datasources: {
        db: {
            url: import.meta.env.VITE_DATABASE_URL,
        },
    },
}).$extends(withAccelerate());

export const getServerData = async (data1: string, data2: string | number | undefined = undefined, data3: string | undefined = undefined) => {
    let data: [];

    switch (data1) {
        case 'getLauncherSystem':
            data = db.launcher_system.findUnique({
                where: {
                    id: 1,
                },
            });
            break;

        case 'getInformation':
            switch (data2) {
                case 1:
                    data = db.launcher_info.findMany({
                        where: {
                            type: 'Important',
                        },
                    });
                    break;

                case 2:
                    data = db.launcher_info.findMany({
                        where: {
                            type: 'Defects and Troubles',
                        },
                    });
                    break;

                case 3:
                    data = db.launcher_info.findMany({
                        where: {
                            type: 'Management and Service',
                        },
                    });
                    break;

                case 4:
                    data = db.launcher_info.findMany({
                        where: {
                            type: 'In-Game Events',
                        },
                    });
                    break;

                case 5:
                    data = db.launcher_info.findMany({
                        where: {
                            type: 'Updates and Maintenance',
                        },
                    });
                    break;
            }
            break;

        case 'getAllUsers':
            data = db.users.findMany({});
            break;

        case 'getExtgUserByUserName':
            if (data2 === undefined) {
                data = 'Invalid Input';
            } else {
                data = db.users.findUnique({
                    where: {
                        username: data2,
                    },
                });
            }
            break;

        case 'getLinkedAccByUId':
            if (data2 === undefined) {
                data = 'Invalid Input';
            } else {
                data = db.discord_register.findFirst({
                    where: {
                        user_id: data2,
                    },
                });
            }
            break;

        case 'getAllLinkedCharacters':
            data = db.discord.findMany({});
            break;

        case 'getLinkedCharacterByCId':
            if (data2 === undefined) {
                data = 'Invalid Input';
            } else {
                data = db.discord.findFirst({
                    where: {
                        char_id: data2,
                    },
                });
            }
            break;

        case 'getSuspendedUserByUsername':
            if (data2 === undefined) {
                data = 'Invalid Input';
            } else {
                data = db.suspended_account.findFirst({
                    where: {
                        username: data2,
                    },
                });
            }
            break;

        case 'getAllCharacters':
            data = db.characters.findMany({});
            break;

        case 'getCharactersByUId':
            if (data2 === undefined) {
                data = 'Invalid Input';
            } else {
                data = db.characters.findMany({
                    where: {
                        user_id: data2,
                    },
                });
            }
            break;

        case 'getAllSuspendedUsers':
            data = db.suspended_account.findMany({});
            break;

        case 'getBannerData':
            data = db.launcher_banner.findMany({});
            break;

        case 'getAuthUserBySession':
            data = db.users.findFirst({
                where: {
                    authToken: data2,
                },
            });
            break;

        default:
            data = 'Nothing';
    }

    return data;
};

export const requestActToServer = async (data1: string, data2: string | number) => {
    let data: string;

    switch (data1) {
        case 'deleteCharacter':
            try {
                await db.characters.update({
                    where: {
                        id: Number(data2),
                    },
                    data: {
                        deleted: true,
                    },
                });

                data = 'Deleted_Character';
            } catch (err) {
                if (err instanceof Error) {
                    data = err.message;
                } else if (typeof err === 'string') {
                    data = err;
                } else {
                    data = 'Unexpected_Error';
                }
            }
            break;

        case 'addCharacter':
            try {
                const lastLoginTime = Math.floor(Date.now() / 1000);

                await db.characters.create({
                    data: {
                        user_id: Number(data2),
                        is_female: false,
                        is_new_character: true,
                        last_login: lastLoginTime,
                    },
                });

                data = 'Added_Character';
            } catch (err) {
                if (err instanceof Error) {
                    data = err.message;
                } else if (typeof err === 'string') {
                    data = err;
                } else {
                    data = 'Unexpected_Error';
                }
            }
            break;

        default:
            data = 'Invalid_Input';
    }

    return data;
};

export interface User {
    id: number;
    username: string;
    password: string;
    item_box: Buffer | null;
    rights: number;
    last_character: number | null;
    last_login: Date | null;
    return_expires: Date | null;
    gacha_premium: number | null;
    gacha_trial: number | null;
    frontier_points: number | null;
    authToken: string | null;
}