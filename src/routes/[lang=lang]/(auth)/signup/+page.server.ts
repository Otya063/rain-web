import { fail, redirect } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import bcrypt from 'bcryptjs';
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

const signup: Action = async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');
    const salt = await bcrypt.genSalt(12);
    const hashed_pass = await bcrypt.hash(String(password), salt);
    const pre_reg_exp = cookies.get('SIDRegister');

    // username existing check
    const user_exist = await db.users.findUnique({
        where: { username },
    });

    let errors = {};
    const credentials = { username, password };

    // error handling
    (typeof username !== 'string' || !username) && (errors.invalidUsername = true);
    (typeof password !== 'string' || !password) && (errors.invalidPassword = true);
    user_exist && (errors.userExist = true);

    if (Object.keys(errors).length > 0) {
        return { errors, credentials };
    } else {
        
            await db.users.create({
                data: {
                    username: String(username),
                    password: hashed_pass,
                },
            });

            const registered_user = await db.users.findUnique({
                where: {
                    username: String(username),
                },
            });

            const reg_userId = registered_user.id;

            const lastLoginTime = Math.floor(Date.now() / 1000);

            await db.characters.create({
                data: {
                    user_id: reg_userId,
                    is_female: false,
                    is_new_character: true,
                    last_login: lastLoginTime,
                },
            });
    }

    throw redirect(303, '/');
};

export const actions: Actions = { signup };
