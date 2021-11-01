import { IPeriode } from 'app/models/types';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';

export enum KorrigeringAvInntektsmeldingFormFields {
    Virksomhet = 'Virksomhet',
    ArbeidsforholdId = 'ArbeidsforholdId',
    Trekkperioder = 'Trekkperioder',
    PerioderMedRefusjonskrav = 'PerioderMedRefusjonskrav',
    DagerMedDelvisFravær = 'DagerMedDelvisFravær',
}

export interface KorrigeringAvInntektsmeldingFormValues {
    [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: string;
    [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: string;
    [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]: DatoMedTimetall[];
}
