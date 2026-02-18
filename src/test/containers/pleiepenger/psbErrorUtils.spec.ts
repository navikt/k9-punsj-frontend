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

        expect(result).toEqual(['Root error']);
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

    it('returns direct backend message for plain text field validation error', () => {
        const result = getPSBErrorMessage({
            attribute: 'ytelse.opptjeningAktivitet.frilanser.startdato',
            inputErrors: [
                {
                    felt: 'ytelse.opptjeningAktivitet.frilanser.startdato',
                    feilmelding: 'Feltet kan ikke være tomt',
                },
            ],
            mottattDato: '2024-01-01',
            klokkeslett: '10:00',
            erFremITidKlokkeslett: () => false,
            intl,
        });

        expect(result).toBe('Feltet kan ikke være tomt');
    });

    it('matches period path with dotted bracket notation from backend', () => {
        const result = getPSBErrorMessage({
            attribute: "ytelse.bosteder.perioder['../2026-02-24'].land",
            inputErrors: [
                {
                    felt: "ytelse.bosteder.perioder.['../2026-02-24'].land",
                    feilmelding: 'Feltet kan ikke være tomt',
                },
            ],
            mottattDato: '2024-01-01',
            klokkeslett: '10:00',
            erFremITidKlokkeslett: () => false,
            intl,
        });

        expect(result).toBe('Feltet kan ikke være tomt');
    });

    it('maps endringAvSøknadsperioder to correct trekkKravPerioder index when multiple errors exist', () => {
        const result = getPSBErrorMessage({
            attribute: 'endringAvSøknadsperioder.perioder[1].periode.fom',
            indeks: 1,
            inputErrors: [
                { felt: 'ytelse.trekkKravPerioder[0].<list element>', feilmelding: 'Feil i periode 1' },
                { felt: 'ytelse.trekkKravPerioder[1].<list element>', feilmelding: 'Feil i periode 2' },
            ],
            mottattDato: '2024-01-01',
            klokkeslett: '10:00',
            erFremITidKlokkeslett: () => false,
            intl,
        });

        expect(result).toBe('Feil i periode 2');
    });

    it('maps bosteder period message to correct period key when multiple errors exist', () => {
        const result = getPSBErrorMessage({
            attribute: 'ytelse.bosteder.perioder[2026-02-02/..]',
            inputErrors: [
                { felt: "ytelse.bosteder.perioder.['2026-01-01/..']", feilmelding: 'Feil i bosted 1' },
                { felt: "ytelse.bosteder.perioder.['2026-02-02/..']", feilmelding: 'Feil i bosted 2' },
            ],
            mottattDato: '2024-01-01',
            klokkeslett: '10:00',
            erFremITidKlokkeslett: () => false,
            intl,
        });

        expect(result).toBe('Feil i bosted 2');
    });
});
