import { getServerData } from '$ts/main';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const requestData = await request.json();
    const data = await getServerData(requestData[1], requestData[2]);

    if (data === 'Nothing') {
        return json({
            success: false,
            Message: 'Something Wrong!',
        });
    }

    if (requestData[1] === 'information' && requestData[2] === 'all') {
        const data1 = await getServerData('information', 1);
        const data2 = await getServerData('information', 2);
        const data3 = await getServerData('information', 3);
        const data4 = await getServerData('information', 4);
        const data5 = await getServerData('information', 5);

        return json({
            success: true,
            data1,
            data2,
            data3,
            data4,
            data5,
        });
    } else {
        return json({
            success: true,
            data,
        });
    }
};
