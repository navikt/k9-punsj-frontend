/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';

import { initializeDate } from 'app/utils/timeUtils';
import { identifikator, yupLocale } from 'app/rules/valideringer';

function erIkkeFremITid(dato: string) {
    const naa = new Date();
    return naa > new Date(dato);
}

const klokkeslettErFremITid = (mottattDato?: string, klokkeslett?: string) => {
    const naa = new Date();
    if (mottattDato && klokkeslett && new Date(mottattDato).getDate() === naa.getDate()) {
        return initializeDate(naa).format('HH:mm') < klokkeslett;
    }
    return false;
};

yup.setLocale(yupLocale);

const OMPMASchema = yup.object({
    mottattDato: yup
        .string()
        .required()
        .test({ test: erIkkeFremITid, message: 'Dato kan ikke være frem i tid' })
        .label('Mottatt dato'),
    klokkeslett: yup
        .string()
        .required()
        .when('mottattDato', (mottattDato, schema) =>
            schema.test({
                test: (klokkeslett: string) => !klokkeslettErFremITid(mottattDato, klokkeslett),
                message: 'Klokkeslett kan ikke være frem i tid',
            })
        )
        .label('Klokkeslett'),
    barn: yup.array().of(
        yup.object().shape({
            norskIdent: identifikator,
        })
    ),
    annenForelder: yup.object().shape({
        norskIdent: identifikator,
        situasjonType: yup.string().required().nullable(true).label('Situasjonstype'),
        situasjonBeskrivelse: yup.string().required().min(5).nullable(true).label('Situasjonsbeskrivelse'),
        periode: yup.object().shape({
            fom: yup.string().required().label('Fra og med'),
            tom: yup.string().required().label('Til og med'),
        }),
    }),
});

export default OMPMASchema;
