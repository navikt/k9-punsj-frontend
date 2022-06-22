/* eslint-disable no-template-curly-in-string */

import yup, { passertDato, passertKlokkeslettPaaDato, barn, periode } from 'app/rules/yup';

const fravaersperioder = ({ organisasjonsnummerErPaakrevd }: { organisasjonsnummerErPaakrevd: boolean }) =>
    yup.array().of(
        yup.object({
            aktivitetsfravær: yup.string(),
            organisasjonsnummer: yup.string(),
            fraværÅrsak: yup.string().required(),
            søknadÅrsak: yup.string().required(),
            periode,
            faktiskTidPrDag: organisasjonsnummerErPaakrevd ? yup.string().required() : yup.string(),
        })
    );

const OMPUTSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
    opptjeningAktivitet: yup.object({
        arbeidstaker: yup.array().of(
            yup.object({
                organisasjonsnummer: yup.string().required(),
                fravaersperioder: fravaersperioder({ organisasjonsnummerErPaakrevd: true }),
            })
        ),
        selvstendigNæringsdrivende: yup.object({
            virksomhetNavn: yup.string().required(),
            organisasjonsnummer: yup.string().required(),
            info: yup.object({
                periode,
                virksomhetstyper: yup.array().min(1),
                landkode: yup.string().required(),
                regnskapsførerNavn: yup
                    .string()
                    .when('harSøkerRegnskapsfører', { is: true, then: yup.string().required() })
                    .label('Regnskapsførernavn'),
                regnskapsførerTlf: yup
                    .string()
                    .when('harSøkerRegnskapsfører', { is: true, then: yup.string().required() })
                    .label('Regnskapsførers telefonnummer'),
                harSøkerRegnskapsfører: yup.boolean(),
                registrertIUtlandet: yup.boolean(),
                bruttoInntekt: yup.string().required(),
                erNyoppstartet: yup.boolean(),
                erVarigEndring: yup.boolean().when('erNyoppstartet', { is: true, then: yup.boolean().required() }),
                endringInntekt: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
                endringDato: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
                endringBegrunnelse: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
            }),
        }),
    }),
    barn,
});
export default OMPUTSchema;
