const desimalTidPattern = /^\d+(?:[.,]\d+)?$/;

const fjernWhitespace = (value: string) => value.replace(/\s+/g, '');

export const normaliserDelvisFraværTimer = (value?: string | null): string | null => {
    const normalisert = fjernWhitespace(value ?? '');

    if (!normalisert) {
        return null;
    }

    if (desimalTidPattern.test(normalisert)) {
        const parsed = Number(normalisert.replace(',', '.'));
        return Number.isNaN(parsed) || parsed < 0 ? null : normalisert;
    }

    return null;
};

export const parseDelvisFraværTimerTilTimer = (value?: string | null): number | null => {
    const normalisert = normaliserDelvisFraværTimer(value);

    if (!normalisert) {
        return null;
    }

    return Number(normalisert.replace(',', '.'));
};
