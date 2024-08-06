/* eslint-disable  */
import { IPeriode } from 'app/models/types';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';
import { ValideringResponse } from 'app/models/types/ValideringResponse';
import { initializeDate } from 'app/utils';

import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';

interface FormErrors {
    OpplysningerOmKorrigering: string;
    Trekkperioder: string[];
    PerioderMedRefusjonskrav: string[];
    DagerMedDelvisFravær: DatoMedTimetall[];
    Virksomhet: string;
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

const harFormFeil = (errors: FormErrors) =>
    errors.OpplysningerOmKorrigering ||
    errors.Trekkperioder.some((error) => !!error) ||
    errors.PerioderMedRefusjonskrav.some((error) => !!error) ||
    errors.DagerMedDelvisFravær.some((error) => !!error.dato || !!error.timer) ||
    errors.Virksomhet;

export const getFormErrors = (values: KorrigeringAvInntektsmeldingFormValues, data: ValideringResponse) => {
    const valideringIBackendFeilet = !!data.feil;
    const errors: FormErrors = {
        OpplysningerOmKorrigering: '',
        Trekkperioder: [],
        PerioderMedRefusjonskrav: [],
        DagerMedDelvisFravær: [],
        Virksomhet: '',
    };
    if (!values.OpplysningerOmKorrigering.dato || !values.OpplysningerOmKorrigering.klokkeslett) {
        errors.OpplysningerOmKorrigering = 'Du må fylle inn dato og klokkeslett';
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
    if (!harFormFeil(errors)) {
        return {};
    }
    return errors;
};
