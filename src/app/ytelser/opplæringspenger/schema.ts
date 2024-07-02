import { IPeriode } from 'app/models/types';
import yup, { passertDato, passertKlokkeslettPaaMottattDato, periode, utenlandsopphold } from 'app/rules/yup';

import nb from 'app/i18n/nb.json';
import { OLPSoknad } from 'app/models/types/OLPSoknad';

export const getSchemaContext = (soknad: OLPSoknad, eksisterendePerioder: IPeriode[]) => ({
    ...soknad.opptjeningAktivitet,
    bosteder: soknad?.bosteder,
    utenlandsopphold: soknad?.utenlandsopphold,
    kurs: soknad?.kurs,
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
            .when('$registrertIUtlandet', { is: false, then: yup.string().required(), otherwise: yup.string() })
            .label('Organisasjonsnummer'),
        info: yup.object({
            periode: yup.object({
                fom: yup.string().required().label('Fra og med'),
                tom: yup.string().label('Til og med'),
            }),
            virksomhetstyper: yup.array().of(yup.string()).required().label('Virksomhetstype'),
            erFiskerPåBladB: yup
                .string()
                .when('virksomhetstyper', { is: 'Fisker', then: (schema) => schema.required() }),
            landkode: yup
                .string()
                .when('registrertIUtlandet', {
                    is: true,
                    then: yup.string().required(),
                    otherwise: yup.string().nullable(),
                })
                .label('Land'),
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
                .when('erVarigEndring', { is: true, then: yup.string().required(), otherwise: yup.string().nullable() })
                .label(nb['skjema.sn.endringinntekt']),
            endringDato: yup
                .string()
                .when('erVarigEndring', { is: true, then: yup.string().required(), otherwise: yup.string().nullable() })
                .label(nb['skjema.sn.varigendringdato']),
            endringBegrunnelse: yup
                .string()
                .when('erVarigEndring', { is: true, then: yup.string().required(), otherwise: yup.string().nullable() })
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

const OLPSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaMottattDato,
    opptjeningAktivitet: yup.object({
        arbeidstaker: yup.array().of(arbeidstaker()),
        selvstendigNaeringsdrivende: selvstendigNaeringsdrivende().nullable(),
        frilanser: frilanser().nullable(),
    }),
    bosteder: yup.array().when('$bosteder', { is: 'ja', then: yup.array().of(utenlandsopphold) }),
    utenlandsopphold: yup.array().when('$utenlandsopphold', { is: 'ja', then: yup.array().of(utenlandsopphold) }),
    kurs: yup.object({
        kursHolder: yup.object({
            institusjonsUuid: yup.string().required(),
        }),
        kursperioder: yup.array().of(
            yup.object({
                periode: periode(),
                avreise: yup.string().required(),
                hjemkomst: yup.string().required(),
            }),
        ),
    }),
});
export default OLPSchema;
