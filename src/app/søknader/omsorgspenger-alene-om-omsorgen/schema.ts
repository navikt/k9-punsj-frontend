import yup, { barn, datoYYYYMMDD, passertDato, passertKlokkeslettPaaMottattDato } from 'app/validation/yup';

const OMPAOSchema = yup.object({
    metadata: yup.object({
        signatur: yup.string().required().label('Signatur'),
    }),
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaMottattDato,
    periode: yup.object({
        fom: datoYYYYMMDD.label('Søker er alene om omsorgen fra og med'),
    }),
    barn,
});

export default OMPAOSchema;
