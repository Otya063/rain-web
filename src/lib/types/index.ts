export * from './modal';

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

/* Course Data
====================================================*/
type CourseJapanese =
    | 'トライアルコース [廃止]'
    | 'ハンターライフコース'
    | 'エクストラコース'
    | 'エクストラBコース [廃止]'
    | 'モバイルコース'
    | 'プレミアムコース'
    | 'パローネコース（エクストラCコース） [廃止]'
    | 'アシストコース'
    | 'Nコース'
    | '秘伝コース'
    | '狩人応援コース'
    | 'Nブーストコース'
    | 'デバッグ [廃止]'
    | 'COG連携失効 [廃止]'
    | 'Xbox LIVE ゴールド メンバーシップ [廃止]'
    | 'PS3/Vita トロフィー獲得条件 [廃止]'
    | 'COG連携確認 [廃止]'
    | 'ネットカフェ [廃止]'
    | '公認ネットカフェ'
    | 'ハンターライフ継続コース'
    | 'エクストラ継続コース'
    | 'フリーコース';

type CourseEnglish =
    | 'Trial Course [Deprecated]'
    | 'Hunter Life Course'
    | 'Extra Course'
    | 'Extra B Course [Deprecated]'
    | 'Mobile Course'
    | 'Premium Course'
    | 'Pallone Course (Extra C Course) [Deprecated]'
    | 'Assist Course'
    | 'N Course'
    | 'Hiden Course'
    | 'Hunter Support Course'
    | 'N Boost Course'
    | 'Debug [Deprecated]'
    | 'COG Link Expired [Deprecated]'
    | 'Xbox Gold Membership [Deprecated]'
    | 'PS3/Vita Trophy Reqs [Deprecated]'
    | 'COG Link Check [Deprecated]'
    | 'NetCafe [Deprecated]'
    | 'Certified NetCafe'
    | 'Hunter Life Continued Course'
    | 'Extra Continued Course'
    | 'Free Course';

export type CourseJaData = {
    [courseName in CourseJapanese]: { id: number; enabled: boolean; code: string };
};

export type CourseEnData = {
    [courseName in CourseEnglish]: { id: number; enabled: boolean; code: string };
};

/* Weapon Name Type
====================================================*/
export type WeaponType = WeaponJapanse | WeaponEnglish | 'Invalid Input';

type WeaponJapanse =
    | '大剣'
    | 'ヘビィボウガン'
    | 'ハンマー'
    | 'ランス'
    | '片手剣'
    | 'ライトボウガン'
    | '双剣'
    | '太刀'
    | '狩猟笛'
    | 'ガンランス'
    | '弓'
    | '穿龍棍'
    | 'スラッシュアックスF'
    | 'マグネットスパイク';

type WeaponEnglish =
    | 'Great Sword'
    | 'Heavy Bowgun'
    | 'Hammer'
    | 'Lance'
    | 'Sword & Shield'
    | 'Light Bowgun'
    | 'Dual Swords'
    | 'Long Sword'
    | 'Hunting Horn'
    | 'Gunlance'
    | 'Bow'
    | 'Tonfa'
    | 'Switch Axe F'
    | 'Magnet Spike';
