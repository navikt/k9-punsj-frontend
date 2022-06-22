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
    metadata: {
        arbeidsforhold: {
            arbeidstaker: false,
            selvstendigNaeringsdrivende: false,
            frilanser: false,
            ...soknad?.metadata?.arbeidsforhold,
        },
    },
    barn: soknad?.barn || [],
    soeknadId: soknad?.soeknadId || '',
    soekerId: soknad?.soekerId || '',
    mottattDato: soknad?.mottattDato || '',
    journalposter: soknad?.journalposter || new Set([]),
    klokkeslett: soknad?.klokkeslett || '',
    opptjeningAktivitet: {
        selvstendigNaeringsdrivende: {
            virksomhetNavn: '',
            organisasjonsnummer: '',
            info: {
                periode: periodeInitialValue,
                virksomhetstyper: [],
                landkode: '',
                regnskapsførerNavn: '',
                regnskapsførerTlf: '',
                harSøkerRegnskapsfører: false,
                registrertIUtlandet: false,
                bruttoInntekt: '',
                erNyoppstartet: false,
                erVarigEndring: false,
                endringInntekt: '',
                endringDato: '',
                endringBegrunnelse: '',
            },
            fravaersperioder: [
                { ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE },
            ],
        },
        frilanser: {
            startdato: '',
            sluttdato: '',
            jobberFortsattSomFrilans: false,
            fravaersperioder: [{ ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.FRILANSER }],
        },
        arbeidstaker: [{ ...arbeidstakerInitialValue }],
    },
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});
