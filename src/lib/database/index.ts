import { ManageBinary, editName } from './admin';
import {
    PrismaClient,
    type characters,
    type discord,
    type discord_register,
    type launcher_banner,
    type launcher_info,
    type launcher_system,
    type suspended_account,
    type users,
} from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { DATABASE_URL } from '$env/static/private';
import type { InformationType, BinaryTypes } from '$lib/types';
import _ from 'lodash';
import { DateTime } from 'luxon';

export * from './admin';
export const db = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
})
    .$extends(withAccelerate())
    .$extends({
        model: {
            users: {
                async suspend(
                    userId: number,
                    username: string,
                    reasonType: number,
                    permanent: boolean,
                    zonename: string,
                    until_at?: string
                ): Promise<{
                    success: boolean;
                    message: string;
                    suspendedAccount?: suspended_account;
                }> {
                    try {
                        if (permanent) {
                            const suspendedAccount = await db.suspended_account.create({
                                data: {
                                    user_id: userId,
                                    username,
                                    reason: reasonType,
                                    until_at: DateTime.utc(9999, 1, 1).toISO()!,
                                    permanent: true,
                                },
                            });

                            await db.characters.deleteMany({
                                where: {
                                    user_id: userId,
                                },
                            });

                            await db.discord_register.delete({
                                where: {
                                    user_id: userId,
                                },
                            });

                            return {
                                success: true,
                                message: '',
                                suspendedAccount,
                            };
                        } else {
                            if (!until_at) {
                                return { success: false, message: 'Input value is empty.' };
                            }

                            const suspendedAccount = await db.suspended_account.create({
                                data: {
                                    user_id: userId,
                                    username,
                                    reason: reasonType,
                                    until_at: DateTime.fromISO(String(until_at), { zone: zonename }).toString()!,
                                    permanent: false,
                                },
                            });

                            await db.characters.updateMany({
                                where: {
                                    user_id: userId,
                                },
                                data: {
                                    deleted: true,
                                },
                            });

                            return {
                                success: true,
                                message: '',
                                suspendedAccount,
                            };
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            return { success: false, message: err.message };
                        } else if (typeof err === 'string') {
                            return { success: false, message: err };
                        } else {
                            return { success: false, message: 'Unexpected Error' };
                        }
                    }
                },
                async unsuspend(userId: number): Promise<{
                    success: boolean;
                    message: string;
                }> {
                    try {
                        await db.characters.updateMany({
                            where: {
                                user_id: userId,
                            },
                            data: {
                                deleted: false,
                            },
                        });

                        await db.suspended_account.delete({
                            where: {
                                user_id: userId,
                            },
                        });

                        return {
                            success: true,
                            message: '',
                        };
                    } catch (err) {
                        if (err instanceof Error) {
                            return { success: false, message: err.message };
                        } else if (typeof err === 'string') {
                            return { success: false, message: err };
                        } else {
                            return { success: false, message: 'Unexpected Error' };
                        }
                    }
                },
            },
            characters: {
                async editName(
                    characterId: number,
                    setName: string,
                    bountyCoin: number
                ): Promise<{
                    success: boolean;
                    message: string;
                }> {
                    return await editName(characterId, setName, bountyCoin);
                },
                async setBinary(
                    characterId: number,
                    binaryData: { [key in BinaryTypes]: string }
                ): Promise<{
                    success: boolean;
                    message: string;
                }> {
                    const manageBinary = new ManageBinary(characterId, binaryData);
                    return await manageBinary.set();
                },
                async remove(
                    characterId: number,
                    permanent: boolean
                ): Promise<{
                    success: boolean;
                    message: string;
                }> {
                    try {
                        if (permanent) {
                            const discordId = (
                                await db.characters.delete({
                                    where: {
                                        id: characterId,
                                    },
                                    select: {
                                        discord: {
                                            select: {
                                                discord_id: true,
                                            },
                                        },
                                    },
                                })
                            ).discord?.discord_id;

                            if (discordId) {
                                await db.discord_register.delete({
                                    where: {
                                        discord_id: discordId,
                                    },
                                });
                            }

                            return {
                                success: true,
                                message: '',
                            };
                        } else {
                            await db.characters.update({
                                where: {
                                    id: characterId,
                                },
                                data: {
                                    deleted: true,
                                },
                            });

                            return {
                                success: true,
                                message: '',
                            };
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            return { success: false, message: err.message };
                        } else if (typeof err === 'string') {
                            return { success: false, message: err };
                        } else {
                            return { success: false, message: 'Unexpected Error' };
                        }
                    }
                },
            },
        },
    });

class ServerDataManager {
    /* Characters
    ====================================================*/
    public async getAllCharacters(): Promise<characters[]> {
        return await db.characters.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    public async getCharactersByUserId(user_id: number): Promise<characters[]> {
        return await db.characters.findMany({
            where: {
                user_id,
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    /* Discord (Character)
    ====================================================*/
    public async getAllLinkedCharacters(): Promise<discord[]> {
        return await db.discord.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    public async getLinkedCharactersByDiscordId(discord_id: string): Promise<discord | null> {
        return await db.discord.findFirst({
            where: {
                discord_id,
            },
        });
    }

    public async getLinkedCharacterByCharId(char_id: number): Promise<discord | null> {
        return await db.discord.findFirst({
            where: {
                char_id,
            },
        });
    }

    /* Discord Register (User Account)
    ====================================================*/
    public async getLinkedUserByUserId(user_id: number): Promise<discord_register | null> {
        return await db.discord_register.findFirst({
            where: {
                user_id,
            },
        });
    }

    public async getLinkedUserByDiscordId(discord_id: string): Promise<discord_register | null> {
        return await db.discord_register.findFirst({
            where: {
                discord_id,
            },
        });
    }

    /* Launcher Banner
    ====================================================*/
    public async getBannerData(): Promise<launcher_banner[]> {
        return await db.launcher_banner.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    /* Launcher Information
    ====================================================*/
    public async getInformation(type: InformationType): Promise<launcher_info[] | { [key: string]: launcher_info[] }> {
        switch (type) {
            // important info
            case 'IMP': {
                return await db.launcher_info.findMany({
                    where: {
                        type: 'Important',
                    },
                    orderBy: {
                        id: 'asc',
                    },
                });
            }

            // defects and trobles info
            case 'DNT': {
                return await db.launcher_info.findMany({
                    where: {
                        type: 'Defects and Troubles',
                    },
                    orderBy: {
                        id: 'asc',
                    },
                });
            }

            // management and service info
            case 'MAS': {
                return await db.launcher_info.findMany({
                    where: {
                        type: 'Management and Service',
                    },
                    orderBy: {
                        id: 'asc',
                    },
                });
            }

            // in-game events info
            case 'IGE': {
                return await db.launcher_info.findMany({
                    where: {
                        type: 'In-Game Events',
                    },
                    orderBy: {
                        id: 'asc',
                    },
                });
            }

            // updates and maintenance info
            case 'UAM': {
                return await db.launcher_info.findMany({
                    where: {
                        type: 'Updates and Maintenance',
                    },
                    orderBy: {
                        id: 'asc',
                    },
                });
            }

            // all info
            case 'ALL': {
                return {
                    Important: await db.launcher_info.findMany({
                        where: {
                            type: 'Important',
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    }),

                    'Defects and Troubles': await db.launcher_info.findMany({
                        where: {
                            type: 'Defects and Troubles',
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    }),

                    'Management and Service': await db.launcher_info.findMany({
                        where: {
                            type: 'Management and Service',
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    }),

                    'In-Game Events': await db.launcher_info.findMany({
                        where: {
                            type: 'In-Game Events',
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    }),

                    'Updates and Maintenance': await db.launcher_info.findMany({
                        where: {
                            type: 'Updates and Maintenance',
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    }),
                };
            }

            default:
                return [
                    {
                        id: 0,
                        title: '',
                        url: '',
                        type: '',
                        created_at: new Date(),
                    },
                ];
        }
    }

    /* Launcher System
    ====================================================*/
    public async getLauncherSystem(): Promise<launcher_system | null> {
        return await db.launcher_system.findUnique({
            where: {
                id: 1,
            },
        });
    }

    /* Suspended Account
    ====================================================*/
    public async getAllSuspendedUsers(): Promise<suspended_account[]> {
        return await db.suspended_account.findMany({});
    }

    public async getSuspendedUsersByUsername(username: string): Promise<suspended_account | null> {
        return await db.suspended_account.findFirst({
            where: {
                username,
            },
        });
    }

    public async getSuspendedUsersByUserId(user_id: number): Promise<suspended_account | null> {
        return await db.suspended_account.findFirst({
            where: {
                user_id,
            },
        });
    }

    /* Users
    ====================================================*/
    public async getAllUsers(): Promise<{ id: number }[]> {
        return await db.users.findMany({
            orderBy: {
                id: 'asc',
            },
            select: {
                id: true,
            },
        });
    }

    public async getUserByUsername(username: string): Promise<users | null> {
        return await db.users.findUnique({
            where: {
                username,
            },
        });
    }

    public async getUserByUserId(id: number): Promise<users | null> {
        return await db.users.findUnique({
            where: {
                id,
            },
        });
    }

    public async getUserByAuthToken(login_key: string, isMobile: boolean): Promise<users | null> {
        return !isMobile
            ? // pc
              await db.users.findFirst({
                  where: {
                      web_login_key: login_key,
                  },
              })
            : // mobile
              await db.users.findFirst({
                  where: {
                      web_login_key_mobile: login_key,
                  },
              });
    }
}

const ServerData = new ServerDataManager();

export default ServerData;
