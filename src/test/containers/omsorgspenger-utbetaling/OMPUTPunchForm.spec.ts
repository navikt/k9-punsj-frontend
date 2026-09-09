import { Feil } from '../../../app/models/types/ValideringResponse';
import { getOMPUTFrilanserSluttdatoFeilmelding } from '../../../app/søknader/omsorgspenger-utbetaling/containers/OMPUTPunchForm';

describe('OMPUTPunchForm', () => {
    it('finds the freelancer date-order validation for the end-date field', () => {
        const errors: Feil[] = [
            {
                felt: 'ytelse.opptjeningAktivitet.frilanser.sluttdatoFørStartdato',
                feilkode: 'sluttdatoFørStartdato',
                feilmelding: 'Sluttdato kan ikke være før startdato.',
            },
        ];

        expect(getOMPUTFrilanserSluttdatoFeilmelding(errors)).toBe('Sluttdato kan ikke være før startdato.');
    });

    it('does not map other server-side validation errors', () => {
        const errors: Feil[] = [
            {
                felt: 'ytelse.opptjeningAktivitet.frilanser.startdato',
                feilkode: 'påkrevd',
                feilmelding: 'Startdato må være satt.',
            },
        ];

        expect(getOMPUTFrilanserSluttdatoFeilmelding(errors)).toBeUndefined();
    });
});
