import { error } from '@sveltejs/kit';
import type { Tweened } from 'svelte/motion';
import { get, writable } from 'svelte/store';

export const errDetailMode = writable(false);
export const msgClosed = writable(true);
export const timeOut = writable<Timeout | undefined>();
export const timerPause = writable(false);

/**
 * タイマーの停止、一時停止、再開を管理する
 */
export class Timeout {
    time: number;
    callback: () => void;
    startedTime!: number;
    timeout!: NodeJS.Timeout;

    /**
     * 指定した時間後にコールバック関数を実行するタイマーを設定する
     *
     * @param {() => void} callbackFunction タイマーが終了したときに実行されるコールバック関数
     * @param {number} time タイマーの初期時間（ミリ秒）
     */
    constructor(callbackFunction: () => void, time: number) {
        this.time = time;
        this.callback = callbackFunction;
        this.run();
    }

    /**
     * タイマーを開始する
     */
    run(): void {
        this.startedTime = new Date().getTime();
        if (this.time > 0) {
            this.timeout = setTimeout(this.callback, this.time);
        }
    }

    /**
     * タイマーを一時停止する
     */
    pause(): void {
        let currentTime = new Date().getTime();
        this.time = this.time - (currentTime - this.startedTime);
        clearTimeout(this.timeout);
    }

    /**
     * タイマーを停止し、残り時間をリセット
     */
    stop(): void {
        clearTimeout(this.timeout);
        this.time = 0;
    }

    /**
     * 残りのタイマー時間を取得する
     *
     * @returns {number} 残りのタイマー時間（ミリ秒）
     */
    getRestTime(): number {
        return this.time;
    }
}

/**
 * メッセージ詳細の表示/非表示を切り替える
 *
 * @param {Event} e イベントオブジェクト
 * @param {Timeout | undefined} t `Timeout`インスタンス。タイマーの状態を管理
 * @param {Tweened<number>} width 幅のアニメーションの設定を管理する `Tweened` 値
 */
export const toggleMsgDetail = (e: Event, t: Timeout | undefined, width: Tweened<number>): void => {
    if (!t) {
        error(400, { message: '', message1: undefined, message2: ['Timeout is undefined.'], message3: undefined });
    }

    // ボタンを繰り返し押させない
    const target = e.target as HTMLButtonElement;
    target.disabled = true;
    target.classList.add('disabled_elm');

    setTimeout(() => {
        // 0.5秒後に有効化
        target.disabled = false;
        target.classList.remove('disabled_elm');
    }, 500);

    if (get(timerPause)) {
        errDetailMode.set(false);
        timerPause.set(false);
        t.run();
        width.set(0, { duration: t.getRestTime() });
    } else {
        errDetailMode.set(true);
        timerPause.set(true);
        t.pause();
        width.set(get(width), { duration: 0 });
    }
};

/**
 * メッセージ表示を手動で閉じる
 *
 * @param {Timeout | undefined} t `Timeout`インスタンス
 */
export const closeMsgDisplay = (t: Timeout | undefined): void => {
    if (!t) {
        error(400, { message: '', message1: undefined, message2: ['Timeout is undefined.'], message3: undefined });
    }

    errDetailMode.set(false);
    document.getElementById('error_view_btn')?.classList.add('disabled_elm');
    t.stop();
    setTimeout(() => {
        timerPause.set(false);
        msgClosed.set(true);
    }, 100);
};
