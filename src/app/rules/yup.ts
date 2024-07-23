import * as yup from 'yup';

import { IdentRules } from './IdentRules';
import { erIkkeFremITid, gyldigDato, klokkeslettErFremITid } from './valideringer';

const yupLocale = {
    mixed: {
        required: '${path} er et påkrevd felt.',
    },
    string: {
        min: '${path} må være minst ${min} tegn',
        max: '${path} må være mest ${max} tegn',
        length: '${path} må være nøyaktig ${length} tegn',
    },
    array: {
        min: '${path} - Må velge minst ${min}',
    },
};

yup.setLocale(yupLocale);

export const passertDato = yup
    .string()
    .required()
    .test({ test: erIkkeFremITid, message: 'Dato kan ikke være frem i tid' });

const klokkeslettErFremITidForDato = (mottattDato: string) => (klokkeslett: string) =>
    !klokkeslettErFremITid(mottattDato, klokkeslett);

export const passertKlokkeslettPaaMottattDato = yup
    .string()
    .required()
    .when('mottattDato', ([mottattDato], schema) =>
        schema.test({
            test: typeof mottattDato === 'string' ? klokkeslettErFremITidForDato(mottattDato) : () => false,
            message: 'Klokkeslett kan ikke være frem i tid',
        }),
    )
    .label('Klokkeslett');

export const identifikator = yup
    .string()
    .required()
    .length(11)
    .test({
        test: (identifikasjonsnummer: string) => !IdentRules.erUgyldigIdent(identifikasjonsnummer),
        message: 'Ugyldig identifikasjonsnummer',
    })
    .label('Identifikasjonsnummer');

export const dato = () =>
    yup.string().test({
        test: (v) => !!gyldigDato(v || ''),
        message: 'Må ha en gyldig dato',
    });

export const periode = () =>
    yup.object().shape({
        fom: yup.string().required().label('Fra og med'),
        tom: yup.string().required().label('Til og med'),
    });

export const utenlandsopphold = yup.object().shape({
    periode: periode(),
    land: yup.string().required().label('Land'),
});

export const timer = yup
    .number()
    .transform((parsedValue, originalValue) => (originalValue === '' ? -1 : parsedValue))
    .label('Timer');
export const minutter = yup
    .number()
    .transform((parsedValue, originalValue) => (originalValue === '' ? -1 : parsedValue))
    .label('Minutter');

export const timerOgMinutter = yup.object({
    timer,
    minutter,
});

export const periodeMedTimerOgMinutter = yup.object({
    periode: yup.object({
        fom: yup.string().required().label('Fra og med'),
        tom: yup.string().required().label('Til og med'),
    }),
    perDag: timerOgMinutter,
});
export const arbeidstimerPeriode = yup.object().shape({
    periode: yup.object({
        fom: yup.string().required().label('Fra og med'),
        tom: yup.string().required().label('Til og med'),
    }),
    faktiskArbeidPerDag: timerOgMinutter,
    jobberNormaltPerDag: yup.object({
        timer,
        minutter,
    }),
});

// valid date format: YYYY-MM-DD
export const datoYYYYMMDD = yup
    .string()
    .required()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Må være på formatet YYYY-MM-DD')
    .test({
        test: (v) => !gyldigDato(v || ''),
        message: 'Må ha en gyldig dato',
    });

export const barn = yup.object().shape({
    norskIdent: identifikator,
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

export default yup;
