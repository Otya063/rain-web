/**
 * 入力値が許可された文字のみを含むかどうかを検証する
 * - 日本語: ひらがな、カタカナ、漢字
 * - 英語: 大文字、小文字、半角数字
 * - 記号: ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
 *
 * @param {Event} event
 * @returns {boolean} 検証結果
 */
export const validateCharName = (event: Event): boolean => {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    const allowedCharsRegex = /^[\u3040-\u30FF\u4E00-\u9FFFa-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/;

    // 値が空でなく、許容される文字にマッチするかチェック
    return value && allowedCharsRegex.test(value) ? true : false;
};

/**
 * 文字列が数値であるかどうか確認する
 * @param {string} value
 * @returns {boolean} 真偽を返す
 */
export const isNumber = (value: string): boolean => {
    // チェック条件パターン
    const pattern = /^[-]?([1-9]\d*|0)(\.\d+)?$/;

    // 数値チェック
    return pattern.test(value);
};
