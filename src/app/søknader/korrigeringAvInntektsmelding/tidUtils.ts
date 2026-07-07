const decimalTidPattern = /^(?=.*\d)\d*(?:[.,]\d*)?$/;
const timerOgMinutterPattern = /^\d+:\d+$/;

const fjernWhitespace = (value: string) => value.replace(/\s+/g, '');

export const normaliserDelvisFravaerTimer = (value?: string | null): string | null => {
    const normalisert = fjernWhitespace(value || '');

    if (!normalisert) {
        return null;
    }

    if (timerOgMinutterPattern.test(normalisert)) {
        const [timer, minutter] = normalisert.split(':').map(Number);

        if (Number.isNaN(timer) || Number.isNaN(minutter) || timer < 0 || minutter < 0 || minutter > 60) {
            return null;
        }

        return normalisert;
    }

    if (decimalTidPattern.test(normalisert)) {
        const parsed = Number(normalisert.replace(',', '.'));
        return Number.isNaN(parsed) || parsed < 0 ? null : normalisert;
    }

    return null;
};

export const parseDelvisFravaerTimerTilTimer = (value?: string | null): number | null => {
    const normalisert = normaliserDelvisFravaerTimer(value);

    if (!normalisert) {
        return null;
    }

    if (normalisert.includes(':')) {
        const [timer, minutter] = normalisert.split(':').map(Number);
        return timer + minutter / 60;
    }

    return Number(normalisert.replace(',', '.'));
};
