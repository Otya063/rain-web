import type { Handle, HandleServerError, RequestEvent } from '@sveltejs/kit';
import { initAcceptLanguageHeaderDetector } from 'typesafe-i18n/detectors';
import { ADMIN_CREDENTIALS, ADMIN_IP } from '$env/static/private';
import { PUBLIC_MAIN_DOMAIN, PUBLIC_AUTH_DOMAIN } from '$env/static/public';
import type { Locales } from '$i18n/i18n-types';
import { loadAllLocales } from '$i18n/i18n-util.sync';
import { detectLocale, i18n, isLocale } from '$i18n/i18n-util';
import { PostgresManager } from '$utils/server';

loadAllLocales();
const L = i18n();

export const handleError: HandleServerError = async ({ error }) => {
    const _error = error as any;
    console.error(_error.stack);

    return {
        message: _error.stack?.split('\n')[0],
    };
};

export const handle: Handle = async ({ event, resolve }) => {
    // Basic認証
    const auth = event.request.headers.get('Authorization');
    if (!event.url.origin.includes('localhost') && !['/admin/', '/maintenance/', '/img/'].some((path) => event.url.pathname.includes(path))) {
        if (auth !== `Basic ${btoa(ADMIN_CREDENTIALS)}`) {
            return new Response('Unauthorized User', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="User Visible Realm", charset="UTF-8"',
                },
            });
        }
    }

    if (event.platform?.env.MAINTENANCE_MODE === 'true' && event.url.pathname !== '/maintenance/') {
        const res = await fetch('https://api.ipify.org?format=json');
        const ip = (await res.json()).ip as string;

        if (ADMIN_IP !== ip) {
            return new Response(null, {
                status: 302,
                headers: { Location: '/maintenance' },
            });
        }
    }

    const [, lang] = event.url.pathname.split('/');
    const locale = isLocale(lang) ? (lang as Locales) : getPreferredLocale(event);
    const LL = L[locale];

    event.locals.locale = locale;
    event.locals.LL = LL;

    if (!lang) {
        const locale = getPreferredLocale(event);
        const redirectUrl = `/${locale}`;
        return new Response(null, {
            status: 302,
            headers: { Location: redirectUrl },
        });
    }

    if (event.url.pathname === '/admin/') {
        console.log('[Admins Normal Browsing.]');

        // 本番環境の時、ユーザーが管理者か確認
        if (!event.url.origin.includes('localhost')) {
            const session = event.cookies.get('rainLoginKey');
            if (!session) {
                const redirectUrl = `${PUBLIC_AUTH_DOMAIN}/${event.locals.locale}/login/?redirect_url=${PUBLIC_MAIN_DOMAIN}/admin`;

                return new Response(null, {
                    status: 302,
                    headers: { Location: redirectUrl },
                });
            }

            const regex = /iphone;|(android|nokia|blackberry|bb10;).+mobile|android.+fennec|opera.+mobi|windows phone|symbianos/i;
            const isMobile = regex.test(event.request.headers.get('user-agent')!);
            const sql = new PostgresManager('get', 'authUser', { loginKey: session, isMobile });
            const username = await sql.execute();
            if (!username) {
                const redirectUrl = `${PUBLIC_AUTH_DOMAIN}/${event.locals.locale}/login/?redirect_url=${PUBLIC_MAIN_DOMAIN}/admin`;

                return new Response(null, {
                    status: 302,
                    headers: { Location: redirectUrl },
                });
            }

            event.locals.authUsername = username;
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
