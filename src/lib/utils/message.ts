import type { Tweened } from 'svelte/motion';
import { get, writable } from 'svelte/store';

export const errDetailMode = writable(false);
export const msgClosed = writable(true);
export const timeOut = writable<Timeout>();
export const timerPause = writable(false);

/* Pause and Resume on setTimeout Function
====================================================*/
export class Timeout {
    time: number;
    callback: () => void;
    startedTime!: number;
    timeout!: NodeJS.Timeout;

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

/* Toggle Message Details
====================================================*/
export const toggleMsgDetail = (e: Event, t: Timeout, width: Tweened<number>): void => {
    // prevent repeatedly pressing btn
    const target = e.target as HTMLButtonElement;
    target.disabled = true;
    target.classList.add('disabled_elm');

    setTimeout(() => {
        // after 1s, enable btn
        target.disabled = false;
        target.classList.remove('disabled_elm');
    }, 1000);

    if (t) {
        if (get(timerPause)) {
            errDetailMode.set(false);
            timerPause.set(false);
            t.run();
            width.set(0, { duration: t.getRestTime() });
            document.getElementById('msg_close_btn')?.classList.remove('disabled_elm');
        } else {
            errDetailMode.set(true);
            timerPause.set(true);
            t.pause();
            width.set(get(width), { duration: 0 });
            document.getElementById('msg_close_btn')?.classList.add('disabled_elm');
        }
    }
};

/* Close the Message Display Manually
====================================================*/
export const closeMsgDisplay = (t: Timeout): void => {
    msgClosed.set(true);
    t.stop();
};
