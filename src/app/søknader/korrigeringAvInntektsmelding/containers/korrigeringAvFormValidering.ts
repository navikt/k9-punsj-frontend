import { IPeriode } from 'app/models/types';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import { initializeDate } from 'app/utils';

import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../types/KorrigeringAvInntektsmeldingFormFieldsValues';

export interface FormErrors {
    OpplysningerOmKorrigering: {
        dato: string;
        klokkeslett: string;
    };
    Trekkperioder: string[];
    PerioderMedRefusjonskrav: string[];
    DagerMedDelvisFravær: DatoMedTimetall[];
    Virksomhet: string;
    ArbeidsforholdId?: string;
}

interface FravaersperiodeTarget {
    field:
        | KorrigeringAvInntektsmeldingFormFields.Trekkperioder
        | KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav
        | KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær;
    index: number;
}

const getPeriodRange = (fom: string, tom: string) => {
    const dager = [];
    let currentDate = initializeDate(fom);
    const tomDate = initializeDate(tom);
    dager.push(currentDate.format('YYYY-MM-DD'));
    while (currentDate.isBefore(tomDate)) {
        currentDate = currentDate.add(1, 'day');
        dager.push(currentDate.format('YYYY-MM-DD'));
    }
    return dager;
};

const getPeriodeFeil = (value: IPeriode, response: ValideringResponse) => {
    const fom = initializeDate(value.fom).format('YYYY-MM-DD');
    const tom = initializeDate(value.tom).format('YYYY-MM-DD');
    const dagerIPeriode = getPeriodRange(fom, tom);
    let feilIndex = 0;
    const harMatchendeFeil = response.feil.some((feil, index) =>
        dagerIPeriode.some((dag) => {
            const feltStreng = `fraværsperioderKorrigeringIm.perioder[${dag}/${dag}]`;
            if (feil.felt === feltStreng) {
                feilIndex = index;
            }
            return feil.felt === feltStreng;
        }),
    );
    return harMatchendeFeil ? response?.feil[feilIndex]?.feilmelding : null;
};

const getTommeErrors = (): FormErrors => ({
    OpplysningerOmKorrigering: { dato: '', klokkeslett: '' },
    Trekkperioder: [],
    PerioderMedRefusjonskrav: [],
    DagerMedDelvisFravær: [],
    Virksomhet: '',
});

const getFravaersperiodeTargets = (values: KorrigeringAvInntektsmeldingFormValues): FravaersperiodeTarget[] => {
    const targets: FravaersperiodeTarget[] = [];

    values.Trekkperioder.forEach((value, index) => {
        if (value.fom) {
            targets.push({ field: KorrigeringAvInntektsmeldingFormFields.Trekkperioder, index });
        }
    });

    values.PerioderMedRefusjonskrav.forEach((value, index) => {
        if (value.fom) {
            targets.push({ field: KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav, index });
        }
    });

    values.DagerMedDelvisFravær.forEach((value, index) => {
        if (value.dato || value.timer) {
            targets.push({ field: KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær, index });
        }
    });

    return targets;
};

const setPeriodError = (errors: FormErrors, target: FravaersperiodeTarget, feilmelding: string) => {
    switch (target.field) {
        case KorrigeringAvInntektsmeldingFormFields.Trekkperioder:
            errors.Trekkperioder[target.index] = feilmelding;
            break;
        case KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav:
            errors.PerioderMedRefusjonskrav[target.index] = feilmelding;
            break;
        case KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær:
            errors.DagerMedDelvisFravær[target.index].dato = feilmelding;
            break;
    }
};

const mapServerValidationFeil = (
    values: KorrigeringAvInntektsmeldingFormValues,
    response: ValideringResponse,
    errors: FormErrors,
) => {
    const fravaersperiodeTargets = getFravaersperiodeTargets(values);

    response.feil.forEach((feil: Feil) => {
        if (!feil.feilmelding) {
            return;
        }

        if (feil.felt === 'mottattDato') {
            errors.OpplysningerOmKorrigering.dato = feil.feilmelding;
            return;
        }

        if (feil.felt === 'klokkeslett') {
            errors.OpplysningerOmKorrigering.klokkeslett = feil.feilmelding;
            return;
        }

        if (feil.felt === 'arbeidsforholdId') {
            errors.ArbeidsforholdId = feil.feilmelding;
            return;
        }

        if (feil.felt === 'organisasjonsnummer') {
            errors.Virksomhet = feil.feilmelding;
            return;
        }

        const indexMatch = feil.felt?.match(/^ytelse\.fraværsperioderKorrigeringIm\[(\d+)]$/);
        if (indexMatch) {
            if (feil.feilkode === 'ikkeSpesifisertOrgNr') {
                errors.Virksomhet = feil.feilmelding;
                return;
            }

            const target = fravaersperiodeTargets[Number(indexMatch[1])];
            if (target) {
                setPeriodError(errors, target, feil.feilmelding);
                return;
            }
        }

        if (feil.felt === 'søknad' && feil.feilkode === 'mottattDato' && !errors.OpplysningerOmKorrigering.dato) {
            errors.OpplysningerOmKorrigering.dato = feil.feilmelding;
            return;
        }

        if (
            feil.felt === 'søknad' &&
            feil.feilkode === 'klokkeslett' &&
            !errors.OpplysningerOmKorrigering.klokkeslett
        ) {
            errors.OpplysningerOmKorrigering.klokkeslett = feil.feilmelding;
        }
    });
};

const harFormFeil = (errors: FormErrors) =>
    errors.OpplysningerOmKorrigering.dato ||
    errors.OpplysningerOmKorrigering.klokkeslett ||
    errors.Trekkperioder.some((error) => !!error) ||
    errors.PerioderMedRefusjonskrav.some((error) => !!error) ||
    errors.DagerMedDelvisFravær.some((error) => !!error.dato || !!error.timer) ||
    errors.Virksomhet ||
    errors.ArbeidsforholdId;

export const getFormErrors = (values: KorrigeringAvInntektsmeldingFormValues, data?: ValideringResponse) => {
    const valideringIBackendFeilet = !!data?.feil?.length;
    const errors: FormErrors = getTommeErrors();
    if (!values.OpplysningerOmKorrigering.dato || !values.OpplysningerOmKorrigering.klokkeslett) {
        if (!values.OpplysningerOmKorrigering.dato) {
            errors.OpplysningerOmKorrigering.dato = 'Du må fylle inn dato';
        }
        if (!values.OpplysningerOmKorrigering.klokkeslett) {
            errors.OpplysningerOmKorrigering.klokkeslett = 'Du må fylle inn klokkeslett';
        }
    }
    if (!values.Virksomhet) {
        errors.Virksomhet = 'Du må velge en virksomhet';
    }
    values.Trekkperioder.forEach((value, index) => {
        errors.Trekkperioder.push('');
        if (!value.fom && value.tom) {
            errors.Trekkperioder[index] = 'Fra og med (FOM) må være satt.';
        } else if (!value.tom && value.fom) {
            errors.Trekkperioder[index] = 'Til og med (TOM) må være satt.';
        }
        if (valideringIBackendFeilet) {
            const matchendeFeil = getPeriodeFeil(value, data);
            if (matchendeFeil) {
                errors.Trekkperioder[index] = matchendeFeil;
            }
        }
    });
    values.PerioderMedRefusjonskrav.forEach((value, index) => {
        errors.PerioderMedRefusjonskrav.push('');
        if (!value.fom && value.tom) {
            errors.PerioderMedRefusjonskrav[index] = 'Fra og med (FOM) må være satt.';
        } else if (!value.tom && value.fom) {
            errors.PerioderMedRefusjonskrav[index] = 'Til og med (TOM) må være satt.';
        }
        if (valideringIBackendFeilet) {
            const matchendeFeil = getPeriodeFeil(value, data);
            if (matchendeFeil) {
                errors.PerioderMedRefusjonskrav[index] = matchendeFeil;
            }
        }
    });
    values.DagerMedDelvisFravær.forEach((value, index) => {
        errors.DagerMedDelvisFravær.push({ dato: '', timer: '' });
        if (value.dato && !value.timer) {
            errors.DagerMedDelvisFravær[index].timer = 'Du må fylle inn timer';
        } else if (!value.dato && value.timer) {
            errors.DagerMedDelvisFravær[index].dato = 'Dato må være satt';
        } else if (value.timer) {
            const timetall = value.timer.replace(/,/g, '.').replace(/\s+/g, '');
            if (Number(timetall) > 7.5) {
                errors.DagerMedDelvisFravær[index].timer = 'Delvis fravær kan ikke overstige 7 timer og 30 min';
            }
        }
        if (valideringIBackendFeilet) {
            const matchendeFeil = getPeriodeFeil({ fom: value.dato, tom: value.dato }, data);
            if (matchendeFeil) {
                errors.DagerMedDelvisFravær[index].dato = matchendeFeil;
            }
        }
    });
    if (valideringIBackendFeilet && data) {
        mapServerValidationFeil(values, data, errors);
    }
    if (!harFormFeil(errors)) {
        return {};
    }
    return errors;
};
