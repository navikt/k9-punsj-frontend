import { aktivitetsFravær } from './konstanter';
import { FravaersperiodeType, IOMPUTSoknad } from './types/OMPUTSoknad';

export const periodeInitialValue = {
    fom: '',
    tom: '',
};

export const utenlandsoppholdInitialValue = {
    periode: periodeInitialValue,
    land: '',
};

export const fravaersperiodeInitialValue = {
    aktivitetsFravær: '',
    organisasjonsnummer: '',
    fraværÅrsak: '',
    søknadÅrsak: '',
    periode: periodeInitialValue,
    faktiskTidPrDag: '',
    normalArbeidstidPrDag: '',
};

export const arbeidstakerInitialValue = {
    organisasjonsnummer: '',
    fravaersperioder: [{ ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.ARBEIDSTAKER }],
};

const mapFravaersperiode = (periode: FravaersperiodeType): FravaersperiodeType => ({
    aktivitetsFravær: periode.aktivitetsFravær || '',
    faktiskTidPrDag: periode.faktiskTidPrDag || '',
    normalArbeidstidPrDag: periode.normalArbeidstidPrDag || '',
    fraværÅrsak: periode.fraværÅrsak || '',
    organisasjonsnummer: periode.organisasjonsnummer || '',
    periode: {
        fom: periode.periode.fom || '',
        tom: periode.periode.tom || '',
    },
    søknadÅrsak: periode.søknadÅrsak || '',
});

export const initialValues = (soknad: Partial<IOMPUTSoknad> | undefined): IOMPUTSoknad => {
    if (!soknad?.journalposter?.length) {
        throw Error('Mangler journalpost');
    }
    return {
        metadata: {
            arbeidsforhold: {
                arbeidstaker: false,
                selvstendigNaeringsdrivende: false,
                frilanser: false,
                ...soknad?.metadata?.arbeidsforhold,
            },
            medlemskap: soknad?.metadata?.medlemskap || '',
            utenlandsopphold: soknad?.metadata?.utenlandsopphold || '',
            signatur: soknad?.metadata?.signatur || '',
            eksisterendeFagsak: soknad?.metadata?.eksisterendeFagsak || undefined,
            harSoekerDekketOmsorgsdager: soknad?.metadata?.harSoekerDekketOmsorgsdager || '',
        },
        barn: soknad?.barn || [],
        soeknadId: soknad?.soeknadId || '',
        soekerId: soknad?.soekerId || '',
        mottattDato: soknad?.mottattDato || '',
        journalposter: soknad?.journalposter,
        klokkeslett: soknad?.klokkeslett || '',
        erKorrigering: soknad?.erKorrigering || false,
        opptjeningAktivitet: {
            selvstendigNaeringsdrivende: {
                virksomhetNavn: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.virksomhetNavn || '',
                organisasjonsnummer:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.organisasjonsnummer || '',
                info: {
                    periode: {
                        fom: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.periode?.fom || '',
                        tom: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.periode?.tom || '',
                    },
                    virksomhetstyper:
                        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.virksomhetstyper || '',
                    erFiskerPåBladB:
                        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.erFiskerPåBladB || false,
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
                    erNyoppstartet:
                        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.erNyoppstartet || false,
                    erVarigEndring:
                        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.erVarigEndring || false,
                    endringInntekt:
                        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.endringInntekt || '',
                    endringDato: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.endringDato || '',
                    endringBegrunnelse:
                        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.endringBegrunnelse || '',
                },
                fravaersperioder: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.fravaersperioder?.length
                    ? soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.fravaersperioder.map(mapFravaersperiode)
                    : [
                          {
                              ...fravaersperiodeInitialValue,
                              aktivitetsFravær: aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE,
                          },
                      ],
            },
            frilanser: {
                startdato: soknad?.opptjeningAktivitet?.frilanser?.startdato || '',
                sluttdato: soknad?.opptjeningAktivitet?.frilanser?.sluttdato || '',
                jobberFortsattSomFrilans: soknad?.opptjeningAktivitet?.frilanser?.jobberFortsattSomFrilans || false,
                fravaersperioder: soknad?.opptjeningAktivitet?.frilanser?.fravaersperioder?.length
                    ? soknad?.opptjeningAktivitet?.frilanser?.fravaersperioder.map(mapFravaersperiode)
                    : [{ ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.FRILANSER }],
            },
            arbeidstaker: soknad?.opptjeningAktivitet?.arbeidstaker?.length
                ? soknad?.opptjeningAktivitet?.arbeidstaker.map((arbeidstaker) => ({
                      organisasjonsnummer: arbeidstaker.organisasjonsnummer || '',
                      fravaersperioder: arbeidstaker?.fravaersperioder?.length
                          ? arbeidstaker.fravaersperioder.map(mapFravaersperiode)
                          : [{ ...fravaersperiodeInitialValue, aktivitetsFravær: aktivitetsFravær.ARBEIDSTAKER }],
                  }))
                : [{ ...arbeidstakerInitialValue }],
        },
        bosteder: soknad?.bosteder?.length
            ? soknad?.bosteder.map((bosted) => ({
                  land: bosted.land,
                  periode: { fom: bosted?.periode.fom || '', tom: bosted?.periode.tom || '' },
              }))
            : [],
        utenlandsopphold: soknad?.utenlandsopphold?.length
            ? soknad?.utenlandsopphold.map((utenlandsopphold) => ({
                  land: utenlandsopphold.land,
                  periode: { fom: utenlandsopphold?.periode.fom || '', tom: utenlandsopphold?.periode.tom || '' },
              }))
            : [],
        harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
        harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
    };
};
