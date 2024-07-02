import { IPeriode } from 'app/models/types';
import DatoMedKlokkeslett from 'app/models/types/DatoMedKlokkeslett';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';

export enum KorrigeringAvInntektsmeldingFormFields {
    OpplysningerOmKorrigering = 'OpplysningerOmKorrigering',
    Virksomhet = 'Virksomhet',
    ArbeidsforholdId = 'ArbeidsforholdId',
    Trekkperioder = 'Trekkperioder',
    PerioderMedRefusjonskrav = 'PerioderMedRefusjonskrav',
    DagerMedDelvisFravær = 'DagerMedDelvisFravær',
}

export interface KorrigeringAvInntektsmeldingFormValues {
    [KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering]: DatoMedKlokkeslett;
    [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: string;
    [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: string;
    [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]: DatoMedTimetall[];
}
