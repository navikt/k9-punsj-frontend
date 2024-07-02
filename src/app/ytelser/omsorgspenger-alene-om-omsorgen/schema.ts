import yup, { barn, datoYYYYMMDD, passertDato, passertKlokkeslettPaaMottattDato } from 'app/rules/yup';

const OMPAOSchema = yup.object({
    metadata: yup.object({
        signatur: yup.string().required().label('Signatur'),
    }),
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaMottattDato,
    periode: yup.object({
        fom: datoYYYYMMDD,
    }),
    barn,
});

export default OMPAOSchema;
