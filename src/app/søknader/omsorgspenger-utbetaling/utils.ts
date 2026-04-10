import { omit } from 'lodash';

import Fagsak from 'app/types/Fagsak';

import { aktivitetsFravær } from './konstanter';
import {
    Arbeidsforhold,
    Arbeidstaker,
    Frilanser,
    IOMPUTBackendOpptjeningAktivitet,
    IOMPUTSoknad,
    IOMPUTSoknadBackend,
    IOpptjeningAktivitet,
    SelvstendigNaeringsdrivende,
} from './types/OMPUTSoknad';

const tomFrilanser = (): Frilanser => ({
    startdato: '',
    sluttdato: '',
    jobberFortsattSomFrilans: false,
    fravaersperioder: [],
});

const tomSelvstendigNaeringsdrivende = (): SelvstendigNaeringsdrivende => ({
    virksomhetNavn: '',
    organisasjonsnummer: '',
    info: {
        periode: {
            fom: '',
            tom: '',
        },
        virksomhetstyper: '',
        erFiskerPåBladB: false,
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
    fravaersperioder: [],
});

const tomArbeidsforhold = (): Arbeidsforhold => ({
    arbeidstaker: false,
    selvstendigNaeringsdrivende: false,
    frilanser: false,
});

export const frontendTilBackendMapping = (soknad: Partial<IOMPUTSoknad>): Partial<IOMPUTSoknadBackend> => {
    const harValgtFrilanser = soknad.metadata?.arbeidsforhold.frilanser;
    const harValgtArbeidstaker = soknad.metadata?.arbeidsforhold.arbeidstaker;
    const harValgtSelvstendigNaeringsdrivende = soknad.metadata?.arbeidsforhold.selvstendigNaeringsdrivende;
    const frilanser = soknad?.opptjeningAktivitet?.frilanser;
    const selvstendigNaeringsdrivende = soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende;
    const arbeidstaker = soknad?.opptjeningAktivitet?.arbeidstaker;
    const fraevaersperioderSelvstendigNaeringsdrivende =
        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.fravaersperioder || [];
    const fravaersperioderSNMappet = fraevaersperioderSelvstendigNaeringsdrivende.map((fravaersperiode) => ({
        ...fravaersperiode,
        organisasjonsnummer: selvstendigNaeringsdrivende?.organisasjonsnummer || '',
    }));
    const fravaersperioderFrilanser = frilanser?.fravaersperioder || [];
    const fravaersperioderArbeidstaker =
        arbeidstaker
            ?.map((at) =>
                at.fravaersperioder.map((fravaersperiode) => ({
                    ...fravaersperiode,
                    organisasjonsnummer: at.organisasjonsnummer || '',
                })),
            )
            ?.flat() || [];

    const fravaersperioderMappet = [
        ...fravaersperioderArbeidstaker,
        ...fravaersperioderSNMappet,
        ...fravaersperioderFrilanser,
    ];
    const opptjeningAktivitetUtenFravaersperioder: IOMPUTBackendOpptjeningAktivitet = {};

    if (harValgtArbeidstaker && arbeidstaker) {
        opptjeningAktivitetUtenFravaersperioder.arbeidstaker = arbeidstaker.map((at) =>
            omit(at, ['fravaersperioder']),
        );
    }

    if (harValgtFrilanser && frilanser && Object.keys(frilanser).length) {
        opptjeningAktivitetUtenFravaersperioder.frilanser = omit(frilanser, ['fravaersperioder']);
    }

    if (
        harValgtSelvstendigNaeringsdrivende &&
        selvstendigNaeringsdrivende &&
        Object.keys(selvstendigNaeringsdrivende).length
    ) {
        opptjeningAktivitetUtenFravaersperioder.selvstendigNaeringsdrivende = {
            ...omit(selvstendigNaeringsdrivende, 'fravaersperioder'),
            info: {
                ...selvstendigNaeringsdrivende.info,
                virksomhetstyper: selvstendigNaeringsdrivende.info.virksomhetstyper.length
                    ? [selvstendigNaeringsdrivende.info.virksomhetstyper]
                    : [],
            },
        };
    }

    return {
        ...soknad,
        opptjeningAktivitet: Object.keys(opptjeningAktivitetUtenFravaersperioder).length
            ? opptjeningAktivitetUtenFravaersperioder
            : undefined,
        barn: soknad.barn?.map((barn) => ({ foedselsdato: barn.foedselsdato, norskIdent: barn.norskIdent })),
        fravaersperioder: fravaersperioderMappet,
        bosteder: !soknad.erKorrigering ? soknad.bosteder : undefined,
        utenlandsopphold: !soknad.erKorrigering ? soknad.utenlandsopphold : undefined,
    };
};

export const backendTilFrontendMapping = (soknad: IOMPUTSoknadBackend, fagsak?: Fagsak): Partial<IOMPUTSoknad> => {
    const fraevaersperioderSelvstendigNaeringsdrivende =
        soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE,
    ) || [];
    const fravaersperioderFrilanser =
        soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.FRILANSER,
    ) || [];
    const fravaersperioderArbeidstaker =
        soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.ARBEIDSTAKER,
    ) || [];

    const korrigeringArbeidstaker = fravaersperioderArbeidstaker.reduce<Arbeidstaker[]>((arbeidstakere, fravaersperiode) => {
        const index = arbeidstakere.findIndex(
            (arbeidstaker: Arbeidstaker) => arbeidstaker.organisasjonsnummer === fravaersperiode.organisasjonsnummer,
        );
        if (index !== -1) {
            arbeidstakere[index].fravaersperioder.push(fravaersperiode);
            return arbeidstakere;
        }

        arbeidstakere.push({
            organisasjonsnummer: fravaersperiode.organisasjonsnummer,
            fravaersperioder: [fravaersperiode],
        });
        return arbeidstakere;
    }, []);

    const arbeidstaker =
        soknad.opptjeningAktivitet?.arbeidstaker?.map((at) => ({
            ...at,
            fravaersperioder: fravaersperioderArbeidstaker.filter(
                (fravaersperiode) => fravaersperiode.organisasjonsnummer === at.organisasjonsnummer,
            ),
        })) || korrigeringArbeidstaker;

    const tomSN = tomSelvstendigNaeringsdrivende();
    const selvstendigNaeringsdrivende = {
        ...tomSN,
        ...soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende,
        info: {
            ...tomSN.info,
            ...soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info,
            virksomhetstyper: soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.virksomhetstyper?.[0] || '',
        },
        fravaersperioder: fraevaersperioderSelvstendigNaeringsdrivende,
    };
    const frilanser = {
        ...tomFrilanser(),
        ...soknad.opptjeningAktivitet?.frilanser,
        fravaersperioder: fravaersperioderFrilanser,
    };
    return {
        ...omit(soknad, 'fravaersperioder'),
        metadata: {
            arbeidsforhold: {
                ...tomArbeidsforhold(),
                ...soknad.metadata?.arbeidsforhold,
            },
            medlemskap: soknad.metadata?.medlemskap || '',
            utenlandsopphold: soknad.metadata?.utenlandsopphold || '',
            signatur: soknad.metadata?.signatur || '',
            harSoekerDekketOmsorgsdager: soknad.metadata?.harSoekerDekketOmsorgsdager || '',
            eksisterendeFagsak: fagsak || soknad.metadata?.eksisterendeFagsak,
        },
        opptjeningAktivitet: {
            selvstendigNaeringsdrivende,
            frilanser,
            arbeidstaker,
        },
    };
};

export const filtrerVerdierFoerInnsending = (soknad: IOMPUTSoknad): IOMPUTSoknad => {
    const { opptjeningAktivitet } = soknad;
    const { arbeidsforhold } = soknad.metadata;
    const filtrertOpptjeningAktivitet: IOpptjeningAktivitet = {
        arbeidstaker: arbeidsforhold.arbeidstaker ? opptjeningAktivitet.arbeidstaker : [],
        selvstendigNaeringsdrivende: arbeidsforhold.selvstendigNaeringsdrivende
            ? opptjeningAktivitet.selvstendigNaeringsdrivende
            : tomSelvstendigNaeringsdrivende(),
        frilanser: arbeidsforhold.frilanser ? opptjeningAktivitet.frilanser : tomFrilanser(),
    };

    return { ...soknad, opptjeningAktivitet: filtrertOpptjeningAktivitet };
};

export const korrigeringFilter = (soknad: Partial<IOMPUTSoknadBackend>): Partial<IOMPUTSoknadBackend> => ({
    ...soknad,
    opptjeningAktivitet: {
        ...soknad.opptjeningAktivitet,
        selvstendigNaeringsdrivende: {
            organisasjonsnummer: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.organisasjonsnummer || '',
            info: {
                registrertIUtlandet:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.registrertIUtlandet || false,
                landkode: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.landkode || '',
                periode: soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.periode || {
                    fom: '',
                    tom: '',
                },
                virksomhetstyper:
                    soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.virksomhetstyper || [],
            },
        },
    },
});
