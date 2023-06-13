import yup, { barn, passertDato, passertKlokkeslettPaaDato, periode } from 'app/rules/yup';

const OMPAOSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
    begrunnelseForInnsending: yup.string(),
    metadata: yup.object().required(),
    soeknadsperiode: periode(),
    barn,
});

export default OMPAOSchema;
