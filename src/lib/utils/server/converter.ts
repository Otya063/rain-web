import Encoding from 'encoding-japanese';
import { Buffer } from 'node:buffer'; // Node.jsとの互換性により、追加しないと「ReferenceError: Buffer is not defined」が発生する

/**
 * SJISで文字列をエンコードする
 * @param {string} value 変換対象の文字列
 * @returns {Buffer} 変換後のBufferデータ
 */
export const encodeToShiftJIS = (value: string): Buffer => {
    const unicodeArray = Encoding.stringToCode(value);
    const encoded = Encoding.convert(unicodeArray, {
        to: 'SJIS',
        from: 'UNICODE',
    });

    return Buffer.from(new Uint8Array(encoded));
};