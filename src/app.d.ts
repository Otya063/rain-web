import type { Locales, TranslationFunctions } from '$i18n/i18n-types';
import type { users } from '@prisma/client';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            locale: Locales;
            LL: TranslationFunctions;
            authUser: users;
        }
        // interface PageData {}
        interface Platform {
            env: {
                MAINTENANCE_MODE: string;
                MAINTENANCE_DATE: string;
            };
        }
    }
}

export {};
