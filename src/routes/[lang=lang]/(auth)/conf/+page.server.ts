import type { PageServerLoad } from './$types';
import { db } from '$lib/database';

export const load: PageServerLoad = async ({ cookies }) => {
    const SIDRegister = cookies.get('SIDRegister');

    const userPreReg = await db.temp_account.findUnique({
        where: { pre_reg_exp: SIDRegister },
    });

    return {
        userPreReg,
    };
};
