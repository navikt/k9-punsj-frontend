import { rest } from 'msw';

import { ApiPath } from 'app/apiConfig';

import { LOCAL_API_URL } from './konstanter';

const omsorgspengerutbetalingHandlers = {
    tomMappe: rest.get(`${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'OMP_AO',
                søknader: [],
            }),
        ),
    ),
    mappeMedSøknad: rest.get(`${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'OMP_AO',
                søknader: [
                    {
                        soeknadId: '9356c863-ab88-41eb-89ec-3ca8cd555537',
                        soekerId: '29099000129',
                        mottattDato: '2020-10-12',
                        klokkeslett: '12:53',
                        barn: {
                            norskIdent: '02021477330',
                            foedselsdato: null,
                        },
                        journalposter: ['200'],
                        periode: {
                            fom: '2023-06-01',
                            tom: null,
                        },
                        begrunnelseForInnsending: null,
                        harInfoSomIkkeKanPunsjes: false,
                        harMedisinskeOpplysninger: false,
                        metadata: {
                            signatur: '',
                        },
                    },
                ],
            }),
        ),
    ),
    nySoeknad: rest.post(`${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad`, (req, res, ctx) =>
        res(
            ctx.json({
                soeknadId: '9356c863-ab88-41eb-89ec-3ca8cd555537',
                soekerId: '29099000129',
                mottattDato: '2020-10-12',
                klokkeslett: '12:53',
                barn: {
                    norskIdent: '02021477330',
                    foedselsdato: null,
                },
                journalposter: ['200'],
                periode: null,
                begrunnelseForInnsending: null,
                harInfoSomIkkeKanPunsjes: null,
                harMedisinskeOpplysninger: null,
                metadata: null,
            }),
        ),
    ),
    soknad: rest.get(
        `${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad/mappe/9356c863-ab88-41eb-89ec-3ca8cd555537`,
        (req, res, ctx) =>
            res(
                ctx.json({
                    soeknadId: '9356c863-ab88-41eb-89ec-3ca8cd555537',
                    soekerId: '29099000129',
                    mottattDato: '2020-10-12',
                    klokkeslett: '12:53',
                    barn: {
                        norskIdent: '02021477330',
                        foedselsdato: null,
                    },
                    journalposter: ['200'],
                    periode: {
                        fom: null,
                        tom: null,
                    },
                    begrunnelseForInnsending: null,
                    harInfoSomIkkeKanPunsjes: false,
                    harMedisinskeOpplysninger: false,
                    metadata: {
                        signatur: '',
                    },
                }),
            ),
    ),
    oppdater: rest.put(`${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad/oppdater`, (req, res, ctx) =>
        res(ctx.json({})),
    ),
    sendInn: rest.post(`${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad/send`, (req, res, ctx) =>
        res(
            ctx.json({
                søknadId: '008635f0-25c5-4b3a-8855-56d0d6cd252e',
                versjon: '1.1.0',
                mottattDato: '2020-10-12T10:53:00.000Z',
                søker: {
                    norskIdentitetsnummer: '29099000129',
                },
                ytelse: {
                    type: 'OMP_AO',
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
    ),
    valider: rest.post(`${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad/valider`, (req, res, ctx) =>
        res(
            ctx.json({
                søknadId: '008635f0-25c5-4b3a-8855-56d0d6cd252e',
                versjon: '1.1.0',
                mottattDato: '2020-10-12T10:53:00.000Z',
                søker: {
                    norskIdentitetsnummer: '29099000129',
                },
                ytelse: {
                    type: 'OMP_AO_UT',
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
    ),
    validerFeil: rest.post(`${LOCAL_API_URL}/omsorgspenger-alene-om-omsorgen-soknad/valider`, (req, res, ctx) =>
        res(
            ctx.status(400),
            ctx.json({
                feil: [
                    {
                        felt: 'feil',
                        feilkode: 'generiskFeil',
                        feilmelding: 'Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend',
                    },
                ],
                søknadIdDto: '27b0ffe6-26b3-4381-94f4-574ce4022b08',
            }),
        ),
    ),
};

export default omsorgspengerutbetalingHandlers;
