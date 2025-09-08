import { IPeriode } from 'app/models/types';
import yup, { passertDato, passertKlokkeslettPaaMottattDato, periode, utenlandsperiode } from 'app/rules/yup';

import nb from '../../i18n/nb.json';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';

export const getSchemaContext = (eksisterendePerioder: IPeriode[]) => ({
    eksisterendePerioder,
});

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
        }),
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
            .when('$registrertIUtlandet', {
                is: (value: boolean) => !value,
                then: (schema) => schema.required(),
                otherwise: (schema) => schema,
            })
            .label('Organisasjonsnummer'),
        info: yup.object({
            periode: yup.object({
                fom: yup.string().required().label('Fra og med'),
                tom: yup.string().label('Til og med'),
            }),
            virksomhetstyper: yup.array().of(yup.string()).required().label('Virksomhetstype'),
            erFiskerPåBladB: yup.string().when('virksomhetstyper', {
                is: 'Fisker',
                then: (schema) => schema.required(),
            }),
            landkode: yup
                .string()
                .when('registrertIUtlandet', {
                    is: true,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
                .label('Land'),
            regnskapsførerNavn: yup
                .string()
                .when('harSøkerRegnskapsfører', {
                    is: true,
                    then: (schema) => schema.required(),
                })
                .label(nb['skjema.arbeid.sn.regnskapsførernavn']),
            regnskapsførerTlf: yup
                .string()
                .when('harSøkerRegnskapsfører', {
                    is: true,
                    then: (schema) => schema.required(),
                })
                .label(nb['skjema.arbeid.sn.regnskapsførertlf']),
            harSøkerRegnskapsfører: yup.boolean(),
            registrertIUtlandet: yup.boolean(),
            bruttoInntekt: yup
                .string()
                .when('$erNyoppstartet', {
                    is: true,
                    then: (schema) => schema.required(),
                })
                .label(nb['skjema.sn.bruttoinntekt']),
            erVarigEndring: yup
                .boolean()
                .when('$erNyoppstartet', {
                    is: false,
                    then: (schema) => schema.required(),
                })
                .label('Varig endring'),
            endringInntekt: yup
                .string()
                .when('erVarigEndring', {
                    is: true,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
                .label(nb['skjema.sn.endringinntekt']),
            endringDato: yup
                .string()
                .when('erVarigEndring', {
                    is: true,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
                .label(nb['skjema.sn.varigendringdato']),
            endringBegrunnelse: yup
                .string()
                .when('erVarigEndring', {
                    is: true,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
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
                then: (schema) => schema.required(),
            })
            .label('Sluttdato'),
        jobberFortsattSomFrilans: yup.boolean(),
        fravaersperioder: fravaersperioder({ medSoknadAarsak: false }),
    });

const OLPSchema = yup.object({
    metadata: yup.object({
        harValgtAnnenInstitusjon: yup.array().of(yup.string()),
        harUtenlandsopphold: yup.string().oneOf(Object.values(JaNeiIkkeOpplyst)),
        harBoddIUtlandet: yup.string().oneOf(Object.values(JaNeiIkkeOpplyst)),
    }),
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaMottattDato,
    opptjeningAktivitet: yup.object({
        arbeidstaker: yup.array().of(arbeidstaker()),
        selvstendigNaeringsdrivende: selvstendigNaeringsdrivende().nullable(),
        frilanser: frilanser().nullable(),
    }),
    bosteder: yup.array().when('metadata.harBoddIUtlandet', {
        is: (value: JaNeiIkkeOpplyst) => value === JaNeiIkkeOpplyst.JA,
        then: (schema) => schema.of(utenlandsperiode),
    }),
    utenlandsopphold: yup.array().when('metadata.harUtenlandsopphold', {
        is: (value: JaNeiIkkeOpplyst) => value === JaNeiIkkeOpplyst.JA,
        then: (schema) => schema.of(utenlandsperiode),
    }),
    kurs: yup.object({
        kursHolder: yup.object({
            institusjonsUuid: yup.string().nullable(),
            holder: yup.string().nullable(),
        }),
        kursperioder: yup.array().of(
            yup.object({
                periode: periode(),
            }),
        ),
        reise: yup.object({
            reisedager: yup.array().of(yup.string().required().label('Dato')),
            reisedagerBeskrivelse: yup.string().when('reisedager', {
                is: (reisedager: string[]) => reisedager?.length > 0,
                then: (schema) => schema.required().label('Beskrivelse'),
                otherwise: (schema) => schema.nullable(),
            }),
        }),
    }),
});

export default OLPSchema;
