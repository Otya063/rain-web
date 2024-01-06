import { error } from '@sveltejs/kit';
import { detectLocale, i18n, isLocale } from '$i18n/i18n-util';
import { loadAllLocales } from '$i18n/i18n-util.sync';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { initAcceptLanguageHeaderDetector } from 'typesafe-i18n/detectors';
import { db, getServerData, type User } from '$ts/database';
import { ALLOW_ORIGIN } from '$env/static/private';

loadAllLocales();
const L = i18n();

export const handle: Handle = async ({ event, resolve }) => {
    const auth = event.request.headers.get('Authorization');
    if (!event.url.origin.includes('localhost') && event.url.pathname !== '/admin') {
        if (auth !== `Basic ${btoa(import.meta.env.VITE_ADMIN_CREDENTIALS)}`) {
            return new Response('Not authorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="User Visible Realm", charset="UTF-8"',
                },
            });
        }
    }

    const [, lang] = event.url.pathname.split('/');
    const locale = isLocale(lang) ? (lang as Locales) : getPreferredLocale(event);
    const LL = L[locale];
    if (!lang) {
        const locale = getPreferredLocale(event);
        const redirectUrl = `/${locale}`;
        return new Response(null, {
            status: 302,
            headers: { Location: redirectUrl },
        });
    }

    event.locals.locale = locale;
    event.locals.LL = LL;
    
    if (event.url.pathname === '/admin') {
        console.log('[Admins Normal Browsing.]');

        // when prod env, check if the user is an admin
        if (!event.url.origin.includes('localhost')) {
            const session = event.cookies.get('rainLoginKey');
            if (!session) {
                const redirectUrl = `${import.meta.env.VITE_AUTH_DOMAIN}/${event.locals.locale}/login/?redirect_url=${import.meta.env.VITE_MAIN_DOMAIN}/admin`;

                return new Response(null, {
                    status: 302,
                    headers: { Location: redirectUrl },
                });
            }

            const authUser = (await getServerData('getAuthUserBySession', session)) as User;
            if (!authUser) {
                const redirectUrl = `${import.meta.env.VITE_AUTH_DOMAIN}/${event.locals.locale}/login/?redirect_url=${import.meta.env.VITE_MAIN_DOMAIN}/admin`;

                return new Response(null, {
                    status: 302,
                    headers: { Location: redirectUrl },
                });
            }

            event.locals.authUser = authUser;
        }

        return resolve(event, {
            transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
        });
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
