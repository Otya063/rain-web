export * from './admin';
export * from './binary';
export * from './course';
export * from './database';
export * from './distribution';
export * from './modal';
export * from './weapon';

/* マニュアル記事
====================================================*/
export interface Articles {
    lang: string;
    maindir: string;
    subdir: string;
    metaTitle: string;
}

/* インフォ短縮形
====================================================*/
export type InformationType = 'IMP' | 'DNT' | 'MAS' | 'IGE' | 'UAM' | 'ALL';
