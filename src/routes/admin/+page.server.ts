import { convDateToUnix, convFormDataToObj } from '$ts/main';
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

const updateSystemMode: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const column: string = Object.keys(data_obj)[0];
    const value: boolean = Object.values(data_obj)[0];

    try {
        // when updating the system mode one by one (success)
        await db.launcher_system.update({
            where: {
                id: 1,
            },
            data: {
                [column]: value,
            },
        });

        return { success: true, status: 'system_updated' };
    } catch (err) {
        // when updating the system mode one by one (error)
        if (column !== 'maint_all') {
            if (err instanceof Error) {
                return { error: true, err_details: err.message };
            } else if (typeof err === 'string') {
                return { error: true, err_details: err };
            } else {
                return { error: true, err_details: 'Unexpected Error.' };
            }
        }

        try {
            // when updating all maintenance modes (success)
            await db.launcher_system.update({
                where: {
                    id: 1,
                },
                data: {
                    RainJP: value,
                    RainEU: value,
                    RainUS: value,
                },
            });

            return { success: true, status: 'maint_all_updated' };
        } catch (err) {
            // when updating all maintenance modes (error)
            if (err instanceof Error) {
                return { error: true, err_details: err.message };
            } else if (typeof err === 'string') {
                return { error: true, err_details: err };
            } else {
                return { error: true, err_details: 'Unexpected Error.' };
            }
        }
    }
};

const createInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const title: string = data_obj['title'];
    const url: string = data_obj['url'];
    const type: string = data_obj['type'];
    const created_at: number = Math.floor(Date.now() / 1000);

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
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

const updateInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const data_obj = convFormDataToObj(data);
    const id: number = Number(data_obj['info_id']);
    const column: string = Object.keys(data_obj)[1];
    let value: string | number = Object.values(data_obj)[1];
    column === 'created_at' && (value = convDateToUnix(value));
    let dup_errors = {};

    const title_exist = await db.launcher_info.findMany({
        where: {
            title: data_obj['title'],
        },
    });
    const url_exist = await db.launcher_info.findMany({
        where: {
            url: data_obj['url'],
        },
    });

    title_exist && (dup_errors['dup_title'] = `The title you set (${title_exist}) is a duplicate of another title.`);
    url_exist && (dup_errors['dup_url'] = `The title you set (${url_exist}) is a duplicate of another title.`);

    if (Object.keys(dup_errors).length > 0) {
        return { error: true, dup_errors };
    } else {
        try {
            await db.launcher_info.update({
                where: {
                    id,
                },
                data: {
                    [column]: value,
                },
            });

            return { success: true, status: 'info_updated', info_id: id };
        } catch (err) {
            if (err instanceof Error) {
                return { error: true, err_details: err.message };
            } else if (typeof err === 'string') {
                return { error: true, err_details: err };
            } else {
                return { error: true, err_details: 'Unexpected Error.' };
            }
        }
    }
};

const deleteInfoData: Action = async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('info_id'));
    console.log(id);

    try {
        await db.launcher_info.delete({
            where: {
                id,
            },
        });

        return { success: true, status: 'info_deleted', info_id: id };
    } catch (err) {
        if (err instanceof Error) {
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
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
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
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
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
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
            return { error: true, err_details: err.message };
        } else if (typeof err === 'string') {
            return { error: true, err_details: err };
        } else {
            return { error: true, err_details: 'Unexpected Error.' };
        }
    }
};

export const actions: Actions = { updateSystemMode, createInfoData, updateInfoData, deleteInfoData, updateUserData, banUser, removeBanUser };
