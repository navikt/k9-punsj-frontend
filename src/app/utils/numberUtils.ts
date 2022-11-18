export const timerTilSekunder = (timer: number) => {
    if (!timer || NaN) return 0;

    return timer * 60 * 60;
};

export const minutterTilSekunder = (minutter: number) => {
    if (!minutter || NaN) return 0;

    return minutter * 60;
};
