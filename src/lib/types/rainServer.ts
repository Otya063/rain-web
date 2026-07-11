import type { RainServer } from './postgres';

export type RainServerEditableItemType = keyof Omit<RainServer, 'id' | 'maintenance'>;

/* コンポーネント Props
====================================================*/
export interface RainServerProps {
    createdRainServer: RainServer;
    rainServerAddMode: boolean;
    isMobile: boolean;
}

export interface RainServerMainProps {
    rainServerAddMode: boolean;
    isMobile: boolean;
}

export interface CreateRainServerProps {
    createdRainServer: RainServer;
    rainServerAddMode: boolean;
    isMobile: boolean;
}
