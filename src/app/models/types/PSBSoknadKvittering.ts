import BegrunnelseForInnsending from './BegrunnelseForInnsending';
import { FrilanserAktivitet, SelvstendigNaeringsdrivendeAktivitet } from './KvitteringTyper';

export interface IPSBSoknadKvitteringBosteder {
    [key: string]: { land: string };
}

export interface IPSBSoknadKvitteringUtenlandsopphold {
    [key: string]: {
        land: string;
        årsak?: null | string;
    };
}

export interface IPSBSoknadKvitteringBeredskapNattevak {
    [key: string]: { tilleggsinformasjon: string };
}

export interface IPSBSoknadKvitteringTilsynsordning {
    [key: string]: { etablertTilsynTimerPerDag: string };
}

export interface IPSBSoknadKvitteringLovbestemtFerie {
    [key: string]: { skalHaFerie: string };
}

export interface IPSBSoknadKvitteringOmsorg {
    relasjonTilBarnet: null | string;
    beskrivelseAvOmsorgsrollen: null | string;
}

export interface IPSBSoknadKvitteringUttak {
    [key: string]: { timerPleieAvBarnetPerDag: string };
}

export interface IPSBSoknadKvitteringArbeidstidInfo {
    [key: string]: {
        jobberNormaltTimerPerDag: string;
        faktiskArbeidTimerPerDag: string;
    };
}

export interface IPSBSoknadKvitteringArbeidstid {
    arbeidstakerList: {
        norskIdentitetsnummer: null | string;
        organisasjonsnummer: null | string;
        arbeidstidInfo: { perioder: IPSBSoknadKvitteringArbeidstidInfo };
    }[];
    frilanserArbeidstidInfo: null | {
        perioder: IPSBSoknadKvitteringArbeidstidInfo;
    };
    selvstendigNæringsdrivendeArbeidstidInfo: null | {
        perioder: IPSBSoknadKvitteringArbeidstidInfo;
    };
}

export interface IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode {
    perioder: {
        [key: string]: {
            virksomhetstyper: string[];
            regnskapsførerNavn: string;
            regnskapsførerTlf: string;
            erVarigEndring: boolean;
            endringDato: number[];
            endringBegrunnelse: string;
            bruttoInntekt: number;
            erNyoppstartet: boolean;
            registrertIUtlandet: boolean;
            landkode: string | null;
        };
    };
    organisasjonsnummer: string;
    virksomhetNavn: string;
}

export interface IPSBSoknadKvitteringJournalpost {
    inneholderInformasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}

export interface IPSBSoknadKvittering {
    mottattDato: string;
    journalposter: IPSBSoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
        barn: {
            norskIdentitetsnummer: string;
            fødselsdato: string | null;
        };
        søknadsperiode: string[];
        bosteder: { perioder: IPSBSoknadKvitteringBosteder };
        utenlandsopphold: { perioder: IPSBSoknadKvitteringUtenlandsopphold };
        beredskap: { perioder: IPSBSoknadKvitteringBeredskapNattevak };
        nattevåk: { perioder: IPSBSoknadKvitteringBeredskapNattevak };
        tilsynsordning: { perioder: IPSBSoknadKvitteringTilsynsordning };
        lovbestemtFerie: { perioder: IPSBSoknadKvitteringLovbestemtFerie };
        arbeidstid: IPSBSoknadKvitteringArbeidstid;
        uttak: { perioder: IPSBSoknadKvitteringUttak };
        omsorg: IPSBSoknadKvitteringOmsorg;
        opptjeningAktivitet: {
            selvstendigNæringsdrivende?: SelvstendigNaeringsdrivendeAktivitet[];
            frilanser?: FrilanserAktivitet;
        };
        trekkKravPerioder: string[];
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
