import { HttpResponse, http } from 'msw';
import { ApiPath } from 'app/apiConfig';

const mockHandlersOMPAO = {
    tomMappe: http.get(ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: '29099000129',
            fagsakTypeKode: 'OMP_AO',
            søknader: [],
        }),
    ),

    mappeMedSøknad: http.get(ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
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

    nySoeknad: http.post(ApiPath.OMP_AO_SOKNAD_CREATE, () =>
        HttpResponse.json(
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
                periode: null,
                begrunnelseForInnsending: null,
                harInfoSomIkkeKanPunsjes: null,
                harMedisinskeOpplysninger: null,
                metadata: null,
            },
            { status: 201 },
        ),
    ),

    soknad: http.get(ApiPath.OMP_AO_SOKNAD_GET.replace('{id}', '9356c863-ab88-41eb-89ec-3ca8cd555537'), () =>
        HttpResponse.json({
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

    oppdater: http.put(ApiPath.OMP_AO_SOKNAD_UPDATE, () => HttpResponse.json({})),
    sendInn: http.post(ApiPath.OMP_AO_SOKNAD_SUBMIT, () =>
        HttpResponse.json(
            {
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
            },
            { status: 202 },
        ),
    ),

    valider: http.post(ApiPath.OMP_AO_SOKNAD_VALIDER, () =>
        HttpResponse.json(
            {
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
            },
            { status: 202 },
        ),
    ),

    validerFeil: http.post(ApiPath.OMP_AO_SOKNAD_VALIDER, () =>
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

export default mockHandlersOMPAO;
