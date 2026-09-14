import { isDateBefore } from 'app/utils/date/dateUtils';

describe('isDateBefore', () => {
    it('avviser når sluttdato er før startdato', () => {
        expect(isDateBefore('2022-10-01', '2022-10-10')).toBe(true);
    });

    it('godtar like datoer og tom sluttdato', () => {
        expect(isDateBefore('2022-10-10', '2022-10-10')).toBe(false);
        expect(isDateBefore('', '2022-10-10')).toBe(false);
    });
});
