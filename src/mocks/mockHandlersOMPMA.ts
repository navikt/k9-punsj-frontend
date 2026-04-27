import { HttpResponse, http } from 'msw';
import { ApiPath } from 'app/apiConfig';

const mockHandlersOMPMA = {
    tomMappe: http.get(ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '17420373147',
            fagsakTypeKode: 'OMP_MA',
            søknader: [],
        }),
    ),

    mappeMedSøknad: http.get(ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '17420373147',
            fagsakTypeKode: 'OMP_MA',
            søknader: [
                {
                    soeknadId: 'db054295-f1bd-45d2-b0fe-0d032ce25295',
                    soekerId: '17420373147',
                    mottattDato: '2020-10-12',
                    klokkeslett: '12:53',
                    barn: [
                        {
                            norskIdent: '24420167209',
                            foedselsdato: null,
                        },
                        {
                            norskIdent: '18410162721',
                            foedselsdato: null,
                        },
                        {
                            norskIdent: '24420167209',
                            foedselsdato: null,
                        },
                    ],
                    annenForelder: {
                        norskIdent: '24420167209',
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

    nySoeknad: http.post(ApiPath.OMP_MA_SOKNAD_CREATE, () =>
        HttpResponse.json(
            {
                soeknadId: 'db054295-f1bd-45d2-b0fe-0d032ce25295',
                soekerId: '17420373147',
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

    soknad: http.get(ApiPath.OMP_MA_SOKNAD_GET.replace('{id}', 'db054295-f1bd-45d2-b0fe-0d032ce25295'), () =>
        HttpResponse.json({
            soeknadId: 'db054295-f1bd-45d2-b0fe-0d032ce25295',
            soekerId: '17420373147',
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

    oppdater: http.put(ApiPath.OMP_MA_SOKNAD_UPDATE, () => HttpResponse.json({})),
    sendInn: http.post(ApiPath.OMP_MA_SOKNAD_SUBMIT, () =>
        HttpResponse.json(
            {
                søknadId: '78415bd0-dd83-471d-b9e1-018b57cfdc10',
                versjon: '1.0.0',
                mottattDato: '2020-10-12T10:53:00.000Z',
                søker: {
                    norskIdentitetsnummer: '17420373147',
                },
                ytelse: {
                    type: 'OMP_UTV_MA',
                    barn: [
                        {
                            norskIdentitetsnummer: '24420167209',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '18410162721',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '24420167209',
                            fødselsdato: null,
                        },
                    ],
                    annenForelder: {
                        norskIdentitetsnummer: '24420167209',
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

    valider: http.post(ApiPath.OMP_MA_SOKNAD_VALIDER, () =>
        HttpResponse.json(
            {
                søknadId: '78415bd0-dd83-471d-b9e1-018b57cfdc10',
                versjon: '1.0.0',
                mottattDato: '2020-10-12T10:53:00.000Z',
                søker: {
                    norskIdentitetsnummer: '17420373147',
                },
                ytelse: {
                    type: 'OMP_UTV_MA',
                    barn: [
                        {
                            norskIdentitetsnummer: '24420167209',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '18410162721',
                            fødselsdato: null,
                        },
                        {
                            norskIdentitetsnummer: '24420167209',
                            fødselsdato: null,
                        },
                    ],
                    annenForelder: {
                        norskIdentitetsnummer: '24420167209',
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

    validerFeil: http.post(ApiPath.OMP_MA_SOKNAD_VALIDER, () =>
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

export default mockHandlersOMPMA;
