import { rest } from 'msw';
import { ApiPath } from 'app/apiConfig';
import { BACKEND_BASE_URL, LOCAL_API_URL } from './konstanter';

const omsorgspengerutbetalingHandlers = {
    tomMappe: rest.get(`${LOCAL_API_URL}/omsorgspengerutbetaling-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'OMP',
                søknader: [],
            })
        )
    ),
    mappeMedSøknad: rest.get(`${LOCAL_API_URL}/omsorgspengerutbetaling-soknad/mappe`, (req, res, ctx) =>
        res(
            ctx.json({
                søker: '29099000129',
                fagsakTypeKode: 'OMP',
                søknader: [
                    {
                        soeknadId: '4e177e4d-922d-4205-a3e9-d3278da2abf7',
                        soekerId: '29099000129',
                        mottattDato: '10.03.2022',
                        klokkeslett: null,
                        barn: [],
                        journalposter: ['201'],
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
            })
        )
    ),
};

export default omsorgspengerutbetalingHandlers;
