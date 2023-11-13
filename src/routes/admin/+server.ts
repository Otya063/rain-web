import { getServerData, requestActToServer } from '$ts/database';
import { decToLittleEndian, getWpnTypeByDec } from '$ts/main';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const requestData = await request.json();
    switch (requestData[1]) {
        case 1:
            const data: [] = await getServerData(requestData[2], requestData[3], requestData[4]);

            if (data === 'Nothing') {
                return json({
                    success: false,
                    Message: 'No Data',
                });
            }

            // get information
            if (requestData[2] === 'getInformation' && requestData[3] === 'all') {
                const data1 = await getServerData('getInformation', 1);
                const data2 = await getServerData('getInformation', 2);
                const data3 = await getServerData('getInformation', 3);
                const data4 = await getServerData('getInformation', 4);
                const data5 = await getServerData('getInformation', 5);

                return json({
                    success: true,
                    data1,
                    data2,
                    data3,
                    data4,
                    data5,
                });
                // get characters by user id
            } else if (requestData[2] === 'getCharactersByUId') {
                // if lang option isn't selected
                if (requestData[4] === undefined) {
                    return json({
                        success: false,
                        Message: 'Invalid Input',
                    });
                } else {
                    switch (requestData[4]) {
                        case 'ja': {
                            const { meleeJA } = await import('$i18n/ja/meleeData');
                            const newObj = data.map((character) => ({
                                ...character,
                                weapon_id_name: meleeJA[decToLittleEndian(character.weapon_id)],
                                weapon_type_name: getWpnTypeByDec(character.weapon_type, requestData[4]),
                            }));

                            return json({
                                success: true,
                                data: newObj,
                            });
                        }

                        case 'en': {
                            const { meleeEN } = await import('$i18n/en/meleeData');
                            const newObj = data.map((character) => ({
                                ...character,
                                weapon_id_name: meleeEN[decToLittleEndian(character.weapon_id)],
                                weapon_type_name: getWpnTypeByDec(character.weapon_type, requestData[4]),
                            }));

                            return json({
                                success: true,
                                data: newObj,
                            });
                        }
                    }
                }
            } else {
                return json({
                    success: true,
                    data,
                });
            }

            break;

        case 2:
            const status = await requestActToServer(requestData[2], requestData[3]);
            console.log(status);

            return json({
                status,
            });
    }
};
