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

export const getServerData = (data1: string, data2: string | number = undefined) => {
    let data: [];

    switch (data1) {
        case 'launcherSystem':
            data = db.launcher_system.findUnique({
                where: {
                    id: 1,
                },
            });
            break;

        case 'information':
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

        case 'users':
            data = db.users.findMany();
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

        case 'characters':
            data = db.characters.findMany();
            break;

        case 'getCharactersByUId':
            data = db.characters.findMany({
                where: {
                    user_id: data2,
                },
            });
            break;

        case 'bannedUsers':
            data = db.account_ban.findMany();
            break;

        default:
            data = 'Nothing';
    }

    return data;
};
