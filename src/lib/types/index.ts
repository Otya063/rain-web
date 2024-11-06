export * from './admin';
export * from './course';
export * from './distribution';
export * from './modal';
export * from './weapon';

/* Manual Article
====================================================*/
export interface Articles {
    lang: string;
    maindir: string;
    subdir: string;
    metaTitle: string;
}

/* Rain Web Information Type
====================================================*/
export type InformationType = 'IMP' | 'DNT' | 'MAS' | 'IGE' | 'UAM' | 'ALL';
