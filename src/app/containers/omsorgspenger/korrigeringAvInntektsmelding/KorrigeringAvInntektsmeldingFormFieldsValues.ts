import { IPeriode } from 'app/models/types';
import DatoMedKlokkeslett from 'app/models/types/DatoMedKlokkeslett';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';

export enum KorrigeringAvInntektsmeldingFormFields {
    OpplysningerOmSøknaden = 'OpplysningerOmSøknaden',
    Virksomhet = 'Virksomhet',
    ArbeidsforholdId = 'ArbeidsforholdId',
    Trekkperioder = 'Trekkperioder',
    PerioderMedRefusjonskrav = 'PerioderMedRefusjonskrav',
    DagerMedDelvisFravær = 'DagerMedDelvisFravær',
}

export interface KorrigeringAvInntektsmeldingFormValues {
    [KorrigeringAvInntektsmeldingFormFields.OpplysningerOmSøknaden]: DatoMedKlokkeslett;
    [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: string;
    [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: string;
    [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: IPeriode[];
    [KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]: DatoMedTimetall[];
}
