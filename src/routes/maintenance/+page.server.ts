import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
    if (platform?.env.MAINTENANCE_MODE !== 'true') {
        error(404);
    } else {
        // UTC表記
        const date = platform?.env.MAINTENANCE_DATE;
        return { date };
    }
};
