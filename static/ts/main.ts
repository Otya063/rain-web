import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { courseJA } from '$i18n/ja/courseData.ts';
import { courseEN } from '$i18n/en/courseData.ts';

/*=========================================================
　　　　　Slide Functions
=======================================================*/
/* Slide Open
====================================================*/
export const slideOpen = (target: HTMLElement) => {
    // error handling
    if (!target && console.log('Target was not found.')) return;

    target.style.height = 'auto';
    const h: number = target.offsetHeight;
    const tabHeight: number = h;
    target.animate(
        {
            height: ['0', tabHeight + 'px'],
        },
        {
            duration: 400,
            easing: 'ease',
        }
    );
};

/* Slide Close
====================================================*/
const slideClose = (target: HTMLElement) => {
    // error handling
    if (!target && console.log('Target was not found.')) return;

    const h: number = target.offsetHeight;
    const tabHeight: number = h;
    target.animate(
        {
            height: [tabHeight + 'px', '0'],
        },
        {
            duration: 400,
            easing: 'ease',
        }
    );
    target.style.height = '0';
};

/* Toggle Languages Selection Field
====================================================*/
export const toggleLangSel = (e: Event) => {
    const target = e.currentTarget as EventTarget;
    const judge = document.querySelector('.lang_sel_judge') as HTMLLIElement;
    const content = document.querySelector('.language_selectArea') as HTMLUListElement;
    target.classList.toggle('langArrow_open'); // rotate arrow
    judge.classList.toggle('open'); // first time
    judge.classList.contains('open') ? slideOpen(content) : slideClose(content); // after the second time
};

/* Toggle Side Menu
====================================================*/
export const toggleMenuSel = (e: Event) => {
    const target = e.currentTarget as EventTarget;
    const content = target.nextElementSibling as HTMLUListElement;
    target.classList.toggle('open'); // first time
    target.classList.contains('open') ? slideOpen(content) : slideClose(content); // after the second time
};

/*=========================================================
　　　　　Article Functions
=======================================================*/
/* Pinch Zoom Restriction
====================================================*/
if (browser) {
    document.documentElement.addEventListener(
        'touchstart',
        (e: TouchEvent) => {
            e.touches.length > 1 && e.preventDefault();
        },
        { passive: false }
    );
}

/* Scroll to Top
====================================================*/
export const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* Scroll to Target Element
====================================================*/
export const scrollToElm = (e: MouseEvent) => {
    const data_target: string = e.currentTarget.getAttribute('data-target');
    const target_element = document.getElementById(data_target) as HTMLElement;
    target_element.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
    });
};

/* Load Article
====================================================*/
export const loadArticle = (lang_code: string = '', maindir: string = '', subdir: string = '') => {
    const href_path: string = `${lang_code}/manual/${maindir}${subdir}`;
    const url = new URL(href_path, location.origin);
    // remove unnecessary things
    url.search = '';
    location.href = url.toString();
};

/* Bottom Navigation Toggle
====================================================*/
if (browser) {
    // remember which menu is now selected by index
    let menuNow: number | null = null;
    const btm_navs = document.querySelectorAll('.btm_nav_item') as NodeListOf<HTMLLIElement>;
    btm_navs.forEach((btm_nav: HTMLLIElement, index: number) => {
        btm_nav.addEventListener('click', (e: MouseEvent) => {
            const target = e.currentTarget as EventTarget;
            const { id }: { id: string } = e.currentTarget;
            const menu = document.querySelector(`.${id}`) as HTMLElement;
            const selected_nav = document.querySelector('.btm_nav_selected') as HTMLElement | null;
            const selected_text = document.querySelector('.btm_nav_text_selected') as HTMLLIElement | null;

            // automatically close the menu opened already
            menuNow !== null && menuNow !== index && selected_nav?.classList.remove('btm_nav_selected');

            // main toggle function
            menu.classList.toggle('btm_nav_selected');
            menuNow = index;

            // add class "fixed" to html tag to prevent users from moving the background while the menu is open
            const contains_class: boolean = menu.classList.contains('btm_nav_selected');
            document.documentElement.classList.toggle('fixed', contains_class);

            // decorations for the text selected now
            target.classList.add('btm_nav_text_selected');
            selected_text?.classList.remove('btm_nav_text_selected');
        });
    });
}

/*=========================================================
　　　　　Admin Console
=======================================================*/
export const tab_param = writable('');
export const editMode = writable(false);
export const success = writable(false);
export const error = writable(false);
export const err_details = writable('');
export const errDetailMode = writable(false);
export const notice = writable(false);
export const clicked_submit = writable(false);
export const modalTitle = writable('');
export const modalFormAction = writable('');
export const suspendUser = writable(false);
export const suspendUid = writable(0);
export const suspendUsername = writable('');
export const deleteInfo = writable(false);
export const infoId = writable(0);
export const infoTitle = writable('');
export const infoURL = writable('');
export const infoType = writable('');
export const deleteBnr = writable(false);
export const bnrId = writable(0);
export const bnrURL = writable('');
export const bnrName = writable('');
export const linkDiscord = writable(false);
export const linkUId = writable(0);
export const linkUsername = writable('');
export const linkCId = writable(0);
export const linkCName = writable('');
export const linkDiscordId = writable('');
export const deleteChar = writable(false);
export const deleteCharId = writable(0);
export const deleteCharName = writable('');

/* prepare modal window data
====================================================*/
export const prepareModal = (
    type: string,
    title: string,
    action: string,
    data1: string | number | null = '',
    data2: string | null = '',
    data3: string | number | null = '',
    data4: string | null = '',
    data5: string | null = ''
) => {
    switch (type) {
        case 'suspendUser':
            suspendUser.set(true);
            modalTitle.set(title);
            modalFormAction.set(action);
            suspendUid.set(data1);
            suspendUsername.set(data2);
            break;

        case 'deleteInfo':
            deleteInfo.set(true);
            modalTitle.set(title);
            modalFormAction.set(action);
            infoId.set(data1);
            infoTitle.set(data2);
            infoURL.set(data3);
            infoType.set(data4);
            break;

        case 'deleteBnr':
            deleteBnr.set(true);
            modalTitle.set(title);
            modalFormAction.set(action);
            bnrId.set(data1);
            bnrURL.set(data2);
            bnrName.set(data3);
            break;

        case 'linkDiscord':
            linkDiscord.set(true);
            modalTitle.set(title);
            modalFormAction.set(action);
            linkUId.set(data1);
            linkUsername.set(data2);
            linkCId.set(data3);
            linkCName.set(data4);
            linkDiscordId.set(data5);
            break;

        case 'deleteCharacter':
            deleteChar.set(true);
            modalTitle.set(title);
            modalFormAction.set(action);
            deleteCharId.set(data1);
            deleteCharName.set(data2);
            break;

        default:
            throw new Error('Invalid input.');
    }
};

/* close modal window
====================================================*/
export const cancelModal = () => {
    deleteInfo.set(false);
    suspendUser.set(false);
    deleteBnr.set(false);
    linkDiscord.set(false);
    deleteChar.set(false);
    modalTitle.set('');
    modalFormAction.set('');
    suspendUid.set(0);
    suspendUsername.set('');
    infoTitle.set('');
    infoURL.set('');
    infoType.set('');
    bnrId.set(0);
    bnrURL.set('');
    bnrName.set('');
    linkUId.set(0);
    linkUsername.set('');
    linkCId.set(0);
    linkCName.set('');
    deleteCharId.set(0);
    deleteCharName.set('');
};

/* Pause and Resume on setTimeout Function
====================================================*/
export class Timeout {
    time: number;
    callback: () => void;
    startedTime: number;
    timeout: NodeJS.Timeout;

    constructor(callbackFunction: () => void, time: number) {
        this.time = time;
        this.callback = callbackFunction;
        this.run();
    }

    run() {
        this.startedTime = new Date().getTime();
        if (this.time > 0) {
            this.timeout = setTimeout(this.callback, this.time);
        }
    }

    pause() {
        let currentTime = new Date().getTime();
        this.time = this.time - (currentTime - this.startedTime);
        clearTimeout(this.timeout);
    }

    stop() {
        clearTimeout(this.timeout);
        this.time = 0;
    }

    getRestTime() {
        return this.time;
    }
}

/* upload file
====================================================*/
export const uploadFileViaApi = async (file: File | undefined, lang: string) => {
    const getPresignedUrlResponse = await fetch(`/api/upload/${lang}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
        }),
    });

    const { presignedUrl, objectKey } = await getPresignedUrlResponse.json();
    console.log(`Presigned URL: ${presignedUrl}, Key: ${objectKey}`);
    if (getPresignedUrlResponse.ok) {
        console.log('Presigned URL successfully retrieved.');
    } else {
        console.error('Failed to get presigned URL.');
    }

    const uploadToR2Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    if (uploadToR2Response.ok) {
        console.log('Succeeded in uploading file to R2.');
    } else {
        console.error('Failed to upload file to R2.');
    }
};

/* delete file
====================================================*/
export const deleteFileViaApi = async (lang: string, bnrName: string) => {
    const getPresignedUrlResponse = await fetch(`/api/delete/${lang}/${bnrName}`, {
        method: 'DELETE',
    });

    const { presignedUrl, objectKey } = await getPresignedUrlResponse.json();
    console.log(`Presigned URL: ${presignedUrl}, Key: ${objectKey}`);
    if (getPresignedUrlResponse.ok) {
        console.log('Presigned URL successfully retrieved.');
    } else {
        console.error('Failed to get presigned URL.');
    }

    const deleteToR2Response = await fetch(presignedUrl, {
        method: 'DELETE',
    });

    if (deleteToR2Response.ok) {
        console.log('The file was successfully deleted.');
    } else {
        console.error('Failed to delete file.');
    }
};

/*=========================================================
　　　　　User Functions
=======================================================*/
/* Show Tooltip When Hovering Weapon Name
====================================================*/
export const showTipHoverWpn = (c_id: number) => {
    const toolTipElm = document.getElementById(c_id);

    // for on:mouseleave
    if (toolTipElm?.classList.contains('wpn_name_hover')) {
        toolTipElm?.classList.remove('wpn_name_hover');

        return false;
    }

    toolTipElm?.classList.add('wpn_name_hover');
};

/* Get Course by Decimal
====================================================*/
export const getCourseByDecimal = (dec: number, lang: string) => {
    let bin: string[] = dec.toString(2).padStart(30, '0').split('');
    bin = bin.reverse();

    switch (lang) {
        case 'ja':
            return courseJA(bin);

        case 'en':
            return courseEN(bin);

        default:
            return 'No Data';
    }
};

/* Get Course (decimal) by FormData
====================================================*/
export const getCourseByFormData = (courseData: Record<string, string | number | boolean>) => {
    delete courseData.user_id;

    // change the values to boolean
    Object.keys(courseData).forEach((name) => {
        courseData[name] === 'on' && (courseData[name] = true);
    });

    const bin = `
    ${courseData['hl'] === 'frc' ? 1 : 0}
    ${courseData['ex'] === 'excc' ? 1 : 0}
    ${courseData['hl'] === 'hlcc' ? 1 : 0}
    ${courseData['cnc'] ? 1 : 0}
    ${courseData['nc'] ? 1 : 0}
    ${courseData['clc'] ? 1 : 0}
    ${courseData['trq'] ? 1 : 0}
    ${courseData['xgm'] ? 1 : 0}
    ${courseData['cle'] ? 1 : 0}
    ${courseData['dbg'] ? 1 : 0}
    0000000
    ${courseData['nbc'] ? 1 : 0}
    ${courseData['hsc'] ? 1 : 0}
    ${courseData['hdc'] ? 1 : 0}
    ${courseData['nc'] ? 1 : 0}
    ${courseData['asc'] ? 1 : 0}
    ${courseData['plc'] ? 1 : 0}
    ${courseData['prc'] ? 1 : 0}
    ${courseData['mbc'] ? 1 : 0}
    ${courseData['exbc'] ? 1 : 0}
    ${courseData['ex'] === 'exc' ? 1 : 0}
    ${courseData['hl'] === 'hlc' ? 1 : 0}
    ${courseData['tlc'] ? 1 : 0}
    0`
        .replace(/\n/g, '')
        .replace(/\s+/g, '');
    const dec = parseInt(bin, 2);

    return dec;
};

/* Get Weapon Type by Dec
====================================================*/
export const getWpnTypeByDec = (dec: number | null, lang: string) => {
    let wpnType: string;
    switch (lang) {
        case 'ja':
            switch (dec) {
                case 0:
                    wpnType = '大剣';
                    break;

                case 1:
                    wpnType = 'ヘビィボウガン';
                    break;

                case 2:
                    wpnType = 'ハンマー';
                    break;

                case 3:
                    wpnType = 'ランス';
                    break;

                case 4:
                    wpnType = '片手剣';
                    break;

                case 5:
                    wpnType = 'ライトボウガン';
                    break;

                case 6:
                    wpnType = '双剣';
                    break;

                case 7:
                    wpnType = '太刀';
                    break;

                case 8:
                    wpnType = '狩猟笛';
                    break;

                case 9:
                    wpnType = 'ガンランス';
                    break;

                case 10:
                    wpnType = '弓';
                    break;

                case 11:
                    wpnType = '穿龍棍';
                    break;

                case 12:
                    wpnType = 'スラッシュアックスF';
                    break;

                case 13:
                    wpnType = 'マグネットスパイク';
                    break;
            }
            break;

        case 'en':
            switch (dec) {
                case 0:
                    wpnType = 'Great Sword';
                    break;

                case 1:
                    wpnType = 'Heavy Bowgun';
                    break;

                case 2:
                    wpnType = 'Hammer';
                    break;

                case 3:
                    wpnType = 'Lance';
                    break;

                case 4:
                    wpnType = 'Sword & Shield';
                    break;

                case 5:
                    wpnType = 'Light Bowgun';
                    break;

                case 6:
                    wpnType = 'Dual Swords';
                    break;

                case 7:
                    wpnType = 'Long Sword';
                    break;

                case 8:
                    wpnType = 'Hunting Horn';
                    break;

                case 9:
                    wpnType = 'Gunlance';
                    break;

                case 10:
                    wpnType = 'Bow';
                    break;

                case 11:
                    wpnType = 'Tonfa';
                    break;

                case 12:
                    wpnType = 'Switch Axe F';
                    break;

                case 13:
                    wpnType = 'Magnet Spike';
                    break;
            }
            break;
    }

    return wpnType;
};

/* Get Weapon Name by Dec
====================================================*/
export const getWpnNameByDec = async (dec: number, wpnType: number | null, lang: string) => {
    const hex: string = decToLittleEndian(dec);

    switch (wpnType) {
        // ranged
        case 1:
        case 5:
        case 10:
            // language select
            switch (lang) {
                case 'ja':
                    //const { ranged_ja } = await import('$i18n/ja/ranged');
                    //return ranged_ja[hex];
                    return 'No Data';

                case 'en':
                    //const { ranged_en } = await import('$i18n/en/ranged');
                    //return ranged_en[hex];
                    return 'No Data';
            }
            break;

        // melee
        default:
            // language select
            switch (lang) {
                case 'ja':
                    const { meleeJA } = await import('$i18n/ja/meleeData');
                    return meleeJA[hex];

                case 'en':
                    const { meleeEN } = await import('$i18n/en/meleeData');
                    return meleeEN[hex];
            }
            break;
    }
};

/*=========================================================
　　　　　Conversion Functions
=======================================================*/
/* Convert Normal Date to Unixtimestamp
====================================================*/
export const convDateToUnix = (dateValue: string) => {
    const split_date = dateValue.split('-');
    const year = parseInt(split_date[0]);
    const month = parseInt(split_date[1]) - 1;
    const day = parseInt(split_date[2]);

    const date = new Date(Date.UTC(year, month, day));

    const timeStamp = Math.floor(date.getTime() / 1000);

    return timeStamp;
};

/* Convert Unixtimestamp to Date
====================================================*/
export const convUnixToDate = (timestamp: number | null, ISO8601: boolean) => {
    const date = new Date(timestamp * 1000);

    // for nomal expression
    const formattedDate1 = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // for ISO 8601 expression
    const formattedDate2 = date
        .toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
        .replace(/\//g, '-');

    return ISO8601 ? formattedDate2 : formattedDate1;
};

/* Convert RFC 2822 Time to ISO 8601 with Time
====================================================*/
export const convRFCToISOWithTime = (rfc: Date | null): string => {
    // parse the RFC2822 string into a Date object
    const date = new Date(rfc);

    // set seconds and milliseconds to zero
    date.setSeconds(0);
    date.setMilliseconds(0);

    // format the Date object as an ISO 8601 string with seconds and milliseconds removed
    const iso8601 = date.toISOString().replace(/:00\.000Z$/, '');

    return iso8601;
};

/* Convert FormData Into Objects
====================================================*/
export const convFormDataToObj = (data: FormData): Record<string, string | number | boolean> => {
    const obj = {};

    for (const [key, value] of data.entries()) {
        if (value === 'true') {
            obj[key] = true;
        } else if (value === 'false') {
            obj[key] = false;
        } else {
            obj[key] = value;
        }
    }

    return obj;
};

/* Generate Underscore and Lowercase Strings
====================================================*/
export const underscoreAndLowercase = (string: string) => {
    // convert uppercase to lowercase
    const lowercaseString = string.toLowerCase();

    // underscore
    const underscoreLowercaseString = lowercaseString.replace(/\s/g, '_');

    return underscoreLowercaseString;
};

/* Endian Conversion
====================================================*/
export const decToLittleEndian = (dec: number) => {
    // convert decimal to hexadecimal as a big-endian string with a minimum width of 4 digits
    const bigEndianHex: string = dec.toString(16).padStart(4, '0');

    // split the big-endian hex string into pairs of two characters
    const pairs = bigEndianHex.match(/.{1,2}/g);

    if (pairs) {
        // reverse the order of the pairs to get little-endian representation
        const littleEndianHex: string = pairs.reverse().join('');

        // convert alphabetic characters to uppercase
        const uppercaseLittleEndianHex: string = littleEndianHex.replace(/[a-f]/g, (match) => match.toUpperCase());

        return uppercaseLittleEndianHex;
    } else {
        throw new Error('Invalid input');
    }
};

/* Discord Link Conversion
====================================================*/
export const discordLinkConvertor = (url: string): string => {
    if (url.indexOf('discord.com')) {
        return url.replace('https://discord.com/', 'discord://discordapp.com/');
    } else {
        return url;
    }
};
