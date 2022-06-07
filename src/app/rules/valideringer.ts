import { IntlShape } from 'react-intl';
import { FormikErrors, getIn, setIn } from 'formik';
import { IdentRules } from './IdentRules';
import intlHelper from '../utils/intlUtils';

export type Validator<VerdiType, Skjema> = (verdi: VerdiType, skjema: Skjema) => string | undefined;

export interface IFeltValidator<FeltType, SkjemaType> {
    feltPath: string;
    validatorer: Validator<FeltType, SkjemaType>[];
    arrayInPath?: boolean;
}

export function validerSkjema<SkjemaType>(feltvalidatorer: IFeltValidator<any, SkjemaType>[], intl: IntlShape) {
    return (skjema: SkjemaType): FormikErrors<SkjemaType> =>
        feltvalidatorer.reduce((tempErrors, { feltPath, validatorer, arrayInPath }) => {
            if (arrayInPath) {
                const [pathBefore, pathAfter] = feltPath.split('[].');
                const arrayField = getIn(skjema, pathBefore) as any[];

                return arrayField.reduce((tmp, field, index) => {
                    const feltError = validatorer
                        .map((validator) => validator(getIn(field, pathAfter), skjema))
                        .find((error) => error);
                    if (feltError) {
                        return setIn(tmp, [pathBefore, pathAfter].join(`[${index}].`), intlHelper(intl, feltError));
                    }
                    return tmp;
                }, tempErrors);
            } 
                const feltError = validatorer
                    .map((validator) => validator(getIn(skjema, feltPath), skjema))
                    .find((error) => error);
                if (feltError) {
                    return setIn(tempErrors, feltPath, intlHelper(intl, feltError));
                }
                return tempErrors;
            
        }, {});
}

export function påkrevd<VerdiType>(verdi: VerdiType) {
    return verdi ? undefined : 'skjema.validering.påkrevd';
}

export function fødselsnummervalidator(verdi: string) {
    return IdentRules.harFnr11Siffrer(verdi) ? undefined : 'skjema.validering.11siffer';
}

export function minstEn<VerdiType>(verdi: VerdiType) {
    return Object.values(verdi).some((subVerdi) => subVerdi) ? undefined : 'skjema.validering.minstEn';
}

export function positivtHeltall(verdi: number) {
    const positivtHeltallPattern = /^[1-9]\d*$/;
    return positivtHeltallPattern.test(`${verdi}`) ? undefined : 'skjema.validering.positivtheltall';
}

export function gyldigDato(verdi: string) {
    const datoRegex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

    return datoRegex.test(verdi) ? undefined : 'skjema.validering.ugyldigdato';
}

export function gyldigFødselsdato(verdi: string) {
    const dagsDato = new Date();
    return new Date(verdi) < dagsDato ? undefined : 'skjema.validering.ugyldigfødselsdato';
}
