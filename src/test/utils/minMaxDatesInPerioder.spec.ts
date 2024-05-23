import {
    getMinDatoFraSøknadsperioder,
    getMaxDatoFraSøknadsperioder,
} from '../../app/utils/date-utils/src/minMaxDatesInPerioder';

describe('getMinDatoFraSøknadsperioder', () => {
    it('should return undefined if søknadsperioder is undefined', () => {
        expect(getMinDatoFraSøknadsperioder(undefined)).toBeUndefined();
    });

    it('should return undefined if søknadsperioder is empty', () => {
        expect(getMinDatoFraSøknadsperioder([])).toBeUndefined();
    });

    it('should return undefined if all fom are null or undefined', () => {
        const søknadsperioder = [{ fom: null }, { fom: undefined }];
        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBeUndefined();
    });

    it('should return the minimum date in YYYY-MM-DD format', () => {
        const søknadsperioder = [{ fom: '2022-01-01' }, { fom: '2022-01-02' }, { fom: '2021-12-31' }];
        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBe('2021-12-31');
    });

    it('should ignore null and undefined fom', () => {
        const søknadsperioder = [{ fom: '2022-01-01' }, { fom: null }, { fom: '2021-12-31' }, { fom: undefined }];
        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBe('2021-12-31');
    });

    it('should handle dates in different formats', () => {
        const søknadsperioder = [
            { fom: '2022/01/01' },
            { fom: '01-02-2022' }, // assuming this is DD-MM-YYYY
            { fom: '31.12.2021' },
        ];
        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBe('2021-12-31');
    });

    it('should handle date and time', () => {
        const søknadsperioder = [
            { fom: '2022-01-01T00:00:00Z' },
            { fom: '2022-01-01T12:00:00Z' },
            { fom: '2021-12-31T23:59:59Z' },
        ];
        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBe('2021-12-31');
    });

    it('returns undefined when no valid dates are present', () => {
        const søknadsperioder = [{ fom: 'invalid date' }, { fom: null }, { fom: undefined }];

        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBeUndefined();
    });

    it('handles only one valid date', () => {
        const søknadsperioder = [{ fom: '2024-05-01' }];

        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBe('2024-05-01');
    });

    it('should ignore invalid dates', () => {
        const søknadsperioder = [{ fom: 'not a date' }, { fom: '2022-01-01' }, { fom: '2022-01-03' }];
        expect(getMinDatoFraSøknadsperioder(søknadsperioder)).toBe('2022-01-01');
    });
});

describe('getMaxDatoFraSøknadsperioder', () => {
    it('should return undefined if søknadsperioder is undefined', () => {
        expect(getMaxDatoFraSøknadsperioder()).toBeUndefined();
    });

    it('should return undefined if søknadsperioder is empty', () => {
        expect(getMaxDatoFraSøknadsperioder([])).toBeUndefined();
    });

    it('should return the maximum date from søknadsperioder', () => {
        const søknadsperioder = [{ tom: '2022-01-01' }, { tom: '2022-01-02' }, { tom: '2022-01-03' }];
        expect(getMaxDatoFraSøknadsperioder(søknadsperioder)).toBe('2022-01-03');
    });

    it('should ignore periods without a tom date', () => {
        const søknadsperioder = [{ tom: '2022-01-01' }, { tom: null }, { tom: '2022-01-03' }];
        expect(getMaxDatoFraSøknadsperioder(søknadsperioder)).toBe('2022-01-03');
    });

    it('should handle different date formats', () => {
        const søknadsperioder = [{ tom: '2022-01-01' }, { tom: '2022/01/02' }, { tom: '03.01.2022' }];
        expect(getMaxDatoFraSøknadsperioder(søknadsperioder)).toBe('2022-01-03');
    });

    it('should return undefined if all dates are invalid', () => {
        const søknadsperioder = [
            { tom: 'invalid date' },
            { tom: 'another invalid date' },
            { tom: 'yet another invalid date' },
            { tom: null },
            { tom: undefined },
        ];
        expect(getMaxDatoFraSøknadsperioder(søknadsperioder)).toBeUndefined();
    });

    it('returns the maximum date when multiple dates are the same', () => {
        const søknadsperioder = [{ tom: '2024-05-01' }, { tom: '2024-05-01' }, { tom: '2024-05-01' }];

        expect(getMaxDatoFraSøknadsperioder(søknadsperioder)).toBe('2024-05-01');
    });

    it('handles only one valid date', () => {
        const søknadsperioder = [{ tom: '2024-05-01' }];

        expect(getMaxDatoFraSøknadsperioder(søknadsperioder)).toBe('2024-05-01');
    });

    it('should ignore invalid dates', () => {
        const søknadsperioder = [{ tom: 'not a date' }, { tom: '2022-01-01' }, { tom: '2022-01-03' }];
        expect(getMaxDatoFraSøknadsperioder(søknadsperioder)).toBe('2022-01-03');
    });
});
