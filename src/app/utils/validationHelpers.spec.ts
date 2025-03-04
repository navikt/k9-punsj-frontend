import { erYngreEnn18år } from './validationHelpers';

describe('validationHelpers', () => {
    describe('erYngreEnn18år', () => {
        it('returns true for person younger than 18', () => {
            const today = new Date();
            const year = today.getFullYear();
            const youngPerson = `0101${(year - 15).toString().slice(-2)}999`;
            expect(erYngreEnn18år(youngPerson)).toBe(true);
        });

        it('returns false for person older than 18', () => {
            const today = new Date();
            const year = today.getFullYear();
            const adultPerson = `0101${(year - 20).toString().slice(-2)}999`;
            expect(erYngreEnn18år(adultPerson)).toBe(false);
        });

        it('returns false for an exact 18-year-old', () => {
            const today = new Date();
            const year = today.getFullYear();
            const exactEighteenPerson = `0101${(year - 18).toString().slice(-2)}999`;
            expect(erYngreEnn18år(exactEighteenPerson)).toBe(false);
        });
    });
});
