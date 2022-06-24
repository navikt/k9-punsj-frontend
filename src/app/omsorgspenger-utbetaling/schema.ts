/* eslint-disable no-template-curly-in-string */

import yup, { passertDato, passertKlokkeslettPaaDato, barn, periode } from 'app/rules/yup';
import { gyldigDato } from '../rules/valideringer';

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
const arbeidstaker = () =>
    yup.object({
        organisasjonsnummer: yup.string().required(),
        fravaersperioder: fravaersperioder({ organisasjonsnummerErPaakrevd: true }),
    });
const selvstendigNaeringsdrivende = () =>
    yup.object({
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
    });

const frilanser = () =>
    yup.object({
        startdato: yup.string().required(),
        sluttdato: yup.string().when('jobberFortsattSomFrilans', { is: false, then: yup.string().required() }),
        jobberFortsattSomFrilans: yup.boolean().when('sluttdato', (sluttdato, schema) =>
            schema.test({
                test: () => !gyldigDato(sluttdato),
                messsage: 'Må fylle inn gyldig sluttdato eller velge at personen fortsatt jobber som frilans',
            })
        ),
    });

const OMPUTSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
    metadata: yup.object({
        arbeidsforhold: yup
            .object({
                arbeidstaker: yup.boolean().when(['arbeidstaker', 'selvstendigNaeringsdrivende', 'frilanser'],  (params) => Object.values(params)),
                selvstendigNaeringsdrivende: yup.boolean(),
                frilanser: yup.boolean(),
            })
            .test({
                test: (arbeidsforhold) => Object.values(arbeidsforhold).some((v) => v),
                message: 'Må velge minst ett arbeidsforhold',
            }),
    }),
    opptjeningAktivitet: yup.object({
        arbeidstaker: yup.array().when('$arbeidstaker', { is: true, then: yup.array().of(arbeidstaker()) }),
        selvstendigNaeringsdrivende: yup
            .object()
            .when('$selvstendigNaeringsdrivende', { is: true, then: selvstendigNaeringsdrivende }),
        frilanser: yup.object().when('$frilanser', { is: true, then: frilanser, otherwise: yup.object() }),
    }),
    barn,
});
export default OMPUTSchema;
