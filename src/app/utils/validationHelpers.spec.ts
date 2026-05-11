import * as yup from 'yup';

import { erYngreEnn18år, feilFraYup } from './validationHelpers';

describe('validationHelpers', () => {
    describe('feilFraYup', () => {
        it('returns capitalized message and path for validation errors', () => {
            const schema = yup.object({
                navn: yup.string().required('må fylles ut'),
            });

            expect(feilFraYup(schema, { navn: '' })).toEqual([
                {
                    message: 'Må fylles ut',
                    path: 'navn',
                },
            ]);
        });

        it('returns empty array for non ValidationError exceptions', () => {
            const schema = yup.object({
                navn: yup.string().test('throws', '', () => {
                    throw new Error('unexpected failure');
                }),
            });

            expect(feilFraYup(schema, { navn: 'abc' })).toEqual([]);
        });
    });

    describe('erYngreEnn18år', () => {
        it('returns true for person younger than 18', () => {
            const today = new Date();
            const year = today.getFullYear();
            const youngPerson = `0101${(year - 15).toString().slice(-2)}99900`;
            expect(erYngreEnn18år(youngPerson)).toBe(true);
        });

        it('returns false for person older than 18', () => {
            const today = new Date();
            const year = today.getFullYear();
            const adultPerson = `0101${(year - 20).toString().slice(-2)}99900`;
            expect(erYngreEnn18år(adultPerson)).toBe(false);
        });

        it('returns false for person born before 2000', () => {
            const today = new Date();
            const year = today.getFullYear();
            const adultPerson = `0101${(year - 50).toString().slice(-2)}25000`;
            expect(erYngreEnn18år(adultPerson)).toBe(false);
        });

        it('returns false for an exact 18-year-old', () => {
            const today = new Date();
            const year = today.getFullYear();
            const exactEighteenPerson = `0101${(year - 18).toString().slice(-2)}99900`;
            expect(erYngreEnn18år(exactEighteenPerson)).toBe(false);
        });
        it('handles D-numbers correctly for person younger than 18', () => {
            const today = new Date();
            const year = today.getFullYear();
            const youngDnrPerson = `5101${(year - 15).toString().slice(-2)}99900`;
            expect(erYngreEnn18år(youngDnrPerson)).toBe(true);
        });
    });
});
