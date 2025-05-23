import { PrismaClient, type suspended_account } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { error } from '@sveltejs/kit';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { Buffer } from 'node:buffer'; // Node.jsとの互換性により、追加しないと「ReferenceError: Buffer is not defined」が発生する
import { DATABASE_URL } from '$env/static/private';
import type {  Discord, DiscordRegister } from '$types';

export * from './admin';
export * from './binary';
// export * from './converter';
export * from './postgres';

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
    /* Discord (Character)
    ====================================================*/
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
}

const ServerData = new ServerDataManager();

export default ServerData;
