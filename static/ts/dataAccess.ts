import { db } from '$lib/database';

export const getServerData = (mainData: string, subData: string | number = undefined) => {
    let data;

    switch (mainData) {
        case 'launcherSystem':
            data = db.launcher_system.findUnique({
                where: {
                    id: 1,
                },
            });
            break;

        case 'information':
            switch (subData) {
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

        case 'characters':
            data = db.characters.findMany();
            break;

        case 'bannedUsers':
            data = db.account_ban.findMany();
            break;

        default:
            data = 'Nothing';
    }

    return data;
};
