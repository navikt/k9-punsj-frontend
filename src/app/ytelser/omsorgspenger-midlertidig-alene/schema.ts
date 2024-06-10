/* eslint-disable no-template-curly-in-string */
import yup, { identifikator, passertKlokkeslettPaaMottattDato } from 'app/rules/yup';

function erIkkeFremITid(dato: string) {
    const naa = new Date();
    return naa > new Date(dato);
}

const OMPMASchema = yup.object({
    mottattDato: yup
        .string()
        .required()
        .test({ test: erIkkeFremITid, message: 'Dato kan ikke være frem i tid' })
        .label('Mottatt dato'),
    klokkeslett: passertKlokkeslettPaaMottattDato.label('Klokkeslett'),
    barn: yup.array().of(
        yup.object().shape({
            norskIdent: identifikator,
        }),
    ),
    annenForelder: yup.object().shape({
        norskIdent: identifikator,
        situasjonType: yup.string().required().label('Situasjonstype'),
        situasjonBeskrivelse: yup.string().required().min(5).label('Situasjonsbeskrivelse'),
        periode: yup.object().shape({
            fom: yup.string().required().label('Fra og med'),
            tom: yup
                .string()
                .when('tilOgMedErIkkeOppgitt', { is: false, then: () => yup.string().required().label('Til og med') }),
            tilOgMedErIkkeOppgitt: yup.bool(),
        }),
    }),
});

export default OMPMASchema;
