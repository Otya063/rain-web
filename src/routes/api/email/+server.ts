import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    const data = await event.request.formData();
    const username = data.get('username');
    const email = data.get('email');

    // send email

    console.log(username, email);
    return json({
        success: true,
    });
};
