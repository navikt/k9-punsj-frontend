/* eslint-disable no-template-curly-in-string */

import yup, { passertDato, passertKlokkeslettPaaDato, barn, periode } from 'app/rules/yup';

const fravaersperioder = ({ organisasjonsnummerErPaakrevd }: { organisasjonsnummerErPaakrevd: boolean }) =>
    yup.array().of(
        yup.object({
            aktivitetsfravær: yup.string(),
            organisasjonsnummer: organisasjonsnummerErPaakrevd ? yup.string().required() : yup.string(),
            fraværÅrsak: yup.string().required(),
            søknadÅrsak: yup.string().required(),
            periode: periode(),
            faktiskTidPrDag: yup.string().required(),
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
        selvstendigNaeringsdrivende: yup.object({
            virksomhetNavn: yup.string().required(),
            organisasjonsnummer: yup.string().required(),
            info: yup.object({
                periode: yup.object({
                    fom: yup.string().required(),
                    tom: yup.string(),
                }),
                virksomhetstyper: yup.array().min(1),
                landkode: yup.string().required(),
                regnskapsførerNavn: yup
                    .string()
                    .when('harSøkerRegnskapsfører', { is: true, then: yup.string().required() })
                    .label('Regnskapsførernavn'),
                regnskapsførerTlf: yup
                    .string()
                    .when('harSøkerRegnskapsfører', { is: true, then: (schema) => schema.required() })
                    .label('Regnskapsførers telefonnummer'),
                harSøkerRegnskapsfører: yup.boolean(),
                registrertIUtlandet: yup.boolean(),
                bruttoInntekt: yup.string().required(),
                erVarigEndring: yup.boolean().when('erNyoppstartet', { is: true, then: yup.boolean().required() }),
                endringInntekt: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
                endringDato: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
                endringBegrunnelse: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
            }),
            fravaersperioder: fravaersperioder({ organisasjonsnummerErPaakrevd: false }),
        }),
    }),
    barn,
});
export default OMPUTSchema;
