import type { R2Bucket } from '@cloudflare/workers-types';
import type { users } from '@prisma/client';
import type { Locales, TranslationFunctions } from '$i18n/i18n-types';

declare global {
    namespace App {
        interface Error {
            message1?: string;
            message2?: string[];
            message3?: string;
        }
        interface Locals {
            locale: Locales;
            LL: TranslationFunctions;
            authUsername: string;
        }
        // interface PageData {}
        interface Platform {
            env: {
                MAINTENANCE_MODE: string;
                MAINTENANCE_DATE: string;
                R2: R2Bucket;
            };
        }
    }
}

export {};
