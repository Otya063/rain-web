import { error } from '@sveltejs/kit';
import { detectLocale, i18n, isLocale } from '$i18n/i18n-util';
import { loadAllLocales } from '$i18n/i18n-util.sync';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { initAcceptLanguageHeaderDetector } from 'typesafe-i18n/detectors';
import { db } from '$ts/database';

loadAllLocales();
const L = i18n();
const securityHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': import.meta.env.VITE_ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export const handle: Handle = async ({ event, resolve }) => {
    const [, lang] = event.url.pathname.split('/');

    if (!lang) {
        const locale = getPreferredLocale(event);
        const redirectUrl = `/${locale}`;
        return new Response(null, {
            status: 302,
            headers: { Location: redirectUrl },
        });
    }

    const locale = isLocale(lang) ? (lang as Locales) : getPreferredLocale(event);
    const LL = L[locale];

    event.locals.locale = locale;
    event.locals.LL = LL;

    const origin = event.request.headers.get('origin');
    const pathname = event.url.pathname;

    if (origin === securityHeaders['Access-Control-Allow-Origin'] && pathname === '/admin') {
        console.log('[Allowed CORS]');

        const response = await resolve(event, {
            transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
        });

        Object.entries(securityHeaders).forEach(([header, value]) => response.headers.set(header, value));
        const newResponse = new Response(response.body, {
            status: 200,
            headers: response.headers,
        });

        return newResponse;
    } else if (origin !== securityHeaders['Access-Control-Allow-Origin'] && pathname === '/admin') {
        console.log('[Admins Normal Browsing.]');

        const session = event.cookies.get('session');
        const redirectURL = encodeURIComponent(`${import.meta.env.VITE_MAIN_DOMAIN}/admin`);
        if (!session) {
            const redirectUrl = `${import.meta.env.VITE_AUTH_DOMAIN}/${event.locals.locale}/login/?redirect_url=${redirectURL}`;
            return new Response(null, {
                status: 302,
                headers: { Location: redirectUrl },
            });
        }

        const launcherSystem = await db.launcher_system.findFirst({
            where: {
                id: 1,
            },
        });
        const authUser = await db.users.findFirst({
            where: {
                authToken: session,
            },
        });
        const isRainAdmin = launcherSystem['rain_admins'].includes(authUser.username);

        if (isRainAdmin) {
            return resolve(event, {
                transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
            });
        } else {
            throw error(403);
        }
    } else {
        console.log('[User Normal Browsing.]');

        return resolve(event, {
            transformPageChunk: ({ html }) => html.replace('%lang%', locale),
        });
    }
};

const getPreferredLocale = ({ request }: RequestEvent) => {
    const acceptLanguageDetector = initAcceptLanguageHeaderDetector(request);
    return detectLocale(acceptLanguageDetector);
};
