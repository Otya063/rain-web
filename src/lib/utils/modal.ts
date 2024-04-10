import type { DeleteBnrData, DeleteCharacterData, DeleteInfoData, LinkDiscordData, RebuildClanData, SuspendUserData } from '$lib/types';
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

/* prepare modal window data
====================================================*/
export const prepareModal = (type: 'deleteInfo' | 'deleteBnr' | 'suspendUser' | 'deleteCharacter' | 'linkDiscord' | 'rebuildClan', data: DeleteInfoData | DeleteBnrData | SuspendUserData | DeleteCharacterData | LinkDiscordData | RebuildClanData): void => {
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

        case "rebuildClan": {
            rebuildClan.set(true);
            rebuildClanData.set(data as RebuildClanData);

            break;
        }

        default: {
            throw new Error('Invalid Type');
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
};
