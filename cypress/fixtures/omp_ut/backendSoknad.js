export default {
    metadata: {
        arbeidsforhold: {
            arbeidstaker: true,
            selvstendigNaeringsdrivende: true,
            frilanser: true,
        },
    },
    barn: [
        {
            foedselsdato: null,
            norskIdent: '02021477330',
        },
        {
            foedselsdato: null,
            norskIdent: '03091477490',
        },
        {
            foedselsdato: null,
            norskIdent: '09081478047',
        },
    ],
    soeknadId: 'afac9218-acce-4d82-808b-6c76467d28e4',
    soekerId: '29099000129',
    mottattDato: '2020-10-12',
    journalposter: ['201'],
    klokkeslett: '12:53',
    opptjeningAktivitet: {
        arbeidstaker: [
            {
                organisasjonsnummer: '979312059',
            },
        ],
        frilanser: {
            startdato: '2015-06-02',
            sluttdato: '',
            jobberFortsattSomFrilans: true,
        },
        selvstendigNaeringsdrivende: {
            virksomhetNavn: 'Bobs burger',
            organisasjonsnummer: '979312059',
            info: {
                periode: {
                    fom: '2022-06-01',
                    tom: '2022-06-23',
                },
                virksomhetstyper: ['Fiske'],
                landkode: '',
                regnskapsførerNavn: 'hallo hansen',
                regnskapsførerTlf: '93247666',
                harSøkerRegnskapsfører: false,
                registrertIUtlandet: false,
                bruttoInntekt: 100000,
                erNyoppstartet: false,
                erVarigEndring: false,
                endringInntekt: '',
                endringDato: '',
                endringBegrunnelse: '',
            },
        },
    },
    harInfoSomIkkeKanPunsjes: true,
    harMedisinskeOpplysninger: true,
    fravaersperioder: [
        {
            aktivitetsFravær: 'ARBEIDSTAKER',
            faktiskTidPrDag: '7,5',
            fraværÅrsak: 'ORDINÆRT_FRAVÆR',
            organisasjonsnummer: '979312059',
            periode: {
                fom: '2022-06-01',
                tom: '2022-06-23',
            },
            søknadÅrsak: 'NYOPPSTARTET_HOS_ARBEIDSGIVER',
        },
        {
            aktivitetsFravær: 'SELVSTENDIG_VIRKSOMHET',
            faktiskTidPrDag: '1',
            fraværÅrsak: 'STENGT_SKOLE_ELLER_BARNEHAGE',
            organisasjonsnummer: '',
            periode: {
                fom: '2022-06-06',
                tom: '2022-06-16',
            },
            søknadÅrsak: 'ARBEIDSGIVER_KONKURS',
        },
        {
            aktivitetsFravær: 'FRILANSER',
            faktiskTidPrDag: '2',
            fraværÅrsak: 'SMITTEVERNHENSYN',
            organisasjonsnummer: '',
            periode: {
                fom: '2022-06-01',
                tom: '2022-06-23',
            },
            søknadÅrsak: 'KONFLIKT_MED_ARBEIDSGIVER',
        },
    ],
};
