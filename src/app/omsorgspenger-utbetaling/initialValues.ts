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
    journalposter: soknad?.journalposter || [],
    klokkeslett: soknad?.klokkeslett || '',
    opptjeningAktivitet: {
        selvstendigNaeringsdrivende: {
            virksomhetNavn: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende.virksomhetNavn || '',
            organisasjonsnummer: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende.virksomhetNavn || '',
            info: {
                periode: {
                    fom: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.periode?.fom || '',
                    tom: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.periode?.tom || '',
                },
                virksomhetstyper: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.virksomhetstyper
                    ?.length
                    ? soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.virksomhetstyper
                    : [],
                landkode: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.landkode || '',
                regnskapsførerNavn:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn || '',
                regnskapsførerTlf:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn || '',
                harSøkerRegnskapsfører:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.harSøkerRegnskapsfører || false,
                registrertIUtlandet:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.registrertIUtlandet || false,
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
