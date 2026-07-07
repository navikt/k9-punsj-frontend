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
    it('omits delvis fravær rows with invalid timer input from autosave payload', () => {
        const korrigering = new OMSKorrigering(
            {
                ...getValidValues(),
                DagerMedDelvisFravær: [{ dato: '2026-02-12', timer: '.' }],
            },
            'soknad-id',
            '12345678910',
            ['jp-1'],
        );

        expect(korrigering.fravaersperioder).toEqual([]);
    });

    it('keeps valid delvis fravær timer values and trims whitespace before serialization', () => {
        const korrigering = new OMSKorrigering(
            {
                ...getValidValues(),
                DagerMedDelvisFravær: [{ dato: '2026-02-12', timer: ' 5 : 30 ' }],
            },
            'soknad-id',
            '12345678910',
            ['jp-1'],
        );

        expect(korrigering.fravaersperioder).toEqual([
            {
                periode: { fom: '2026-02-12', tom: '2026-02-12' },
                faktiskTidPrDag: '5:30',
            },
        ]);
    });
});
