import { OMSKorrigering } from 'app/models/types/OMSKorrigering';
import { KorrigeringAvInntektsmeldingFormValues } from 'app/søknader/korrigeringAvInntektsmelding/types/KorrigeringAvInntektsmeldingFormFieldsValues';

const getValidValues = (): KorrigeringAvInntektsmeldingFormValues => ({
    OpplysningerOmKorrigering: { dato: '2026-02-01', klokkeslett: '10:00' },
    Virksomhet: '999999999',
    ArbeidsforholdId: '',
    Trekkperioder: [{ fom: '', tom: '' }],
    PerioderMedRefusjonskrav: [{ fom: '', tom: '' }],
    DagerMedDelvisFravær: [{ dato: '', timer: '' }],
});

describe('OMSKorrigering', () => {
    it('tar med senere trekkperioder selv om første rad er tom', () => {
        const korrigering = new OMSKorrigering(
            {
                ...getValidValues(),
                Trekkperioder: [
                    { fom: '', tom: '' },
                    { fom: '2026-02-10', tom: '2026-02-10' },
                ],
            },
            'soknad-id',
            '12345678910',
            ['jp-1'],
        );

        expect(korrigering.fravaersperioder).toContainEqual({
            periode: { fom: '2026-02-10', tom: '2026-02-10' },
            faktiskTidPrDag: '0',
        });
    });

    it('tar med senere refusjonsperioder selv om første rad er tom', () => {
        const korrigering = new OMSKorrigering(
            {
                ...getValidValues(),
                PerioderMedRefusjonskrav: [
                    { fom: '', tom: '' },
                    { fom: '2026-02-11', tom: '2026-02-11' },
                ],
            },
            'soknad-id',
            '12345678910',
            ['jp-1'],
        );

        expect(korrigering.fravaersperioder).toContainEqual({
            periode: { fom: '2026-02-11', tom: '2026-02-11' },
            faktiskTidPrDag: null,
        });
    });

    it('tar med senere delvis fravær-rader selv om første rad er tom', () => {
        const korrigering = new OMSKorrigering(
            {
                ...getValidValues(),
                DagerMedDelvisFravær: [
                    { dato: '', timer: '' },
                    { dato: '2026-02-12', timer: '5,5' },
                ],
            },
            'soknad-id',
            '12345678910',
            ['jp-1'],
        );

        expect(korrigering.fravaersperioder).toContainEqual({
            periode: { fom: '2026-02-12', tom: '2026-02-12' },
            faktiskTidPrDag: '5,5',
        });
    });

    it('utelater delvis fravær-rader med ugyldig timerinput fra autosave-payload', () => {
        const korrigering = new OMSKorrigering(
            {
                ...getValidValues(),
                DagerMedDelvisFravær: [{ dato: '2026-02-12', timer: '5.' }],
            },
            'soknad-id',
            '12345678910',
            ['jp-1'],
        );

        expect(korrigering.fravaersperioder).toEqual([]);
    });

    it('beholder gyldige desimalverdier for delvis fravær og trimmer whitespace før serialisering', () => {
        const korrigering = new OMSKorrigering(
            {
                ...getValidValues(),
                DagerMedDelvisFravær: [{ dato: '2026-02-12', timer: ' 5,5 ' }],
            },
            'soknad-id',
            '12345678910',
            ['jp-1'],
        );

        expect(korrigering.fravaersperioder).toEqual([
            {
                periode: { fom: '2026-02-12', tom: '2026-02-12' },
                faktiskTidPrDag: '5,5',
            },
        ]);
    });
});
