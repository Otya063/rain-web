import type { DeleteBnrData, DeleteCharacterData, DeleteInfoData, LinkDiscordData, ModalType, RebuildClanData, SuspendUserData } from '$lib/types';
import { error } from '@sveltejs/kit';
import { writable } from 'svelte/store';

export const deleteInfo = writable(false);
export const deleteInfoData = writable<DeleteInfoData>();
export const deleteBnr = writable(false);
export const deleteBnrData = writable<DeleteBnrData>();
export const suspendUser = writable(false);
export const suspendUserData = writable<SuspendUserData>();
export const deleteChar = writable(false);
export const deleteCharacterData = writable<DeleteCharacterData>();
export const linkDiscord = writable(false);
export const linkDiscordData = writable<LinkDiscordData>();
export const rebuildClan = writable(false);
export const rebuildClanData = writable<RebuildClanData>();
export const downloadBinary = writable(false);
export const downloadBinaryData = writable<DeleteCharacterData>();

/* prepare modal window data
====================================================*/
export const prepareModal = (type: ModalType, data: DeleteInfoData | DeleteBnrData | SuspendUserData | DeleteCharacterData | LinkDiscordData | RebuildClanData): void => {
    switch (type) {
        case 'deleteInfo': {
            deleteInfo.set(true);
            deleteInfoData.set(data as DeleteInfoData);

            break;
        }

        case 'deleteBnr': {
            deleteBnr.set(true);
            deleteBnrData.set(data as DeleteBnrData);

            break;
        }

        case 'suspendUser': {
            suspendUser.set(true);
            suspendUserData.set(data as SuspendUserData);

            break;
        }

        case 'deleteCharacter': {
            deleteChar.set(true);
            deleteCharacterData.set(data as DeleteCharacterData);

            break;
        }

        case 'linkDiscord': {
            linkDiscord.set(true);
            linkDiscordData.set(data as LinkDiscordData);

            break;
        }

        case 'rebuildClan': {
            rebuildClan.set(true);
            rebuildClanData.set(data as RebuildClanData);

            break;
        }

        case 'downloadBinary': {
            downloadBinary.set(true);
            downloadBinaryData.set(data as DeleteCharacterData); // DeleteCharacterDataを再利用

            break;
        }

        default: {
            error(400, { message: '', message1: '', message2: ['Invalid type.'], message3: undefined });
        }
    }
};

/* close modal window
====================================================*/
export const closeModal = (): void => {
    deleteInfo.set(false);
    suspendUser.set(false);
    deleteBnr.set(false);
    linkDiscord.set(false);
    deleteChar.set(false);
    rebuildClan.set(false);
    downloadBinary.set(false);
};
