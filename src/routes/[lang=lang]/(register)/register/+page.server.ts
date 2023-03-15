import { fail, redirect } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import bcrypt from 'bcrypt';
import { db } from '$lib/database';

export const load: PageServerLoad = async () => {
    // todo
};

const register: Action = async ({ request }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        return fail(400, { message: 'ユーザー名・パスワードを入力してください。' });
    }

    const userExist = await db.users.findUnique({
        where: { username },
    });

    if (userExist) {
        return fail(400, { message: '既に存在するユーザーです。' });
    }

    await db.users.create({
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
    });

    throw redirect(303, '/');
};

export const actions: Actions = { register };
