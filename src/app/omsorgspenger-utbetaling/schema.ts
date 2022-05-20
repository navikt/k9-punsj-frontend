/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';

import { initializeDate } from 'app/utils/timeUtils';
import { erUgyldigIdent } from 'app/rules/valideringer';

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

yup.setLocale({
    mixed: {
        required: '${path} er et påkrevd felt.',
    },
    string: {
        min: '${path} må være minst ${min} tegn',
        max: '${path} må være mest ${max} tegn',
        length: '${path} må være nøyaktig ${length} tegn',
    },
});

const OMPUTSchema = yup.object({
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
    annenForelder: yup.object().shape({
        norskIdent: yup
            .string()
            .required()
            .nullable(true)
            .length(11)
            .test({
                test: (identifikasjonsnummer: string) => !erUgyldigIdent(identifikasjonsnummer),
                message: 'Ugyldig identifikasjonsnummer',
            })
            .label('Identifikasjonsnummer'),
        situasjonType: yup.string().required().nullable(true).label('Situasjonstype'),
        situasjonBeskrivelse: yup.string().required().min(5).nullable(true).label('Situasjonsbeskrivelse'),
        periode: yup.object().shape({
            fom: yup.string().required().label('Fra og med'),
            tom: yup.string().required().label('Til og med'),
        }),
    }),
});

export default OMPUTSchema;
