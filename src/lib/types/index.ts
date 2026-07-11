export * from './admin';
export * from './assets';
export * from './banner';
export * from './binary';
export * from './course';
export * from './distribution';
export * from './information';
export * from './modal';
export * from './postgres';
export * from './rainServer';
export * from './user';

/* 型定義一部変更
========================================================= */
export type Replace<T, U> = {
    [P in keyof T]: P extends keyof U ? U[P] : T[P];
};

/* マニュアル記事
====================================================*/
export interface Articles {
    lang: string;
    maindir: string;
    subdir: string;
    metaTitle: string;
}
