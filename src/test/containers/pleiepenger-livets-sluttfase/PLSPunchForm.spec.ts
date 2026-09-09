import { IInputError } from '../../../app/models/types';
import { getPLSFrilanserSluttdatoFeilmelding } from '../../../app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm';

describe('PLSPunchForm', () => {
    it('resolves the freelancer date-order validation as the raw end-date message', () => {
        const inputErrors: IInputError[] = [
            {
                felt: 'ytelse.opptjeningAktivitet.frilanser.sluttdatoFørStartdato',
                feilmelding: 'Sluttdato kan ikke være før startdato.',
            },
        ];

        expect(getPLSFrilanserSluttdatoFeilmelding('ytelse.opptjeningAktivitet.frilanser.sluttdato', inputErrors)).toBe(
            'Sluttdato kan ikke være før startdato.',
        );
    });
});
