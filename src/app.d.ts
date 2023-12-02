type Locales = import('$i18n/i18n-types').Locales
type TranslationFunctions = import('$i18n/i18n-types').TranslationFun
import type { User } from '$ts/database'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			locale: Locales
			LL: TranslationFunctions
			authUser: User
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};