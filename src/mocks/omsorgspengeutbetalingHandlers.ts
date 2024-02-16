// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpResponse, http } from 'msw';

import { ApiPath } from 'app/apiConfig';

const omsorgspengerutbetalingHandlers = {
    tomMappe: http.get(ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'OMP',
            søknader: [],
        }),
    ),

    mappeMedSøknad: http.get(ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'OMP',
            søknader: [
                {
                    soeknadId: '4e177e4d-922d-4205-a3e9-d3278da2abf7',
                    soekerId: '29099000129',
                    mottattDato: '10.03.2022',
                    klokkeslett: null,
                    barn: [],
                    journalposter: ['200'],
                    bosteder: [],
                    utenlandsopphold: [],
                    opptjeningAktivitet: {
                        selvstendigNaeringsdrivende: {
                            organisasjonsnummer: '',
                            virksomhetNavn: '',
                            info: {
                                periode: {
                                    fom: null,
                                    tom: null,
                                },
                                virksomhetstyper: [],
                                registrertIUtlandet: false,
                                landkode: '',
                                regnskapsførerNavn: '',
                                regnskapsførerTlf: '',
                                bruttoInntekt: null,
                                erNyoppstartet: false,
                                erVarigEndring: false,
                                endringInntekt: null,
                                endringDato: null,
                                endringBegrunnelse: '',
                                erFiskerPåBladB: false,
                            },
                        },
                        frilanser: {
                            startdato: '',
                            sluttdato: '',
                            jobberFortsattSomFrilans: false,
                        },
                        arbeidstaker: [
                            {
                                norskIdent: null,
                                organisasjonsnummer: '979312059',
                                arbeidstidInfo: null,
                            },
                        ],
                    },
                    fravaersperioder: [
                        {
                            aktivitetsFravær: 'SELVSTENDIG_VIRKSOMHET',
                            organisasjonsnummer: '',
                            periode: {
                                fom: null,
                                tom: null,
                            },
                            fraværÅrsak: null,
                            søknadÅrsak: null,
                            faktiskTidPrDag: '',
                            tidPrDag: null,
                            normalArbeidstidPrDag: '',
                            normalArbeidstid: null,
                        },
                        {
                            aktivitetsFravær: 'FRILANSER',
                            organisasjonsnummer: '',
                            periode: {
                                fom: null,
                                tom: null,
                            },
                            fraværÅrsak: null,
                            søknadÅrsak: null,
                            faktiskTidPrDag: '',
                            tidPrDag: null,
                            normalArbeidstidPrDag: '',
                            normalArbeidstid: null,
                        },
                        {
                            aktivitetsFravær: 'ARBEIDSTAKER',
                            organisasjonsnummer: '979312059',
                            periode: {
                                fom: null,
                                tom: null,
                            },
                            fraværÅrsak: 'ORDINÆRT_FRAVÆR',
                            søknadÅrsak: 'NYOPPSTARTET_HOS_ARBEIDSGIVER',
                            faktiskTidPrDag: '',
                            tidPrDag: null,
                            normalArbeidstidPrDag: '',
                            normalArbeidstid: null,
                        },
                    ],
                    harInfoSomIkkeKanPunsjes: false,
                    harMedisinskeOpplysninger: false,
                    metadata: {
                        signatur: '',
                        medlemskap: '',
                        arbeidsforhold: {
                            frilanser: false,
                            arbeidstaker: true,
                            selvstendigNaeringsdrivende: false,
                        },
                        utenlandsopphold: '',
                        harSoekerDekketOmsorgsdager: '',
                    },
                },
            ],
        }),
    ),
    nySoeknad: http.post(ApiPath.OMP_UT_SOKNAD_CREATE, () =>
        HttpResponse.json({
            soeknadId: 'bc12baac-0f0c-427e-a059-b9fbf9a3adff',
            soekerId: '29099000129',
            mottattDato: null,
            klokkeslett: null,
            barn: [],
            journalposter: ['200'],
            bosteder: null,
            utenlandsopphold: [],
            opptjeningAktivitet: null,
            fravaersperioder: null,
            harInfoSomIkkeKanPunsjes: null,
            harMedisinskeOpplysninger: null,
            metadata: null,
        }),
    ),

    soknad: http.get(ApiPath.OMP_UT_SOKNAD_GET.replace('{id}', 'bc12baac-0f0c-427e-a059-b9fbf9a3adff'), () =>
        HttpResponse.json({
            soeknadId: 'a71cdd21-b84c-4fa1-92ae-3ccb45821e5b',
            soekerId: '29099000129',
            mottattDato: '2020-10-12',
            klokkeslett: '12:53',
            barn: [],
            journalposter: ['200'],
            bosteder: null,
            utenlandsopphold: [],
            opptjeningAktivitet: null,
            fravaersperioder: null,
            harInfoSomIkkeKanPunsjes: null,
            harMedisinskeOpplysninger: null,
            metadata: null,
        }),
    ),

    oppdater: http.put(ApiPath.OMP_UT_SOKNAD_UPDATE, () => HttpResponse.json({})),
    ingenEksisterendePerioder: http.post(ApiPath.OMP_UT_K9_PERIODER, () => HttpResponse.json([])),
    eksisterendePerioderOmsorgspengeutbetaling: http.post(ApiPath.OMP_UT_K9_PERIODER, () =>
        HttpResponse.json([
            {
                fom: '2022-09-01',
                tom: '2022-09-02',
            },
            {
                fom: '2022-09-05',
                tom: '2022-09-09',
            },
            {
                fom: '2022-09-12',
                tom: '2022-09-16',
            },
            {
                fom: '2022-09-19',
                tom: '2022-09-23',
            },
            {
                fom: '2022-09-26',
                tom: '2022-09-29',
            },
        ]),
    ),

    sendInn: http.post(ApiPath.OMP_UT_SOKNAD_SUBMIT, () =>
        HttpResponse.json({
            søknadId: '008635f0-25c5-4b3a-8855-56d0d6cd252e',
            versjon: '1.1.0',
            mottattDato: '2020-10-12T10:53:00.000Z',
            søker: {
                norskIdentitetsnummer: '29099000129',
            },
            ytelse: {
                type: 'OMP_UT',
                fosterbarn: [],
                aktivitet: {},
                fraværsperioder: [
                    {
                        periode: '2022-10-01/2022-10-10',
                        duration: 'PT7H30M',
                        delvisFravær: {
                            normalarbeidstid: 'PT7H',
                            fravær: 'PT7H',
                        },
                        årsak: 'ORDINÆRT_FRAVÆR',
                        søknadÅrsak: 'KONFLIKT_MED_ARBEIDSGIVER',
                        aktivitetFravær: ['ARBEIDSTAKER'],
                        arbeidsforholdId: null,
                        arbeidsgiverOrgNr: '979312059',
                    },
                ],
                fraværsperioderKorrigeringIm: null,
                bosteder: null,
                utenlandsopphold: null,
            },
            språk: 'nb',
            journalposter: [
                {
                    inneholderInfomasjonSomIkkeKanPunsjes: null,
                    inneholderInformasjonSomIkkeKanPunsjes: false,
                    inneholderMedisinskeOpplysninger: false,
                    journalpostId: '05060',
                },
            ],
            begrunnelseForInnsending: {
                tekst: null,
            },
        }),
    ),

    valider: http.post(ApiPath.OMP_UT_SOKNAD_VALIDER, () =>
        HttpResponse.json({
            søknadId: '008635f0-25c5-4b3a-8855-56d0d6cd252e',
            versjon: '1.1.0',
            mottattDato: '2020-10-12T10:53:00.000Z',
            søker: {
                norskIdentitetsnummer: '29099000129',
            },
            ytelse: {
                type: 'OMP_UT',
                fosterbarn: [],
                aktivitet: {},
                fraværsperioder: [
                    {
                        periode: '2022-10-01/2022-10-10',
                        duration: 'PT7H30M',
                        delvisFravær: {
                            normalarbeidstid: 'PT7H',
                            fravær: 'PT7H',
                        },
                        årsak: 'ORDINÆRT_FRAVÆR',
                        søknadÅrsak: 'KONFLIKT_MED_ARBEIDSGIVER',
                        aktivitetFravær: ['ARBEIDSTAKER'],
                        arbeidsforholdId: null,
                        arbeidsgiverOrgNr: '979312059',
                    },
                ],
                fraværsperioderKorrigeringIm: null,
                bosteder: null,
                utenlandsopphold: null,
            },
            språk: 'nb',
            journalposter: [
                {
                    inneholderInfomasjonSomIkkeKanPunsjes: null,
                    inneholderInformasjonSomIkkeKanPunsjes: false,
                    inneholderMedisinskeOpplysninger: false,
                    journalpostId: '05060',
                },
            ],
            begrunnelseForInnsending: {
                tekst: null,
            },
        }),
    ),

    validerFeil: http.post(ApiPath.OMP_UT_SOKNAD_VALIDER, () =>
        HttpResponse.json(
            {
                feil: [
                    {
                        felt: 'feil',
                        feilkode: 'generiskFeil',
                        feilmelding: 'Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend',
                    },
                ],
                søknadIdDto: '27b0ffe6-26b3-4381-94f4-574ce4022b08',
            },
            { status: 400 },
        ),
    ),
};

export default omsorgspengerutbetalingHandlers;
