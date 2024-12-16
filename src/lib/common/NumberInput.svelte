<script lang="ts">
    import { isNumber } from '$utils/client';

    interface Props {
        value: number;
        min?: number;
        max?: number;
        step?: number;
        name: string;
        input: (value: number) => void;
        disabled?: boolean;
    }
    let { value = $bindable(), min = 1, max = 100, step = 1, name, input, disabled = false }: Props = $props();
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchMoved = false;

    /**
     * 現在の値を1ステップ分増加させる\
     * 増加後、値が最大値（max）を超過しないように制限する
     */
    const increment = (): void => {
        if (value < max) {
            value += step;
            input(value);
        }
    };

    /**
     * 現在の値を1ステップ分減少させる\
     * 減少後、値が最小値（min）を下回らないように制限する
     */
    const decrement = (): void => {
        if (value > min) {
            value -= step;
            input(value);
        }
    };

    /**
     * ボタン長押し時の自動増減処理を行う\
     * 長押し後1.5秒間は通常変化、その後高速変化
     *
     * @param {() => void} action 実行する関数（incrementまたはdecrement）
     */
    const startAutoRepeat = (action: () => void): void => {
        // 通常時: 200ms間隔で値変更
        intervalId = setInterval(action, 200);

        // 1.5秒後高速時: 50ms間隔で値変更
        timeoutId = setTimeout(() => {
            clearInterval(intervalId!);
            intervalId = setInterval(action, 50);
        }, 1500);
    };

    /**
     * ボタンが押された時に呼び出される\
     * 単一のクリックで値を即時変更し、長押しの場合は自動増減を行う
     *
     * @param {PointerEvent} e ポインタイベント
     * @param {() => void} action 実行する動作（incrementまたはdecrement）
     */
    const handlePointerDown = (e: PointerEvent, action: () => void): void => {
        resetAutoRepeat(); // 以前のインターバルをクリア
        isTouchMoved = false;
        touchStartX = e.clientX;
        touchStartY = e.clientY;

        // 単押し時、即座にアクション実行
        action();

        // 長押し時、自動増減を開始
        startAutoRepeat(action);
    };

    /**
     * ポインタが移動した時に呼び出される\
     * スクロールやスワイプの動作を検出して、予期せぬ動作防止のため自動増減をキャンセルする
     *
     * @param {PointerEvent} e ポインタイベント
     */
    const handlePointerMove = (e: PointerEvent): void => {
        const dx = Math.abs(e.clientX - touchStartX);
        const dy = Math.abs(e.clientY - touchStartY);

        // 5px以上の動きをスワイプとみなす
        if (dx > 5 || dy > 5) {
            isTouchMoved = true;
            resetAutoRepeat();
        }
    };

    /**
     * 自動増減動作を停止する
     */
    const resetAutoRepeat = (): void => {
        clearTimeout(timeoutId!);
        clearInterval(intervalId!);
        timeoutId = null;
        intervalId = null;
    };

    /**
     * 入力値が手動で変更されたときに値を検証し、更新する
     *
     * @param {Event} event 入力イベント
     */
    const onInput = (event: Event): void => {
        const inputValue = (event.target as HTMLInputElement).value;

        if (isNumber(inputValue) && Number(inputValue) >= min && Number(inputValue) <= max) {
            value = Number(inputValue);
            input(value);
        } else {
            // 無効な値である時は、最小値を設定
            value = min;
            input(min);
        }
    };
</script>

<div class="number_input_wrapper" class:disabled_elm={disabled}>
    <button
        class="decrement_btn"
        type="button"
        onpointerdown={(e) => handlePointerDown(e, decrement)}
        onpointerup={resetAutoRepeat}
        onpointermove={handlePointerMove}
        onpointerleave={resetAutoRepeat}
        disabled={value <= min}>−</button
    >
    <input class="number_input_text" type="text" {name} bind:value oninput={onInput} {disabled} />
    <button
        class="increment_btn"
        type="button"
        onpointerdown={(e) => handlePointerDown(e, increment)}
        onpointerup={resetAutoRepeat}
        onpointermove={handlePointerMove}
        onpointerleave={resetAutoRepeat}
        disabled={value >= max}>+</button
    >
</div>
