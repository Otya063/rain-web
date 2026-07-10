import type { ParamMatcher } from '@sveltejs/kit';
import { isLocale } from '$i18n/i18n-util';

// URLのセグメントとして有効な言語のみを受け入れる
export const match: ParamMatcher = (param) => {
    return isLocale(param);
};
