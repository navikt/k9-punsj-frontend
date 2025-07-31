import { HttpResponse, http } from 'msw';

import { ApiPath } from 'app/apiConfig';

const mockHandlersOMPUTKorrigering = {
    nySoeknad: http.post(ApiPath.OMS_SOKNAD_CREATE, () =>
        HttpResponse.json(
            {
                soeknadId: 'f01b947c-cfa8-4c1d-9aa4-7216e7fdb58f',
                soekerId: '29099000129',
                mottattDato: '2025-07-08',
                klokkeslett: '13:21',
                barn: [],
                journalposter: ['454001398'],
                bosteder: null,
                utenlandsopphold: [],
                opptjeningAktivitet: null,
                fravaersperioder: null,
                harInfoSomIkkeKanPunsjes: null,
                harMedisinskeOpplysninger: null,
                erKorrigering: null,
                metadata: null,
                k9saksnummer: '1001F1i',
            },
            { status: 201 },
        ),
    ),

    soknad: http.get(ApiPath.OMS_SOKNAD_GET.replace('{id}', 'f01b947c-cfa8-4c1d-9aa4-7216e7fdb58f'), () =>
        HttpResponse.json({
            soeknadId: 'f01b947c-cfa8-4c1d-9aa4-7216e7fdb58f',
            soekerId: '29099000129',
            mottattDato: '2025-07-08',
            klokkeslett: '13:21',
            barn: [],
            journalposter: ['454001398'],
            bosteder: null,
            utenlandsopphold: [],
            opptjeningAktivitet: null,
            fravaersperioder: null,
            harInfoSomIkkeKanPunsjes: null,
            harMedisinskeOpplysninger: null,
            erKorrigering: null,
            metadata: null,
            k9saksnummer: '1001F1i',
        }),
    ),

    oppdater: http.put(ApiPath.OMS_SOKNAD_UPDATE, () => HttpResponse.json({})),

    sendInn: http.post(ApiPath.OMS_SOKNAD_SUBMIT, () =>
        HttpResponse.json(
            {
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
            },
            { status: 202 },
        ),
    ),

    valider: http.post(ApiPath.OMS_SOKNAD_VALIDER, () =>
        HttpResponse.json(
            {
                søknadId: 'f01b947c-cfa8-4c1d-9aa4-7216e7fdb58f',
                versjon: '1.0.0',
                mottattDato: '2025-07-01T11:41:00.000Z',
                søker: {
                    norskIdentitetsnummer: '07459304287',
                },
                språk: 'nb',
                ytelse: {
                    type: 'OMP_UT',
                    fosterbarn: null,
                    aktivitet: null,
                    fraværsperioder: null,
                    fraværsperioderKorrigeringIm: [
                        {
                            periode: '2025-07-01/2025-07-01',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-02/2025-07-02',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-03/2025-07-03',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-04/2025-07-04',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-05/2025-07-05',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-06/2025-07-06',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-07/2025-07-07',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-08/2025-07-08',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-09/2025-07-09',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                        {
                            periode: '2025-07-10/2025-07-10',
                            duration: 'PT0S',
                            delvisFravær: null,
                            årsak: null,
                            søknadÅrsak: null,
                            aktivitetFravær: ['ARBEIDSTAKER'],
                            arbeidsforholdId: null,
                            arbeidsgiverOrgNr: '967170232',
                        },
                    ],
                    bosteder: null,
                    utenlandsopphold: null,
                    dataBruktTilUtledning: null,
                },
                journalposter: [
                    {
                        inneholderInfomasjonSomIkkeKanPunsjes: null,
                        inneholderInformasjonSomIkkeKanPunsjes: false,
                        inneholderMedisinskeOpplysninger: false,
                        journalpostId: '454001398',
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
};

export default mockHandlersOMPUTKorrigering;
