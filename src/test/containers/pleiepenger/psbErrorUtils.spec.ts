import { createIntl } from 'react-intl';

import { IInputError } from '../../../app/models/types';
import { getPSBErrorMessage, getUnhandledErrors } from '../../../app/søknader/pleiepenger/containers/psbErrorUtils';
import intlHelper from '../../../app/utils/intlUtils';

jest.mock('../../../app/utils/intlUtils');

describe('psbErrorUtils', () => {
    const intl = createIntl({ locale: 'nb', defaultLocale: 'nb' });

    beforeEach(() => {
        jest.clearAllMocks();
        (intlHelper as jest.Mock).mockImplementation((_intl, id: string) => id);
    });

    it('returns unhandled errors for selected attribute only', () => {
        const inputErrors: IInputError[] = [
            { felt: 'ytelse.arbeidstid', feilmelding: 'Root error' },
            { felt: 'ytelse.arbeidstid.perioder[0]', feilmelding: 'Nested error' },
        ];

        const result = getUnhandledErrors({
            attribute: 'ytelse.arbeidstid',
            inputErrors,
            feilmeldingStier: new Set(['ytelse.arbeidstid', 'ytelse.arbeidstid.perioder[0]']),
        });

        expect(result).toEqual(['ytelse.arbeidstid: Root error']);
    });

    it('returns required error key for missing mottattDato and klokkeslett', () => {
        const result = getPSBErrorMessage({
            attribute: 'mottattDato',
            inputErrors: [],
            mottattDato: '',
            klokkeslett: '',
            erFremITidKlokkeslett: () => false,
            intl,
        });

        expect(result).toBe('skjema.feil.ikketom');
    });

    it('returns direct message for endringAvSøknadsperioder index mapping', () => {
        const result = getPSBErrorMessage({
            attribute: 'endringAvSøknadsperioder.perioder[0].periode.fom',
            indeks: 0,
            inputErrors: [{ felt: 'ytelse.trekkKravPerioder[0].fom', feilmelding: 'MAA_SETTES' }],
            mottattDato: '2024-01-01',
            klokkeslett: '10:00',
            erFremITidKlokkeslett: () => false,
            intl,
        });

        expect(result).toBe('MAA_SETTES');
    });

    it('normalizes mottattDato null message key', () => {
        const result = getPSBErrorMessage({
            attribute: 'mottattDato',
            inputErrors: [{ felt: 'mottattDato', feilmelding: 'must not be null' }],
            mottattDato: '2024-01-01',
            klokkeslett: '10:00',
            erFremITidKlokkeslett: () => false,
            intl,
        });

        expect(result).toBe('skjema.feil.datoMottatt.MAA_SETTES');
    });
});
