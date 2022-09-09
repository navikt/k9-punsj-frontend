/* eslint-disable no-template-curly-in-string */

import yup, { passertDato, passertKlokkeslettPaaDato, barn, periode, utenlandsopphold } from 'app/rules/yup';

const fravaersperioder = ({ medSoknadAarsak }: { medSoknadAarsak: boolean }) =>
    yup.array().of(
        yup.object({
            aktivitetsfravær: yup.string(),
            organisasjonsnummer: yup.string(),
            fraværÅrsak: yup.string().required(),
            søknadÅrsak: medSoknadAarsak ? yup.string().required() : yup.string().nullable(),
            periode: periode(),
            faktiskTidPrDag: yup.string().required().label('Timer fravær per dag'),
            normalArbeidstidPrDag: yup.string().required().label('Normal arbeidstid per dag'),
        })
    );
const arbeidstaker = () =>
    yup.object({
        organisasjonsnummer: yup.string().required(),
        fravaersperioder: fravaersperioder({ medSoknadAarsak: true }),
    });
const selvstendigNaeringsdrivende = () =>
    yup.object({
        virksomhetNavn: yup.string().required(),
        organisasjonsnummer: yup
            .string()
            .when('$registrertIUtlandet', { is: false, then: yup.string().required(), otherwise: yup.string() }),
        info: yup.object({
            periode: yup.object({
                fom: yup.string().required(),
                tom: yup.string(),
            }),
            virksomhetstyper: yup.array().min(1),
            landkode: yup
                .string()
                .when('registrertIUtlandet', { is: true, then: yup.string().required(), otherwise: yup.string() }),

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
            bruttoInntekt: yup.string().when('$erNyoppstartet', { is: true, then: yup.string().required() }),
            erVarigEndring: yup.boolean().when('$erNyoppstartet', { is: false, then: yup.boolean().required() }),
            endringInntekt: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
            endringDato: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
            endringBegrunnelse: yup.string().when('erVarigEndring', { is: true, then: yup.string().required() }),
        }),
        fravaersperioder: fravaersperioder({ medSoknadAarsak: false }),
    });

const frilanser = () =>
    yup.object({
        startdato: yup.string().required(),
        sluttdato: yup.string().when('jobberFortsattSomFrilans', {
            is: false,
            then: yup.string().required(),
        }),
        jobberFortsattSomFrilans: yup.boolean(),
        fravaersperioder: fravaersperioder({ medSoknadAarsak: false }),
    });

const OMPUTSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
    metadata: yup.object({
        arbeidsforhold: yup.object().test({
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
    medlemskap: yup.array().when('$medlemskap', { is: 'ja', then: yup.array().of(utenlandsopphold) }),
    utenlandsopphold: yup.array().when('$utenlandsopphold', { is: 'ja', then: yup.array().of(utenlandsopphold) }),
    barn,
});
export default OMPUTSchema;
