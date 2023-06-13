import yup, { barn, passertDato, passertKlokkeslettPaaMottattDato, periode } from 'app/rules/yup';

const OMPAOSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaMottattDato,
    begrunnelseForInnsending: yup.string(),
    metadata: yup.object().required(),
    soeknadsperiode: periode(),
    barn,
});

export default OMPAOSchema;
