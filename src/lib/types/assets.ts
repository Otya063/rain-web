export interface JsonData {
    [key: string]: string;
}

export interface R2AssetsJsonData {
    head: JsonData;
    chest: JsonData;
    arm: JsonData;
    waist: JsonData;
    leg: JsonData;
    melee: JsonData;
    ranged: JsonData;
    item: JsonData;
    poogie: JsonData;
}