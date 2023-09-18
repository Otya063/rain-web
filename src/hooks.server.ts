import { detectLocale, i18n, isLocale } from '$i18n/i18n-util';
import { loadAllLocales } from '$i18n/i18n-util.sync';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { initAcceptLanguageHeaderDetector, localStorageDetector } from 'typesafe-i18n/detectors';

loadAllLocales();
const L = i18n();
const securityHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': 'http://192.168.11.10',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export const handle: Handle = async ({ event, resolve }) => {
    const [, lang] = event.url.pathname.split('/');

    if (!lang) {
        const locale = getPreferredLocale(event);
        const redirectUrl = `/${locale}/manual`;
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
        const response = await resolve(event, {
            transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
        });

        Object.entries(securityHeaders).forEach(([header, value]) => response.headers.set(header, value));
        console.log('[Allowed CORS]');
        return response;
    } else if (origin !== securityHeaders['Access-Control-Allow-Origin'] && pathname === '/admin') {
        console.log('[Admins Normal Browsing.]');
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
