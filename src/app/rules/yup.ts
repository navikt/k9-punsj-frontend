/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';
import { IdentRules } from './IdentRules';
import { erIkkeFremITid, klokkeslettErFremITid } from './valideringer';

const yupLocale = {
    mixed: {
        required: '${path} er et påkrevd felt.',
    },
    string: {
        min: '${path} må være minst ${min} tegn',
        max: '${path} må være mest ${max} tegn',
        length: '${path} må være nøyaktig ${length} tegn',
    },
};

yup.setLocale(yupLocale);

export const passertDato = yup
    .string()
    .required()
    .test({ test: erIkkeFremITid, message: 'Dato kan ikke være frem i tid' });

export const passertKlokkeslettPaaDato = yup
    .string()
    .required()
    .when('mottattDato', (mottattDato, schema) =>
        schema.test({
            test: (klokkeslett: string) => !klokkeslettErFremITid(mottattDato, klokkeslett),
            message: 'Klokkeslett kan ikke være frem i tid',
        })
    )
    .label('Klokkeslett');

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

export const periode = () => yup.object().shape({
    fom: yup.string().required().label('Fra og med'),
    tom: yup.string().required().label('Til og med'),
});

export const barn = yup.array().of(
    yup.object().shape({
        norskIdent: identifikator,
    })
);

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
