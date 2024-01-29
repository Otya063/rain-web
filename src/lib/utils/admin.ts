import type { launcher_banner, launcher_info } from '@prisma/client/edge';
import type { PaginatedUsers, PaginationMeta } from '$lib/types';
import { writable } from 'svelte/store';

export const filterValue = writable('');
export const filterParam = writable('');
export const adminTabValue = writable<string | null>('');
export const onSubmit = writable(false);
export const allInformation = writable<{ [key: string]: launcher_info[] }>();
export const allBanners = writable<launcher_banner[]>();
export const paginatedUsersData = writable<PaginatedUsers[]>();
export const paginationMetaData = writable<PaginationMeta>();

/* Upload File
====================================================*/
export const uploadFileViaApi = async (origin: string, file: File, lang: string): Promise<boolean> => {
    const getPresignedUrlResponse = await fetch('https://api.rain-server.com/banner', {
        method: 'POST',
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            lang,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
        },
    });

    const { presignedUrl } = await getPresignedUrlResponse.json();

    const uploadToR2Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    return uploadToR2Response.ok ? true : false;
};

/* Delete File
====================================================*/
export const deleteFileViaApi = async (origin: string, fileName: string, lang: string): Promise<boolean> => {
    const getPresignedUrlResponse = await fetch('https://api.rain-server.com/banner', {
        method: 'DELETE',
        body: JSON.stringify({
            lang,
            fileName,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
        },
    });

    const { presignedUrl } = await getPresignedUrlResponse.json();

    const deleteToR2Response = await fetch(presignedUrl, {
        method: 'DELETE',
    });

    return deleteToR2Response.ok ? true : false;
};

/* Show Tooltip When Hovering Weapon Name
====================================================*/
export const showTipHoverWpn = (c_id: number): void | false => {
    const toolTipElm = document.getElementById(String(c_id));

    // for on:mouseleave
    if (toolTipElm?.classList.contains('wpn_name_hover')) {
        toolTipElm?.classList.remove('wpn_name_hover');

        return false;
    }

    toolTipElm?.classList.add('wpn_name_hover');
};
