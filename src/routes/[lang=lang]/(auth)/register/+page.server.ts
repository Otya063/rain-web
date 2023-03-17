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

    let errors = {};
    const credentials = { email, username, password };

    (typeof email !== 'string' || !email) && (errors.invalidEmail = true);
    (typeof username !== 'string' || !username) && (errors.invalidUsername = true);
    (typeof password !== 'string' || !password) && (errors.invalidPassword = true);

    const userExist = await db.users.findUnique({
        where: { username },
    });

    userExist && (errors.userExist = true);

    if (Object.keys(errors).length > 0) {
        return { errors, credentials };
    } else {
        await db.temp_account.create({
            data: {
                username,
                password: await bcrypt.hash(password, 10),
                email,
                email_verify: emailVerifyCode,
                pre_reg_exp: preRegExp,
            },
        });
    }

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
