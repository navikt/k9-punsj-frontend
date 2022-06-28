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
            virksomhetNavn: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.virksomhetNavn || '',
            organisasjonsnummer: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.organisasjonsnummer || '',
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
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.regnskapsførerTlf || '',
                harSøkerRegnskapsfører:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.harSøkerRegnskapsfører || false,
                registrertIUtlandet:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.registrertIUtlandet || false,
                bruttoInntekt: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.bruttoInntekt || '',
                erNyoppstartet: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.erNyoppstartet || false,
                erVarigEndring: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.erVarigEndring || false,
                endringInntekt: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.endringInntekt || '',
                endringDato: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.endringDato || '',
                endringBegrunnelse:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.endringBegrunnelse || '',
            },
            fravaersperioder: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.fravaersperioder?.length
                ? soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.fravaersperioder
                : [{ ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE }],
        },
        frilanser: {
            startdato: soknad?.opptjeningAktivitet?.frilanser?.startdato || '',
            sluttdato: soknad?.opptjeningAktivitet?.frilanser?.sluttdato || '',
            jobberFortsattSomFrilans: soknad?.opptjeningAktivitet?.frilanser?.jobberFortsattSomFrilans || false,
            fravaersperioder: soknad?.opptjeningAktivitet?.frilanser?.fravaersperioder?.length
                ? soknad?.opptjeningAktivitet?.frilanser?.fravaersperioder
                : [{ ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.FRILANSER }],
        },
        arbeidstaker: soknad?.opptjeningAktivitet?.arbeidstaker?.length
            ? soknad?.opptjeningAktivitet?.arbeidstaker
            : [{ ...arbeidstakerInitialValue }],
    },
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});
