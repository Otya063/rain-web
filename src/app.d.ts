import type { R2Bucket, KVNamespace } from '@cloudflare/workers-types';
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
            adminUserId: number | null;
            adminUsername: string | null;
        }
        // interface PageData {}
        interface Platform {
            env: {
                MAINTENANCE_MODE: string;
                MAINTENANCE_DATE: string;
                R2: R2Bucket;
                DB_CONFIG: KVNamespace;
                WEB_CONFIG: KVNamespace;
            };
        }
    }
}

export {};
