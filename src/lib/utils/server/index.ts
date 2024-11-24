import { PrismaClient, type characters, type discord, type launcher_banner, type suspended_account } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { error } from '@sveltejs/kit';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { Buffer } from 'node:buffer'; // Node.jsとの互換性により、追加しないと「ReferenceError: Buffer is not defined」が発生する
import { DATABASE_URL } from '$env/static/private';
import type { InformationType, Distribution, Discord, DiscordRegister, LauncherInfo, LauncherSystem, Users } from '$types';

/* utils内に定義できない処理をここに書く */
export * from './admin';
export * from './binary';
export * from './converter';

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
                    until_at?: string,
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
                async remove(
                    characterId: number,
                    permanent: boolean,
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
            guilds: {
                async rebuild(
                    clanId: number,
                    clanName: string,
                ): Promise<{
                    success: boolean;
                    message: string | number;
                }> {
                    try {
                        const originClanData = await db.guilds.findFirst({
                            where: {
                                id: clanId,
                            },
                        });
                        if (!originClanData) {
                            return { success: false, message: 'No clan data found.' };
                        }

                        // 「Cannot read properties of undefined (reading 'length')」エラーによりqueryRawは使用できない（cloudflareとの相性？）
                        // executeRawでは「Returning id」でidを取得できない
                        await db.$executeRaw`INSERT INTO guilds (name, created_at, leader_id, main_motto, rank_rp, comment, icon, sub_motto, item_box, event_rp, pugi_name_1, pugi_name_2, pugi_name_3, recruiting, pugi_outfit_1, pugi_outfit_2, pugi_outfit_3, pugi_outfits, tower_mission_page, tower_rp) VALUES (${
                            originClanData.name
                        }, ${new Date()}, ${originClanData.leader_id}, ${originClanData.main_motto}, ${originClanData.rank_rp}, ${originClanData.comment}, decode(${
                            !originClanData.icon ? null : Buffer.from(Uint8Array.from(originClanData.icon)).toString('base64')
                        }, 'base64'), ${originClanData.sub_motto}, decode(${!originClanData.item_box ? null : Buffer.from(Uint8Array.from(originClanData.item_box)).toString('base64')}, 'base64'), ${
                            originClanData.event_rp
                        }, ${originClanData.pugi_name_1}, ${originClanData.pugi_name_2}, ${originClanData.pugi_name_3}, ${originClanData.recruiting}, ${originClanData.pugi_outfit_1}, ${
                            originClanData.pugi_outfit_2
                        }, ${originClanData.pugi_outfit_3}, ${originClanData.pugi_outfits}, ${originClanData.tower_mission_page}, ${originClanData.tower_rp})`;

                        // インサートしたレコードのidを取得する
                        const newClanId = (
                            await db.guilds.findMany({
                                where: {
                                    name: clanName,
                                },
                                orderBy: {
                                    id: 'desc',
                                },
                            })
                        )[0].id;

                        const oneDayLater = new Date(Date.now() + 24 * 60 * 60 * 1000); // 現在時刻から1日後の日時
                        await db.$executeRaw`UPDATE guild_characters SET guild_id = ${newClanId}, joined_at = ${oneDayLater} WHERE guild_id = ${clanId}`;

                        // 旧クランデータ削除
                        await db.guilds.delete({
                            where: {
                                id: clanId,
                            },
                        });

                        return { success: true, message: newClanId };
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

/**
 * キャラクターがログインしているかどうかを確認する
 */
export class IsCharLogin {
    constructor(private characterId: number | number[]) {}

    /**
     * 単一のキャラクターIDに対してログイン状態を確認する
     * @returns {Promise<boolean>} ログインしている場合はtrue、していない場合はfalseを返す
     */
    public async checkSingle(): Promise<boolean> {
        if (typeof this.characterId === 'number') {
            const session = await db.sign_sessions.findFirst({
                where: {
                    char_id: this.characterId,
                },
            });

            if (!session) {
                return false;
            } else {
                return true;
            }
        } else {
            error(400, { message: '', message1: undefined, message2: ['Can\'t call "checkSingle" with an array of numbers.'], message3: undefined });
        }
    }

    /**
     * 複数のキャラクターIDに対してログイン状態を確認する
     * @returns {Promise<{check: boolean; charIds: number[]}>} ログインしているキャラクターIDの配列と状態を返す
     */
    public async checkMulti(): Promise<{
        check: boolean;
        charIds: number[];
    }> {
        if (Array.isArray(this.characterId)) {
            const sessions = await db.sign_sessions.findMany({
                where: {
                    char_id: { in: this.characterId },
                },
            });

            const charIds: number[] = sessions.map((session) => session.char_id!);
            if (!charIds.length) {
                return { check: false, charIds: [] };
            } else {
                return { check: true, charIds };
            }
        } else {
            error(400, { message: '', message1: undefined, message2: ['Can\'t call "checkMulti" with a single number'], message3: undefined });
        }
    }
}

/**
 * データベース操作
 */
class ServerDataManager {
    /* Character
    ====================================================*/
    /**
     * 全てのキャラクターを取得する
     * @returns {Promise<characters[]>} キャラクターオブジェクトの配列を返す
     */
    public async getAllCharacters(): Promise<characters[]> {
        return await db.characters.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    /**
     * ユーザーIDに基づいてキャラクターを取得する
     * @param {number} user_id ユーザーID
     * @returns {Promise<characters[]>} 指定されたユーザーIDのキャラクター配列を返す
     */
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
    /**
     * 連携済みの全てのキャラクターを取得する
     * @returns {Promise<discord[]>} 連携されたキャラクターオブジェクトの配列を返す
     */
    public async getAllLinkedCharacters(): Promise<discord[]> {
        return await db.discord.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    /**
     * Discord IDに基づいて連携キャラクターを取得する
     * @param {string} discord_id Discord ID
     * @returns {Promise<Discord>} キャラクターが見つかった場合はそのオブジェクト、見つからなかった場合はnullを返す
     */
    public async getLinkedCharactersByDiscordId(discord_id: string): Promise<Discord> {
        return await db.discord.findFirst({
            where: {
                discord_id,
            },
        });
    }

    /**
     * キャラクターIDに基づいて連携キャラクターを取得する
     * @param {number} char_id キャラクターID
     * @returns {Promise<Discord>} キャラクターが見つかった場合はそのオブジェクト、見つからなかった場合はnullを返す
     */
    public async getLinkedCharacterByCharId(char_id: number): Promise<Discord> {
        return await db.discord.findFirst({
            where: {
                char_id,
            },
        });
    }

    /* Discord Register (User Account)
    ====================================================*/
    /**
     * ユーザーIDに基づいて連携されたユーザーを取得する
     * @param {number} user_id ユーザーID
     * @returns {Promise<DiscordRegister>} ユーザーが見つかった場合はそのオブジェクト、見つからなかった場合はnullを返す
     */
    public async getLinkedUserByUserId(user_id: number): Promise<DiscordRegister> {
        return await db.discord_register.findFirst({
            where: {
                user_id,
            },
        });
    }

    /**
     * Discord IDに基づいて連携されたユーザーを取得する
     * @param {string} discord_id Discord ID
     * @returns {Promise<DiscordRegister>} ユーザーが見つかった場合はそのオブジェクト、見つからなかった場合はnullを返す
     */
    public async getLinkedUserByDiscordId(discord_id: string): Promise<DiscordRegister> {
        return await db.discord_register.findFirst({
            where: {
                discord_id,
            },
        });
    }

    /* Launcher Banner
    ====================================================*/
    /**
     * ランチャーのバナーデータを取得する
     * @returns {Promise<launcher_banner[]>} バナーオブジェクトの配列を返す
     */
    public async getBannerData(): Promise<launcher_banner[]> {
        return await db.launcher_banner.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    /* Launcher Information
    ====================================================*/
    /**
     * ランチャーインフォを取得する
     * @param {InformationType} type インフォの種類
     * @returns {Promise<LauncherInfo>} 指定されたインフォのオブジェクトを返す
     */
    public async getInformation(type: InformationType): Promise<LauncherInfo> {
        // 各タイプごとにインフォを取得する
        switch (type) {
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
                error(400, { message: '', message1: undefined, message2: [`Unsupported type: ${type}.`], message3: undefined });
        }
    }

    /* Launcher System
    ====================================================*/
    /**
     * ランチャーシステムデータを取得する
     * @returns {Promise<LauncherSystem>} ランチャーシステムのオブジェクトを返す
     */
    public async getLauncherSystem(): Promise<LauncherSystem> {
        return await db.launcher_system.findUnique({
            where: {
                id: 1,
            },
        });
    }

    /* Suspended Account
    ====================================================*/
    /**
     * 全ての凍結されたアカウントを取得する
     * @returns {Promise<suspended_account[]>} 凍結アカウントオブジェクトの配列を返す
     */
    public async getAllSuspendedUsers(): Promise<suspended_account[]> {
        return await db.suspended_account.findMany({});
    }

    /**
     * ユーザー名に基づいて、凍結されたアカウントを取得する
     * @param {string} username ユーザー名
     * @returns {Promise<suspended_account[] | null>} 凍結アカウントオブジェクトの配列を返す
     */
    public async getSuspendedUsersByUsername(username: string): Promise<suspended_account | null> {
        return await db.suspended_account.findFirst({
            where: {
                username,
            },
        });
    }

    /**
     * ユーザーIDに基づいて、凍結されたアカウントを取得する
     * @param {string} user_id ユーザーID
     * @returns {Promise<suspended_account[] | null>} 凍結アカウントオブジェクトの配列を返す
     */
    public async getSuspendedUsersByUserId(user_id: number): Promise<suspended_account | null> {
        return await db.suspended_account.findFirst({
            where: {
                user_id,
            },
        });
    }

    /* Users
    ====================================================*/
    /**
     * 全てのユーザーID情報を取得する
     * @returns {Promise<{ id: number }[]>} ユーザーIDオブジェクトの配列を返す
     */
    public async getAllUsersID(): Promise<{ id: number }[]> {
        return await db.users.findMany({
            orderBy: {
                id: 'asc',
            },
            select: {
                id: true,
            },
        });
    }

    /**
     * ユーザー名に基づいて特定のユーザーを取得する
     * @param {string} username 検索するユーザーのユーザー名
     * @returns {Promise<Users>} 指定されたユーザー名を持つユーザーオブジェクト、存在しない場合はnull
     */
    public async getUserByUsername(username: string): Promise<Users> {
        return await db.users.findUnique({
            where: {
                username,
            },
        });
    }

    /**
     * ユーザーIDに基づいて特定のユーザーを取得する
     * @param {number} id 検索するユーザーのID
     * @returns {Promise<Users>} 指定されたIDを持つユーザーオブジェクト、存在しない場合はnull
     */
    public async getUserByUserId(id: number): Promise<Users> {
        return await db.users.findUnique({
            where: {
                id,
            },
        });
    }

    /**
     * 認証トークンに基づいてユーザーを取得する
     * @param {string} login_key 認証トークン
     * @param {boolean} isMobile モバイルかどうかを示すフラグ
     * @returns {Promise<Users>} 指定された認証トークンを持つユーザーオブジェクト、存在しない場合はnull
     */
    public async getUserByAuthToken(login_key: string, isMobile: boolean): Promise<Users> {
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

    /* Distributions
    ========================================================= */
    /**
     * 配布情報のリストを取得する
     * @returns {Distribution[]} dataフィールドとbotフィールドを除いた配布情報の配列
     */
    public async getDistributions(): Promise<Distribution[]> {
        const distributions = await db.distribution.findMany({
            select: {
                id: true,
                character_id: true,
                type: true,
                deadline: true,
                event_name: true,
                description: true,
                times_acceptable: true,
                min_hr: true,
                max_hr: true,
                min_sr: true,
                max_sr: true,
                min_gr: true,
                max_gr: true,
                data: true,
            },
        });

        // dataをhex文字列に変換
        return distributions.map((distribution) => {
            const { data, ...rest } = distribution; // Buffer型のdataを削除

            return {
                ...rest,
                data: data.toString('hex'), // dataをhex文字列に変換
            };
        });
    }
}

const ServerData = new ServerDataManager();

export default ServerData;
