import { error } from '@sveltejs/kit';
import type { GetDataFromSaveDataType, ExportEditedSaveDataType } from '$lib/types';

/**
 * 0x51(byte): 性別（0: 女性、1: 男性）
 * 0x52(byte): 顔の種類（インデックスの都合上、+1でゲーム内TYPEと同じになる）
 * 0x53(byte): 髪の種類（インデックスの都合上、+1でゲーム内TYPEと同じになる）
 * 0x54(byte): 髪色（青の値）
 * 0x55(byte): 髪色（緑の値）
 * 0x56(byte): 髪色（赤の値）
 * 0x1F564: プレイ時間hrs（3600で割る）
 */

/**
 * バイナリデータの圧縮、解凍、上書きなどのユーティリティメソッドを提供する
 */
export class ManageBinary {
    /**
     * 指定したバイナリデータを解凍する
     *
     * @param {Buffer} data 解凍対象のバイナリデータ
     * @returns {Buffer} 解凍されたバイナリデータ
     */
    static decompress(data: Buffer): Buffer {
        // 入力データの先頭16バイトをヘッダーとして抽出し、文字列に変換
        const header = data.subarray(0, 16).toString('utf8');

        // ヘッダーが「cmp\x2020110113\x20\x20\x20\x00」と一致するかを確認
        if (header !== 'cmp\x2020110113\x20\x20\x20\x00') {
            // 一致しない場合、圧縮データではないと判断し、入力データをそのまま返す
            return data;
        }

        const outputBuffer: number[] = []; // 出力データ用の配列を初期化
        let index = 16; // 圧縮データ部分の処理をヘッダー後の16バイト目から開始

        // データ全体を処理するまでループ
        while (index < data.length) {
            const byte = data[index]; // 現在位置のバイトを取得
            index++; // インデックスを進めて次のバイトへ

            if (byte === 0x00) {
                // バイトが 0x00（nullマーカー）である場合
                // 次のバイト（nullの繰り返し回数）を読み取る
                const nullCount = data[index];
                index++; // インデックスを進める

                // 出力バッファに、nullCount 分の 0x00 を追加（nullバイトを復元）
                outputBuffer.push(...Array(nullCount).fill(0x00));
            } else {
                // バイトがnullでない場合、そのまま出力バッファに追加
                outputBuffer.push(byte);
            }
        }

        return Buffer.from(outputBuffer);
    }

    /**
     * 指定したバイナリデータを圧縮する
     *
     * @param {Buffer} data 圧縮対象のバイナリデータ
     * @returns {Buffer} 圧縮されたバイナリデータ
     */
    private static compress(data: Buffer): Buffer {
        // ヘッダーをバイナリとして作成し、圧縮データの先頭に追加
        const header = Buffer.from('cmp\x2020110113\x20\x20\x20\x00', 'binary');

        // 出力バッファとして使用する配列を作成し、ヘッダーを初期値として設定
        const output: number[] = Array.from(header);

        let index = 0; // データの現在位置を追跡するためのインデックスを初期化

        // 入力データのすべてのバイトを処理するまでループを続ける
        while (index < data.length) {
            const byte = data[index]; // 現在のバイトを取得
            index++; // インデックスを進めて次のバイトに移動

            if (byte === 0x00) {
                // バイトが 0x00 (nullバイト) の場合
                let nullCount = 1; // nullバイトのカウントを開始（1として初期化）

                // 次のバイトが存在する限り、さらにnullバイトを探す
                while (index < data.length) {
                    const nextByte = data[index]; // 次のバイトを取得

                    if (nextByte !== 0x00) {
                        // nullバイトでない場合
                        // nullバイトシーケンスが終わったので、マーカー 0x00 を出力バッファに追加
                        output.push(0x00);
                        // 続けて、カウントした nullバイトの数（nullCount）を追加
                        output.push(nullCount);
                        // nullバイトの直後の最初のバイト（次の非nullバイト）も追加
                        output.push(nextByte);
                        index++; // インデックスを進めて次のバイトへ
                        nullCount = 0; // nullCountをリセット

                        break; // nullバイト処理のループを終了
                    } else if (nullCount === 255) {
                        // nullバイトが255個連続した場合
                        // 0x00と255（FF）を出力バッファに追加し、nullシーケンスの上限を示す
                        output.push(0x00);
                        output.push(nullCount);
                        nullCount = 0; // カウントをリセット
                    }

                    nullCount++; // nullバイト数をインクリメント
                    index++; // インデックスを進める
                }

                // データの終わりに到達し、残りの nullバイトを処理する必要がある場合
                if (index === data.length && nullCount > 0) {
                    output.push(0x00); // nullバイトシーケンスのマーカーとして0x00を追加
                    output.push(nullCount); // 残りの nullバイト数を追加
                }
            } else {
                // バイトが null でない場合、そのまま出力バッファに追加
                output.push(byte);
            }
        }

        return Buffer.from(output);
    }

    /**
     * 指定したオフセット位置でバイナリデータを上書きする関数
     *
     * @param {Buffer} sourceBuffer 元のバイナリデータ
     * @param {number} offset 上書き開始位置のオフセット
     * @param {Buffer} data 上書きする内容
     * @returns {Buffer} 上書きされた新しいバイナリデータ
     */
    private static overwriteBuffer(sourceBuffer: Buffer, offset: number, data: Buffer): Buffer {
        if (offset < 0 || offset + data.length > sourceBuffer.length) {
            error(400, { message: '', message1: undefined, message2: [`The value of offset "${offset}" is out of range.`], message3: undefined });
        }

        // 新しいバッファをコピーして作成
        const newBuffer = Buffer.from(sourceBuffer);

        // 指定したオフセットからデータを書き換え
        data.copy(newBuffer, offset);

        return newBuffer;
    }

    /**
     * 指定されたデータタイプに基づき、セーブデータから特定のデータを取得する
     * @param {GetDataFromSaveDataType} type 取得したいデータの種類
     * @param {Buffer} savedata 読み取る対象のセーブデータ（解凍前）
     * @returns {number} 指定された位置から取得した数値データ
     */
    static getDataFromSavedata(type: GetDataFromSaveDataType, savedata: Buffer): number {
        switch (type) {
            case 'playtime': {
                const rawSavedata = ManageBinary.decompress(savedata);
                return rawSavedata.readUInt32LE(0x1f564);
            }

            // 他のデータタイプの場合もここにcase文を追加可能
            // case 'anotherType': {
            //   const offset = 0xXXXX; // 取得したいデータのオフセット位置
            //   return rawSavedata.readUInt16LE(offset); // データの形式に合わせてメソッドを変更
            // }

            default:
                error(400, { message: '', message1: undefined, message2: [`Unsupported type: ${type}.`], message3: undefined });
        }
    }

    /**
     * 指定されたデータタイプに基づき、編集されたセーブデータをbase64形式で返す
     * @param {ExportEditedSaveDataType} type 編集するデータの種類
     * @param {Buffer} savedata 元のセーブデータ
     * @param {Buffer} srcBuffer 上書きに使用する素材
     * @returns {string} base64形式の新しいセーブデータ
     */
    static exportEditedSavedata(type: ExportEditedSaveDataType, savedata: Buffer, srcBuffer: Buffer): string {
        switch (type) {
            case 'name': {
                const rawSavedata = ManageBinary.decompress(savedata);
                const editedSavedata = ManageBinary.overwriteBuffer(rawSavedata, 0x58, srcBuffer);
                const base64 = ManageBinary.compress(editedSavedata).toString('base64');

                return base64;
            }

            default: {
                error(400, { message: '', message1: undefined, message2: [`Unsupported type: ${type}.`], message3: undefined });
            }
        }
    }
}
