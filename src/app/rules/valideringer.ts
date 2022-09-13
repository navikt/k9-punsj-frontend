/* eslint-disable no-template-curly-in-string */
import { IntlShape } from 'react-intl';
import { FormikErrors, getIn, setIn } from 'formik';
import * as yup from 'yup';

import { IdentRules } from './IdentRules';
import intlHelper from '../utils/intlUtils';

export type Validator<VerdiType, Skjema> = (verdi: VerdiType, skjema: Skjema) => string | undefined;

export const yupLocale = {
    mixed: {
        required: '${path} er et påkrevd felt.',
    },
    string: {
        min: '${path} må være minst ${min} tegn',
        max: '${path} må være mest ${max} tegn',
        length: '${path} må være nøyaktig ${length} tegn',
    },
};

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

yup.setLocale(yupLocale);

export const identifikator = yup
    .string()
    .required()
    .nullable(true)
    .length(11)
    .test({
        test: (identifikasjonsnummer: string) => !IdentRules.erUgyldigIdent(identifikasjonsnummer),
        message: 'Ugyldig identifikasjonsnummer',
    })
    .label('Identifikasjonsnummer');
export const timer = yup
    .number()
    .transform((parsedValue, originalValue) => (originalValue === '' ? -1 : parsedValue))
    .min(0)
    .max(23)
    .label('Timer');
export const minutter = yup
    .number()
    .transform((parsedValue, originalValue) => (originalValue === '' ? -1 : parsedValue))
    .min(0)
    .max(59)
    .label('Minutter');

export const timerOgMinutter = yup.object({
    timer: timer.required(),
    minutter: minutter.required(),
});

export const periodeMedTimerOgMinutter = yup.object({
    periode: yup.object({
        fom: yup.string().required().label('Fra og med'),
        tom: yup.string().required().label('Til og med'),
    }),
    timer: timer.required(),
    minutter: minutter.required(),
});
export const arbeidstimerPeriode = yup.object().shape({
    periode: yup.object({
        fom: yup.string().required().label('Fra og med'),
        tom: yup.string().required().label('Til og med'),
    }),
    faktiskArbeidPerDag: timerOgMinutter,
    jobberNormaltPerDag: yup.object({
        timer: timer.test(
            'harTimerEllerMinutter',
            () => 'Timer eller minutter må fylles inn',
            function (timerVerdi) {
                const { minutter: v } = this.parent;
                return timerVerdi || v;
            }
        ),
        minutter,
    }),
});

export const validate = (validator: yup.AnySchema, value: any): boolean | string => {
    try {
        validator.validateSync(value);

        return false;
    } catch (e) {
        return e.errors[0];
    }
};

export const getValidationErrors = (validators: any, value: any): string | boolean => {
    const errorMessages = validators.map((validator: yup.AnySchema) => validate(validator, value)).filter(Boolean);
    if (errorMessages.length) {
        return errorMessages;
    }
    return false;
};
