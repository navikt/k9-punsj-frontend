import { getFormErrors } from '../../../app/søknader/korrigeringAvInntektsmelding/containers/korrigeringAvFormValidering';
import { KorrigeringAvInntektsmeldingFormValues } from '../../../app/søknader/korrigeringAvInntektsmelding/types/KorrigeringAvInntektsmeldingFormFieldsValues';
import { ValideringResponse } from '../../../app/models/types/ValideringResponse';

const getValidValues = (): KorrigeringAvInntektsmeldingFormValues => ({
    OpplysningerOmKorrigering: { dato: '2026-02-01', klokkeslett: '10:00' },
    Virksomhet: '999999999',
    ArbeidsforholdId: '',
    Trekkperioder: [{ fom: '', tom: '' }],
    PerioderMedRefusjonskrav: [{ fom: '', tom: '' }],
    DagerMedDelvisFravær: [{ dato: '', timer: '' }],
});

describe('korrigeringAvFormValidering', () => {
    it('prefers field level errors over søknad fallback and maps matching fields', () => {
        const response: ValideringResponse = {
            søknadIdDto: 'soknad-id',
            feil: [
                { felt: 'søknad', feilkode: 'mottattDato', feilmelding: 'Mottatt dato mangler' },
                { felt: 'mottattDato', feilkode: 'nullFeil', feilmelding: 'Feltet kan ikke være tomt' },
                { felt: 'arbeidsforholdId', feilkode: 'nullFeil', feilmelding: 'Velg arbeidsforhold' },
                {
                    felt: 'ytelse.fraværsperioderKorrigeringIm[0]',
                    feilkode: 'ikkeSpesifisertOrgNr',
                    feilmelding: 'Må oppgi orgnr for aktivitet',
                },
            ],
        };

        const errors = getFormErrors(getValidValues(), response) as {
            OpplysningerOmKorrigering: { dato: string };
            Virksomhet: string;
            ArbeidsforholdId: string;
            Trekkperioder: string[];
        };

        expect(errors.OpplysningerOmKorrigering.dato).toBe('Feltet kan ikke være tomt');
        expect(errors.ArbeidsforholdId).toBe('Velg arbeidsforhold');
        expect(errors.Virksomhet).toBe('Må oppgi orgnr for aktivitet');
        expect(errors.Trekkperioder[0]).toBe('');
    });

    it('maps indexed fraværsperioder to the matching frontend sections', () => {
        const values: KorrigeringAvInntektsmeldingFormValues = {
            ...getValidValues(),
            Trekkperioder: [{ fom: '2026-02-10', tom: '2026-02-10' }],
            PerioderMedRefusjonskrav: [{ fom: '2026-02-11', tom: '2026-02-11' }],
            DagerMedDelvisFravær: [{ dato: '2026-02-12', timer: '2' }],
        };

        const response: ValideringResponse = {
            søknadIdDto: 'soknad-id',
            feil: [
                {
                    felt: 'ytelse.fraværsperioderKorrigeringIm[0]',
                    feilkode: 'trekkPeriodeFeil',
                    feilmelding: 'Trekkperiodefeil',
                },
                {
                    felt: 'ytelse.fraværsperioderKorrigeringIm[1]',
                    feilkode: 'refusjonskravFeil',
                    feilmelding: 'Refusjonskravfeil',
                },
                {
                    felt: 'ytelse.fraværsperioderKorrigeringIm[2]',
                    feilkode: 'delvisFravaerFeil',
                    feilmelding: 'Delvis fravær feil',
                },
            ],
        };

        const errors = getFormErrors(values, response) as {
            Trekkperioder: string[];
            PerioderMedRefusjonskrav: string[];
            DagerMedDelvisFravær: Array<{ dato: string }>;
        };

        expect(errors.Trekkperioder[0]).toBe('Trekkperiodefeil');
        expect(errors.PerioderMedRefusjonskrav[0]).toBe('Refusjonskravfeil');
        expect(errors.DagerMedDelvisFravær[0].dato).toBe('Delvis fravær feil');
    });
});
