// eslint-disable-next-line import/no-extraneous-dependencies
import { HttpResponse, http } from 'msw';

import { LOCAL_API_URL } from './konstanter';

const handlers = {
    tomMappe: http.get(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/mappe`, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'OMP_MA',
            søknader: [],
        }),
    ),

    mappeMedSøknad: http.get(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/mappe`, () =>
        HttpResponse.json({
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

    nySoeknad: http.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad`, () =>
        HttpResponse.json(
            {
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
            },
            { status: 201 },
        ),
    ),

    soknad: http.get(
        `${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/mappe/db054295-f1bd-45d2-b0fe-0d032ce25295`,
        () =>
            HttpResponse.json({
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

    oppdater: http.put(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/oppdater`, () => HttpResponse.json({})),
    sendInn: http.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/send`, () =>
        HttpResponse.json(
            {
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
            },
            { status: 202 },
        ),
    ),

    valider: http.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/valider`, () =>
        HttpResponse.json(
            {
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
            },
            { status: 202 },
        ),
    ),

    validerFeil: http.post(`${LOCAL_API_URL}/omsorgspenger-midlertidig-alene-soknad/valider`, () =>
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

export default handlers;
