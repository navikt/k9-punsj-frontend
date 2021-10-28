import { IPeriode } from 'app/models/types';

export enum KorrigeringAvInntektsmeldingFormFields {
    Virksomhet = 'Virksomhet',
    ArbeidsforholdId = 'ArbeidsforholdId',
    Trekkperioder = 'Trekkperioder',
    PerioderMedRefusjonskrav = 'PerioderMedRefusjonskrav',
}

export interface KorrigeringAvInntektsmeldingFormValues {
    [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: string;
    [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: string;
    [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: IPeriode[];
}
