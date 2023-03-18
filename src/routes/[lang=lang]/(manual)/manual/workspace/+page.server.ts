import type { PageServerLoad } from './$types';
import bcrypt from 'bcrypt';

export const load: PageServerLoad = async () => {
    const number = '1234';
    const bcrypted = bcrypt.hash(number, 10);

    return {
        bcrypted,
    };
};
