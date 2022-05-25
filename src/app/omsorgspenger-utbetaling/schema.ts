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
});

export default OMPUTSchema;
