import { convDateToUnix } from '$ts/main';
import { redirect } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import { db } from '$lib/database';

export const load: PageServerLoad = async () => {
    const launcher_system = await db.launcher_system.findUnique({
        where: {
            id: 1,
        },
    });

    const important = await db.launcher_info.findMany({
        where: {
            type: 'Important',
        },
    });

    const defects_and_troubles = await db.launcher_info.findMany({
        where: {
            type: 'Defects and Troubles',
        },
    });

    const management_and_service = await db.launcher_info.findMany({
        where: {
            type: 'Management and Service',
        },
    });

    const ingame_events = await db.launcher_info.findMany({
        where: {
            type: 'In-Game Events',
        },
    });

    const updates_and_maintenance = await db.launcher_info.findMany({
        where: {
            type: 'Updates and Maintenance',
        },
    });

    const users = await db.users.findMany();

    const characters = await db.characters.findMany();
    const charactersWithoutBytes = characters.map(
        ({
            savedata,
            decomyset,
            hunternavi,
            otomoairou,
            partner,
            platebox,
            platedata,
            platemyset,
            rengokudata,
            savemercenary,
            minidata,
            gacha_items,
            house_info,
            login_boost,
            skin_hist,
            scenariodata,
            savefavoritequest,
            mezfes,
            ...rest
        }) => rest
    );

    const banned_users = await db.account_ban.findMany();

    return { launcher_system, important, defects_and_troubles, management_and_service, ingame_events, updates_and_maintenance, users, charactersWithoutBytes, banned_users };
};

const updateSystemData: Action = async ({ request }) => {
    const data = await request.formData();
    const rain_jp = data.get('rain_jp');
    const rain_us = data.get('rain_us');
    const rain_eu = data.get('rain_eu');
    const update = data.get('update_mode');

    let maintenance = {};
    let update_mode: boolean;

    rain_jp === 'on' ? (maintenance.rain_jp = true) : (maintenance.rain_jp = false);
    rain_us === 'on' ? (maintenance.rain_us = true) : (maintenance.rain_us = false);
    rain_eu === 'on' ? (maintenance.rain_eu = true) : (maintenance.rain_eu = false);
    update === 'on' ? (update_mode = true) : (update_mode = false);

    try {
        await db.launcher_system.update({
            where: {
                id: 1,
            },
            data: {
                RainJP: maintenance.rain_jp,
                RainUS: maintenance.rain_us,
                RainEU: maintenance.rain_eu,
                update: update_mode,
            },
        });

        return { success: true, status: 'system_updated', msg_details: "launcher_system" };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, msg_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, msg_details: err };
        } else {
            return { error: true, msg_details: 'Unexpected Error.' };
        }
    }
};

const createInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const title = data.get('info_title');
    const url = data.get('info_url');
    const type = data.get('info_type');
    const created_at = Math.floor(Date.now() / 1000);

    try {
        await db.launcher_info.create({
            data: {
                title,
                url,
                type,
                created_at,
            },
        });

        return { success: true, status: 'info_created' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, msg_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, msg_details: err };
        } else {
            return { error: true, msg_details: 'Unexpected Error.' };
        }
    }
};

const updateInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('info_id'));
    const title = data.get('info_title');
    const url = data.get('info_url');
    const type = data.get('info_type');
    const date_value = data.get('info_date');

    try {
        await db.launcher_info.update({
            where: {
                id,
            },
            data: {
                title,
                url,
                type,
                created_at: convDateToUnix(date_value),
            },
        });

        return { success: true, status: 'info_updated' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, msg_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, msg_details: err };
        } else {
            return { error: true, msg_details: 'Unexpected Error.' };
        }
    }
};

const deleteInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('info_id'));

    try {
        await db.launcher_info.delete({
            where: {
                id,
            },
        });

        return { success: true, status: 'info_deleted' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, msg_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, msg_details: err };
        } else {
            return { error: true, msg_details: 'Unexpected Error.' };
        }
    }
};

const updateUserData: Action = async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('user_id'));
    const username = data.get('user_username');
    const last_character = Number(data.get('user_last_character'));

    try {
        await db.users.update({
            where: {
                id,
            },
            data: {
                username,
                last_character,
            },
        });

        return { success: true, status: 'user_updated' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, msg_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, msg_details: err };
        } else {
            return { error: true, msg_details: 'Unexpected Error.' };
        }
    }
};

const banUser: Action = async ({ request }) => {
    const data = await request.formData();
    const character_id = data.getAll('character_id');
    const user_id = Number(data.get('user_id'));
    const username = data.get('user_username');
    const date = Math.floor(Date.now() / 1000);

    try {
        for (const char_id of character_id) {
            await db.characters.update({
                where: {
                    id: Number(char_id),
                },
                data: {
                    deleted: true,
                },
            });
        }

        await db.account_ban.create({
            data: {
                user_id,
                username,
                reason: 'test reason.',
                date,
            },
        });

        return { success: true, status: 'user_banned' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, msg_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, msg_details: err };
        } else {
            return { error: true, msg_details: 'Unexpected Error.' };
        }
    }
};

const removeBanUser: Action = async ({ request }) => {
    const data = await request.formData();
    const character_id = data.getAll('character_id');
    const user_id = Number(data.get('user_id'));

    try {
        for (const char_id of character_id) {
            await db.characters.update({
                where: {
                    id: Number(char_id),
                },
                data: {
                    deleted: false,
                },
            });
        }

        await db.account_ban.delete({
            where: {
                user_id,
            },
        });

        return { success: true, status: 'removed_ban' };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, msg_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, msg_details: err };
        } else {
            return { error: true, msg_details: 'Unexpected Error.' };
        }
    }
};

export const actions: Actions = { updateSystemData, createInfoData, updateInfoData, deleteInfoData, updateUserData, banUser, removeBanUser };
