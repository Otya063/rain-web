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
    const email = data.get('email');
    const password = data.get('password');
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('Password Here', salt);
    const preRegExp = cookies.get('SIDRegister');
    const emailVerifyCode = crypto.randomUUID();

    // username existing check
    const userExist = await db.users.findUnique({
        where: { username },
    });

    let errors = {};
    const credentials = { email, username, password };

    // error handling
    (typeof email !== 'string' || !email) && (errors.invalidEmail = true);
    (typeof username !== 'string' || !username) && (errors.invalidUsername = true);
    (typeof password !== 'string' || !password) && (errors.invalidPassword = true);
    userExist && (errors.userExist = true);

    if (Object.keys(errors).length > 0) {
        return { errors, credentials };
    } else {
        /* await db.temp_account.create({
            data: {
                username,
                password: hashedPass,
                email,
                email_verify: emailVerifyCode,
                pre_reg_exp: preRegExp,
            },
        }); */
    }

    //throw redirect(303, './conf');
    throw redirect(303, '/');
};

export const actions: Actions = { signup };
