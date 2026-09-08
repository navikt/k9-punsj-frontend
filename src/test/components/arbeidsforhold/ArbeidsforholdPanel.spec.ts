import { erFrilanserSluttdatoFørStartdato } from 'app/components/arbeidsforhold/containers/ArbeidsforholdPanel';

describe('erFrilanserSluttdatoFørStartdato', () => {
    it('avviser når sluttdato er før startdato', () => {
        expect(erFrilanserSluttdatoFørStartdato('2022-10-10', '2022-10-01')).toBe(true);
    });

    it('godtar like datoer og tom sluttdato', () => {
        expect(erFrilanserSluttdatoFørStartdato('2022-10-10', '2022-10-10')).toBe(false);
        expect(erFrilanserSluttdatoFørStartdato('2022-10-10', '')).toBe(false);
    });
});