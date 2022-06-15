import { aktivitetsFravær } from './konstanter';
import { IOMPUTSoknad } from './types/OMPUTSoknad';

export const periodeInitialValue = {
    fom: '',
    tom: '',
};

export const fravaersperiodeInitialValue = {
    aktivitetsFravær: '',
    organisasjonsnummer: '',
    fraværÅrsak: '',
    søknadÅrsak: '',
    periode: periodeInitialValue,
    faktiskTidPrDag: '',
};

export const arbeidstakerInitialValue = {
    organisasjonsnummer: '',
    fravaersperioder: [{ ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.ARBEIDSTAKER }],
};

export const initialValues = (soknad: Partial<IOMPUTSoknad> | undefined) => ({
    barn: soknad?.barn || [],
    soeknadId: soknad?.soeknadId || '',
    soekerId: soknad?.soekerId || '',
    mottattDato: soknad?.mottattDato || '',
    journalposter: soknad?.journalposter || new Set([]),
    klokkeslett: soknad?.klokkeslett || '',
    arbeidsforhold: {
        arbeidstaker: false,
        selvstendigNæringsdrivende: false,
        frilanser: false,
    },
    opptjeningAktivitet: {
        selvstendigNæringsdrivende: {
            virksomhetNavn: '',
            organisasjonsnummer: '',
            info: {
                periode: periodeInitialValue,
                virksomhetstyper: [],
                landkode: '',
                regnskapsførerNavn: '',
                regnskapsførerTlf: '',
                harSøkerRegnskapsfører: 'nei',
                registrertIUtlandet: 'nei',
                bruttoInntekt: '',
                erNyoppstartet: false,
                erVarigEndring: true,
                endringInntekt: '',
                endringDato: '',
                endringBegrunnelse: '',
            },
        },
        frilanser: {
            startdato: '',
            sluttdato: '',
            jobberFortsattSomFrilans: false,
        },
        arbeidstaker: [{ ...arbeidstakerInitialValue }],
    },
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});
