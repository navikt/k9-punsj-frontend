import yup, { barn, passertDato, passertKlokkeslettPaaDato } from 'app/rules/yup';

const OMPAOSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
    metadata: yup.object(),
    barn,
});
export default OMPAOSchema;
