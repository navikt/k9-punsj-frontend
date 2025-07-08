import { HttpResponse, http } from 'msw';
import { ApiPath } from 'app/apiConfig';

const mockHandlersOMPKS = {
    tomMappe: http.get(ApiPath.OMP_KS_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'OMP_AO',
            søknader: [],
        }),
    ),

    mappeMedSøknad: http.get(ApiPath.OMP_KS_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'OMP_AO',
            søknader: [
                {
                    søker: '29099000129',
                    fagsakTypeKode: 'OMP_KS',
                    søknader: [
                        {
                            soeknadId: 'ea35427a-066d-4f30-9602-e8aa99e2e76c',
                            soekerId: '29099000129',
                            mottattDato: '2025-06-19',
                            klokkeslett: '10:23',
                            barn: {
                                norskIdent: '19470981051',
                                foedselsdato: null,
                            },
                            journalposter: ['453997738'],
                            harInfoSomIkkeKanPunsjes: false,
                            harMedisinskeOpplysninger: true,
                            metadata: null,
                            k9saksnummer: '1001ASQ',
                        },
                        {
                            soeknadId: 'c65ca07d-3198-4c57-9301-1824040b7fc2',
                            soekerId: '29099000129',
                            mottattDato: '2025-06-19',
                            klokkeslett: '10:24',
                            barn: {
                                norskIdent: '19470981051',
                                foedselsdato: null,
                            },
                            journalposter: ['453997739'],
                            harInfoSomIkkeKanPunsjes: false,
                            harMedisinskeOpplysninger: false,
                            metadata: null,
                            k9saksnummer: '1001ASQ',
                        },
                    ],
                },
            ],
        }),
    ),

    nySoeknad: http.post(ApiPath.OMP_KS_SOKNAD_CREATE, () =>
        HttpResponse.json(
            {
                soeknadId: '067d9abe-c5e4-4cb8-8491-6f0f67fbef61',
                soekerId: '29099000129',
                mottattDato: '2025-07-08',
                klokkeslett: '11:11',
                barn: {
                    norskIdent: '19470981051',
                    foedselsdato: null,
                },
                journalposter: ['454001113'],
                harInfoSomIkkeKanPunsjes: false,
                harMedisinskeOpplysninger: false,
                metadata: null,
                k9saksnummer: '1001ASQ',
            },
            { status: 201 },
        ),
    ),

    soknad: http.get(ApiPath.OMP_KS_SOKNAD_GET.replace('{id}', '067d9abe-c5e4-4cb8-8491-6f0f67fbef61'), () =>
        HttpResponse.json({
            soeknadId: '067d9abe-c5e4-4cb8-8491-6f0f67fbef61',
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

    oppdater: http.put(ApiPath.OMP_KS_SOKNAD_UPDATE, () => HttpResponse.json({})),
    sendInn: http.post(ApiPath.OMP_KS_SOKNAD_SUBMIT, () =>
        HttpResponse.json(
            {
                søknadId: '067d9abe-c5e4-4cb8-8491-6f0f67fbef61',
                versjon: '1.0.0',
                mottattDato: '2025-07-08T09:11:00.000Z',
                søker: {
                    norskIdentitetsnummer: '12497105038',
                },
                språk: 'nb',
                ytelse: {
                    type: 'OMP_UTV_KS',
                    barn: {
                        norskIdentitetsnummer: '19470981051',
                        fødselsdato: null,
                    },
                    kroniskEllerFunksjonshemming: true,
                    høyereRisikoForFravær: null,
                    høyereRisikoForFraværBeskrivelse: null,
                    dataBruktTilUtledning: null,
                },
                journalposter: [
                    {
                        inneholderInfomasjonSomIkkeKanPunsjes: null,
                        inneholderInformasjonSomIkkeKanPunsjes: true,
                        inneholderMedisinskeOpplysninger: true,
                        journalpostId: '454001113',
                    },
                ],
                begrunnelseForInnsending: {
                    tekst: null,
                },
                kildesystem: 'punsj',
            },
            { status: 202 },
        ),
    ),

    valider: http.post(ApiPath.OMP_KS_SOKNAD_VALIDER, () =>
        HttpResponse.json(
            {
                søknadId: '067d9abe-c5e4-4cb8-8491-6f0f67fbef61',
                versjon: '1.0.0',
                mottattDato: '2025-07-08T09:11:00.000Z',
                søker: {
                    norskIdentitetsnummer: '12497105038',
                },
                språk: 'nb',
                ytelse: {
                    type: 'OMP_UTV_KS',
                    barn: {
                        norskIdentitetsnummer: '19470981051',
                        fødselsdato: null,
                    },
                    kroniskEllerFunksjonshemming: true,
                    høyereRisikoForFravær: null,
                    høyereRisikoForFraværBeskrivelse: null,
                    dataBruktTilUtledning: null,
                },
                journalposter: [
                    {
                        inneholderInfomasjonSomIkkeKanPunsjes: null,
                        inneholderInformasjonSomIkkeKanPunsjes: true,
                        inneholderMedisinskeOpplysninger: true,
                        journalpostId: '454001113',
                    },
                ],
                begrunnelseForInnsending: {
                    tekst: null,
                },
                kildesystem: 'punsj',
            },
            { status: 202 },
        ),
    ),

    validerFeil: http.post(ApiPath.OMP_KS_SOKNAD_VALIDER, () =>
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

export default mockHandlersOMPKS;
