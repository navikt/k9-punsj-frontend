import { IPeriode } from 'app/models/types';

export enum KorrigeringAvInntektsmeldingFormFields {
    VIRKSOMHET = 'VIRKSOMHET',
    TREKKPERIODER = 'TREKKPERIODER',
    PERIODER_MED_REFUSJONSKRAV = 'PERIODER_MED_REFUSJONSKRAV',
}

export interface KorrigeringAvInntektsmeldingFormValues {
    [KorrigeringAvInntektsmeldingFormFields.VIRKSOMHET]: string;
    [KorrigeringAvInntektsmeldingFormFields.TREKKPERIODER]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.PERIODER_MED_REFUSJONSKRAV]: IPeriode[];
}
