import { IPeriode } from 'app/models/types';
import yup, {
    datoErGyldig,
    datoErIkkeIHelg,
    fomDato,
    passertDato,
    passertKlokkeslettPaaMottattDato,
    periodeErIkkeKunHelg,
    tomDato,
    tomEtterFom,
} from 'app/rules/yup';

import nb from '../../i18n/nb.json';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { IOLPSoknadBackend } from 'app/models/types/OLPSoknad';
import { erYngreEnn4år } from 'app/utils';
import { JaNei } from 'app/models/enums';

export const getSchemaContext = (soknad: IOLPSoknadBackend, eksisterendePerioder: IPeriode[]) => {
    const startdatoSN = soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.periode.fom;
    return {
        eksisterendePerioder,
        erNyoppstartet: startdatoSN ? !!erYngreEnn4år(startdatoSN) : false,
        harSøkerRegnskapsfører: soknad?.metadata?.harSøkerRegnskapsfører,
    };
};

const utenlandsperiode = yup.object().shape({
    periode: yup.object().shape({
        fom: yup.string().label('Fra og med').test(datoErGyldig),
        tom: yup.string().label('Til og med').test(datoErGyldig),
    }),
    land: yup.string().required().label('Land'),
});

const fravaersperioder = ({ medSoknadAarsak }: { medSoknadAarsak: boolean }) =>
    yup.array().of(
        yup.object({
            aktivitetsfravær: yup.string(),
            organisasjonsnummer: yup.string(),
            fraværÅrsak: yup.string().required().label('Fraværsårsak'),
            søknadÅrsak: medSoknadAarsak ? yup.string().required().label('Søknadsårsak') : yup.string().nullable(),
            periode: yup.object().shape({
                fom: yup.string().label('Fra og med').test(datoErGyldig),
                tom: yup.string().label('Til og med').test(datoErGyldig),
            }),
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
            .when('info.registrertIUtlandet', {
                is: (value: boolean) => value === false,
                then: (schema) => schema.required(),
                otherwise: (schema) => schema,
            })
            .label('Organisasjonsnummer'),
        info: yup.object({
            periode: yup.object({
                fom: yup.string().label('Fra og med').test(datoErGyldig),
                tom: yup.string().label('Til og med').test(datoErGyldig),
            }),
            virksomhetstyper: yup.array().of(yup.string()).required().label('Virksomhetstype'),
            landkode: yup
                .string()
                .when('registrertIUtlandet', {
                    is: true,
                    then: (schema) => schema.required().min(1, 'Land er påkrevd'),
                    otherwise: (schema) => schema.nullable(),
                })
                .label('Land'),
            regnskapsførerNavn: yup
                .string()
                .when('$harSøkerRegnskapsfører', {
                    is: JaNei.JA,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
                .label(nb['skjema.arbeid.sn.regnskapsførernavn']),
            regnskapsførerTlf: yup
                .string()
                .when('$harSøkerRegnskapsfører', {
                    is: JaNei.JA,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
                .label(nb['skjema.arbeid.sn.regnskapsførertlf']),
            registrertIUtlandet: yup.boolean(),
            bruttoInntekt: yup
                .string()
                .when('$erNyoppstartet', {
                    is: true,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
                .label(nb['skjema.sn.bruttoinntekt']),
            erVarigEndring: yup
                .boolean()
                .when('$erNyoppstartet', {
                    is: false,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
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
        startdato: yup.string().label('Startdato').test(datoErGyldig),
        sluttdato: yup
            .string()
            .when('jobberFortsattSomFrilans', {
                is: false,
                then: (schema) => schema.required(),
                otherwise: (schema) => schema.nullable(),
            })
            .label('Sluttdato')
            .test(datoErGyldig),
        jobberFortsattSomFrilans: yup.boolean(),
        fravaersperioder: fravaersperioder({ medSoknadAarsak: false }),
    });

const OLPSchema = yup.object({
    metadata: yup.object({
        harValgtAnnenInstitusjon: yup.array().of(yup.string().oneOf(Object.values(JaNeiIkkeOpplyst))),
        harUtenlandsopphold: yup.string(),
        harBoddIUtlandet: yup.string(),
        harSøkerRegnskapsfører: yup.string(),
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
    lovbestemtFerie: yup.array().of(
        yup.object({
            fom: yup.string().label('Fra og med').test(datoErGyldig),
            tom: yup.string().label('Til og med').test(datoErGyldig),
        }),
    ),
    kurs: yup.object({
        kursHolder: yup.object({
            institusjonsUuid: yup.string().nullable(),
            holder: yup
                .string()
                .when('$eksisterendePerioder', {
                    is: (value: IPeriode[]) => value.length === 0,
                    then: (schema) => schema.required(),
                    otherwise: (schema) => schema.nullable(),
                })
                .label('Navn på institusjon'),
        }),
        kursperioder: yup.array().of(
            yup.object({
                periode: yup
                    .object({
                        fom: fomDato.test('fom-not-empty', 'Fra og med må være gyldig dato', datoErGyldig.test),
                        tom: tomDato
                            .test(datoErGyldig)
                            .test('tom-not-before-fom', 'Sluttdato kan ikke være før startdato', tomEtterFom),
                    })
                    .test({ test: periodeErIkkeKunHelg, message: 'Periode kan ikke være kun helg' }),
            }),
        ),
        reise: yup.object({
            reisedager: yup
                .array()
                .of(
                    yup
                        .string()
                        .nullable()
                        .label('Dato')
                        .test(datoErGyldig)
                        .test({ test: datoErIkkeIHelg, message: 'Reisedagen kan ikke være i helg' }),
                ),
            reisedagerBeskrivelse: yup.string().when('reisedager', {
                is: (reisedager: string[]) => reisedager?.length > 0,
                then: (schema) => schema.required().label('Beskrivelse'),
                otherwise: (schema) => schema.nullable(),
            }),
        }),
    }),
});

export default OLPSchema;
