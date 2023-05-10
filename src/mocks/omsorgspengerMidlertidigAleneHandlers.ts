import { rest } from 'msw';

import { LOCAL_API_URL } from './konstanter';

const handlers = {
    tomMappe: rest.get(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'OMP_MA',
                søknader: [],
            }),
        ),
    ),
    mappeMedSøknad: rest.get(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'OMP_MA',
                søknader: [
                    {
                        soeknadId: 'db054295-f1bd-45d2-b0fe-0d032ce25295',
                        soekerId: '29099000129',
                        mottattDato: '2020-10-12',
                        klokkeslett: '12:53',
                        barn: [
                            {
                                norskIdent: '02021477330',
                                foedselsdato: null,
                            },
                            {
                                norskIdent: '03091477490',
                                foedselsdato: null,
                            },
                            {
                                norskIdent: '09081478047',
                                foedselsdato: null,
                            },
                        ],
                        annenForelder: {
                            norskIdent: '13079438906',
                            situasjonType: 'UTØVER_VERNEPLIKT',
                            situasjonBeskrivelse: 'asdasdasgfdfdfdf',
                            periode: {
                                fom: '2023-05-03',
                                tom: '2023-05-18',
                            },
                        },
                        journalposter: ['205'],
                        harInfoSomIkkeKanPunsjes: false,
                        harMedisinskeOpplysninger: false,
                        metadata: null,
                    },
                ],
            }),
        ),
    ),
    nySoeknad: rest.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad`, (req, res, ctx) =>
        res(
            ctx.status(201),
            ctx.json({
                soeknadId: 'db054295-f1bd-45d2-b0fe-0d032ce25295',
                soekerId: '29099000129',
                mottattDato: '2020-10-12',
                klokkeslett: '12:53',
                barn: [],
                annenForelder: {
                    norskIdent: '07827599802',
                    situasjonType: null,
                    situasjonBeskrivelse: null,
                    periode: null,
                },
                journalposter: ['205'],
                harInfoSomIkkeKanPunsjes: null,
                harMedisinskeOpplysninger: null,
                metadata: null,
            }),
        ),
    ),
    soknad: rest.get(
        `${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/mappe/db054295-f1bd-45d2-b0fe-0d032ce25295`,
        (req, res, ctx) =>
            res(
                ctx.json({
                    soeknadId: 'db054295-f1bd-45d2-b0fe-0d032ce25295',
                    soekerId: '29099000129',
                    mottattDato: '2020-10-12',
                    klokkeslett: '12:53',
                    barn: [],
                    annenForelder: {
                        norskIdent: '07827599802',
                        situasjonType: null,
                        situasjonBeskrivelse: null,
                        periode: null,
                    },
                    journalposter: ['205'],
                    harInfoSomIkkeKanPunsjes: null,
                    harMedisinskeOpplysninger: null,
                    metadata: null,
                }),
            ),
    ),
    oppdater: rest.put(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/oppdater`, (req, res, ctx) =>
        res(ctx.json({})),
    ),
    sendInn: rest.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/send`, (req, res, ctx) =>
        res(
            ctx.status(202),
            ctx.json({
                søknadId: '78415bd0-dd83-471d-b9e1-018b57cfdc10',
                versjon: '1.0.0',
                mottattDato: '2020-10-12T10:53:00.000Z',
                søker: {
                    norskIdentitetsnummer: '29099000129',
                },
                ytelse: {
                    type: 'OMP_UTV_MA',
                    barn: [
                        {
                            norskIdentitetsnummer: '02021477330',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '03091477490',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '09081478047',
                            fødselsdato: null,
                        },
                    ],
                    annenForelder: {
                        norskIdentitetsnummer: '13079438906',
                        situasjon: 'INNLAGT_I_HELSEINSTITUSJON',
                        situasjonBeskrivelse: 'jhkhjkhjkhjhjkhjk',
                        periode: '2023-05-10/2023-05-11',
                    },
                    begrunnelse: null,
                },
                språk: 'nb',
                journalposter: [
                    {
                        inneholderInfomasjonSomIkkeKanPunsjes: null,
                        inneholderInformasjonSomIkkeKanPunsjes: false,
                        inneholderMedisinskeOpplysninger: false,
                        journalpostId: '206',
                    },
                ],
                begrunnelseForInnsending: {
                    tekst: null,
                },
                kildesystem: null,
            }),
        ),
    ),
    valider: rest.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/valider`, (req, res, ctx) =>
        res(
            ctx.status(202),
            ctx.json({
                søknadId: '78415bd0-dd83-471d-b9e1-018b57cfdc10',
                versjon: '1.0.0',
                mottattDato: '2020-10-12T10:53:00.000Z',
                søker: {
                    norskIdentitetsnummer: '29099000129',
                },
                ytelse: {
                    type: 'OMP_UTV_MA',
                    barn: [
                        {
                            norskIdentitetsnummer: '02021477330',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '03091477490',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '09081478047',
                            fødselsdato: null,
                        },
                    ],
                    annenForelder: {
                        norskIdentitetsnummer: '13079438906',
                        situasjon: 'INNLAGT_I_HELSEINSTITUSJON',
                        situasjonBeskrivelse: 'jhkhjkhjkhjhjkhjk',
                        periode: '2023-05-10/2023-05-11',
                    },
                    begrunnelse: null,
                },
                språk: 'nb',
                journalposter: [
                    {
                        inneholderInfomasjonSomIkkeKanPunsjes: null,
                        inneholderInformasjonSomIkkeKanPunsjes: false,
                        inneholderMedisinskeOpplysninger: true,
                        journalpostId: '206',
                    },
                ],
                begrunnelseForInnsending: {
                    tekst: null,
                },
                kildesystem: null,
            }),
        ),
    ),
    validerFeil: rest.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/valider`, (req, res, ctx) =>
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

export default handlers;
