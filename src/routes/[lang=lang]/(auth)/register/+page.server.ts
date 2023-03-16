import { fail, redirect } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import bcrypt from 'bcrypt';
import { db } from '$lib/database';

export const load: PageServerLoad = async ({ cookies }) => {
    const SIDRegister = crypto.randomUUID();
    cookies.set('SIDRegister', SIDRegister, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 60 * 60,
    });
};

const register: Action = async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const email = data.get('email');
    const password = data.get('password');
    const preRegExp = cookies.get('SIDRegister');
    const emailVerifyCode = crypto.randomUUID();

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        return fail(400, { invalid: true });
    }

    const userExist = await db.users.findUnique({
        where: { username },
    });

    if (userExist) {
        return fail(400, { userExist: true });
    }

    await db.temp_account.create({
        data: {
            username,
            password: await bcrypt.hash(password, 10),
            email,
            email_verify: emailVerifyCode,
            pre_reg_exp: preRegExp,
        },
    });

    /*     await db.users.create({
        data: {
            username,
            password: await bcrypt.hash(password, 10),
        },
    });

    const registeredUser = await db.users.findUnique({
        where: { username },
    });

    const userId = registeredUser.id;

    const lastLoginTime = Math.floor(Date.now() / 1000);

    await db.characters.create({
        data: {
            user_id: userId,
            is_female: false,
            is_new_character: true,
            name: '',
            unk_desc_string: '',
            last_login: lastLoginTime,
        },
    }); */

    throw redirect(303, './conf');
};

export const actions: Actions = { register };
