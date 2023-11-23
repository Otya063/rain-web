import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db, getServerData } from '$ts/database';

export const load: LayoutServerLoad = async ({ locals: { locale, LL }, url, cookies }) => {
    // when development env, check if the accessing user is admin
    if (url.pathname === '/admin') {
        const session = cookies.get('session');
        const queryRedirect = encodeURIComponent(url.href);
        const redirectUrl = `${import.meta.env.VITE_AUTH_DOMAIN}/${locale}/login/?redirect_url=${queryRedirect}`;

        // go to login page
        if (!session) {
            throw redirect(303, redirectUrl);
        }

        const launcherSystem = await getServerData('getLauncherSystem');
        const authUser = await getServerData('getAuthUserBySession', session);

        // go to login page
        if (!authUser) {
            throw redirect(303, redirectUrl);
        }

        const isRainAdmin = launcherSystem['rain_admins'].includes(authUser.username);
        if (isRainAdmin) {
            return { locale };
        } else {
            throw error(403);
        }
        return { locale };
    } else if (url.href.includes('dev') && url.pathname !== '/admin') {
        // check if the accessing user is admin
        const session = cookies.get('session');
        const queryRedirect = encodeURIComponent(`${import.meta.env.VITE_MAIN_DOMAIN}/admin`);
        const redirectUrl = `${import.meta.env.VITE_AUTH_DOMAIN}/${locale}/login/?redirect_url=${queryRedirect}`;
        if (!session) {
            throw redirect(303, redirectUrl);
        }

        const launcherSystem = await getServerData('getLauncherSystem');

        const authUser = await getServerData('getAuthUserBySession', session);

        if (!authUser) {
            throw redirect(303, redirectUrl);
        }

        const isRainAdmin = launcherSystem['rain_admins'].includes(authUser.username);
        if (isRainAdmin) {
            return { locale };
        } else {
            throw error(403);
        }
    } else {
        return { locale };
    }

    return { locale };
};
