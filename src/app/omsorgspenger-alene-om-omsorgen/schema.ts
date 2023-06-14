import yup, { barn, passertDato, passertKlokkeslettPaaMottattDato, periode } from 'app/rules/yup';

const OMPAOSchema = yup.object({
    metadata: yup.object({
        signatur: yup.string().required().label('Signatur'),
    }),
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaMottattDato,
    begrunnelseForInnsending: yup.string(),
    soeknadsperiode: periode(),
    barn,
});

export default OMPAOSchema;
