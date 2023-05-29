import { fail, redirect } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import { db } from '$lib/database';

export const load: PageServerLoad = async () => {
    const launcher_system = await db.launcher_system.findUnique({
        where: {
            id: 1,
        },
    });

    return { launcher_system };
};

const maintUpdateData: Action = async ({ request }) => {
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

    await db.launcher_system.update({
        where: {
            id: 1,
        },
        data: {
            maint_jp: maintenance.rain_jp,
            maint_us: maintenance.rain_us,
            maint_eu: maintenance.rain_eu,
            update: update_mode,
        },
    });

    throw redirect(303, '/admin');
};

const infoData: Action = async ({ request }) => {
    const data = await request.formData();
    const info = data.get('info');

    console.log(info);
};

export const actions: Actions = { maintUpdateData, infoData };
