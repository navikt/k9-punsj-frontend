import { mapOLPValidationErrorPath } from '../../../app/søknader/opplæringspenger/containers/OLPPunchForm';

describe('OLPPunchForm', () => {
    it('maps the freelancer date-order validation to Formik end-date field', () => {
        expect(mapOLPValidationErrorPath('ytelse.opptjeningAktivitet.frilanser.sluttdatoFørStartdato')).toBe(
            'opptjeningAktivitet.frilanser.sluttdato',
        );
    });

    it('keeps other backend validation paths unchanged apart from existing normalization', () => {
        expect(mapOLPValidationErrorPath('ytelse.uttak.<list element>')).toBe('uttak');
    });
});
