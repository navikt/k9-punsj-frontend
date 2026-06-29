import { buildInitialValuesFromSoknad } from '../../../app/søknader/korrigeringAvInntektsmelding/containers/KorrigeringAvInntektsmeldingForm';

describe('buildInitialValuesFromSoknad', () => {
    it('hydrates mottatt dato and klokkeslett from loaded korrigering', () => {
        const result = buildInitialValuesFromSoknad({
            mottattDato: '2020-10-12',
            klokkeslett: '12:53',
            organisasjonsnummer: '979312059',
            arbeidsforholdId: null,
            fravaersperioder: null,
        });

        expect(result.OpplysningerOmKorrigering).toEqual({ dato: '2020-10-12', klokkeslett: '12:53' });
        expect(result.Virksomhet).toBe('979312059');
        expect(result.ArbeidsforholdId).toBe('');
        expect(result.Trekkperioder).toEqual([{ fom: '', tom: '' }]);
        expect(result.PerioderMedRefusjonskrav).toEqual([{ fom: '', tom: '' }]);
        expect(result.DagerMedDelvisFravær).toEqual([{ dato: '', timer: '' }]);
    });

    it('maps fravaersperioder into the correct form buckets', () => {
        const result = buildInitialValuesFromSoknad({
            fravaersperioder: [
                { periode: { fom: '2021-11-01', tom: '2021-11-02' }, faktiskTidPrDag: '0' },
                { periode: { fom: '2021-11-03', tom: '2021-11-04' }, faktiskTidPrDag: null },
                { periode: { fom: '2021-11-05', tom: '2021-11-05' }, faktiskTidPrDag: '4.5' },
            ],
        });

        expect(result.Trekkperioder).toEqual([{ fom: '2021-11-01', tom: '2021-11-02' }]);
        expect(result.PerioderMedRefusjonskrav).toEqual([{ fom: '2021-11-03', tom: '2021-11-04' }]);
        expect(result.DagerMedDelvisFravær).toEqual([{ dato: '2021-11-05', timer: '4.5' }]);
    });
});
