/* eslint-disable no-template-curly-in-string */

import yup, { passertDato, passertKlokkeslettPaaDato, barn, periode, utenlandsopphold } from 'app/rules/yup';
import nb from '../i18n/nb.json';

const fravaersperioder = ({ medSoknadAarsak }: { medSoknadAarsak: boolean }) =>
    yup.array().of(
        yup.object({
            aktivitetsfravær: yup.string(),
            organisasjonsnummer: yup.string(),
            fraværÅrsak: yup.string().required().label('Fraværsårsak'),
            søknadÅrsak: medSoknadAarsak ? yup.string().required().label('Søknadsårsak') : yup.string().nullable(),
            periode: periode(),
            faktiskTidPrDag: yup.string().required().label('Timer fravær per dag'),
            normalArbeidstidPrDag: yup.string().required().label('Normal arbeidstid per dag'),
        })
    );
const arbeidstaker = () =>
    yup.object({
        organisasjonsnummer: yup.string().required().label('Organisasjonsnummer'),
        fravaersperioder: fravaersperioder({ medSoknadAarsak: true }),
    });
const selvstendigNaeringsdrivende = () =>
    yup.object({
        virksomhetNavn: yup.string().required().label('Virksomhetsnavn'),
        organisasjonsnummer: yup
            .string()
            .when('$registrertIUtlandet', { is: false, then: yup.string().required(), otherwise: yup.string() })
            .label('Organisasjonsnummer'),
        info: yup.object({
            periode: yup.object({
                fom: yup.string().required().label('Fra og med'),
                tom: yup.string().label('Til og med'),
            }),
            virksomhetstyper: yup.array().min(1).label('Virksomhetstype'),
            landkode: yup
                .string()
                .when('registrertIUtlandet', { is: true, then: yup.string().required(), otherwise: yup.string() })
                .label('Landkode'),

            regnskapsførerNavn: yup
                .string()
                .when('harSøkerRegnskapsfører', { is: true, then: yup.string().required() })
                .label(nb['skjema.arbeid.sn.regnskapsførernavn']),
            regnskapsførerTlf: yup
                .string()
                .when('harSøkerRegnskapsfører', { is: true, then: (schema) => schema.required() })
                .label(nb['skjema.arbeid.sn.regnskapsførertlf']),
            harSøkerRegnskapsfører: yup.boolean(),
            registrertIUtlandet: yup.boolean(),
            bruttoInntekt: yup
                .string()
                .when('$erNyoppstartet', { is: true, then: yup.string().required() })
                .label(nb['skjema.sn.bruttoinntekt']),
            erVarigEndring: yup
                .boolean()
                .when('$erNyoppstartet', { is: false, then: yup.boolean().required() })
                .label('Varig endring'),
            endringInntekt: yup
                .string()
                .when('erVarigEndring', { is: true, then: yup.string().required() })
                .label(nb['skjema.sn.endringinntekt']),
            endringDato: yup
                .string()
                .when('erVarigEndring', { is: true, then: yup.string().required() })
                .label(nb['skjema.sn.varigendringdato']),
            endringBegrunnelse: yup
                .string()
                .when('erVarigEndring', { is: true, then: yup.string().required() })
                .label(nb['skjema.sn.endringbegrunnelse']),
        }),
        fravaersperioder: fravaersperioder({ medSoknadAarsak: false }),
    });

const frilanser = () =>
    yup.object({
        startdato: yup.string().required().label('Startdato'),
        sluttdato: yup
            .string()
            .when('jobberFortsattSomFrilans', {
                is: false,
                then: yup.string().required(),
            })
            .label('Sluttdato'),
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
