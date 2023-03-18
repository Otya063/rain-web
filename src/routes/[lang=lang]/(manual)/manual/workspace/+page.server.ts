import type { PageServerLoad } from './$types';
import { bcrypt } from 'hash-wasm';
import { browser } from '$app/environment';

export const load: PageServerLoad = async () => {
    const salt = new Uint8Array(16);
    browser && window.crypto.getRandomValues(salt);

    const key = await bcrypt({
        password: 'otya1542',
        salt,
        costFactor: 11,
        outputType: 'encoded',
    });

    return {
        key,
    };
};
