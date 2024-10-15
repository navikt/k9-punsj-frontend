import BegrunnelseForInnsending from '../../../models/types/BegrunnelseForInnsending';

export interface IPLSSoknadKvitteringBosteder {
    [key: string]: { land: string };
}

export interface IPLSSoknadKvitteringUtenlandsopphold {
    [key: string]: {
        land: string;
        årsak?: null | string;
    };
}

export interface IPLSSoknadKvitteringBeredskapNattevak {
    [key: string]: { tilleggsinformasjon: string };
}

export interface IPLSSoknadKvitteringTilsynsordning {
    [key: string]: { etablertTilsynTimerPerDag: string };
}

export interface IPLSSoknadKvitteringLovbestemtFerie {
    [key: string]: { skalHaFerie: string };
}

export interface IPLSSoknadKvitteringArbeidstidInfo {
    [key: string]: {
        jobberNormaltTimerPerDag: string;
        faktiskArbeidTimerPerDag: string;
    };
}

export interface IPLSSoknadKvitteringArbeidstid {
    arbeidstakerList: {
        norskIdentitetsnummer: null | string;
        organisasjonsnummer: null | string;
        arbeidstidInfo: { perioder: IPLSSoknadKvitteringArbeidstidInfo };
    }[];
    frilanserArbeidstidInfo: null | {
        perioder: IPLSSoknadKvitteringArbeidstidInfo;
    };
    selvstendigNæringsdrivendeArbeidstidInfo: null | {
        perioder: IPLSSoknadKvitteringArbeidstidInfo;
    };
}

export interface IPLSSoknadKvitteringSelvstendigNaeringsdrivendePeriode {
    perioder: {
        [key: string]: {
            virksomhetstyper: string[];
            regnskapsførerNavn: string;
            regnskapsførerTlf: string;
            erVarigEndring: boolean;
            endringDato: string;
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

export interface IPLSSoknadKvitteringFrilanser {
    startdato: string | null;
    sluttdato: string | null;
    jobberFortsattSomFrilans: boolean;
}

export interface IPLSSoknadKvitteringJournalpost {
    inneholderInformasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}

export interface IPLSSoknadKvittering {
    mottattDato: string;
    journalposter: IPLSSoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
        søknadsperiode: string[];
        pleietrengende: {
            norskIdentitetsnummer: string;
        };
        arbeidstid: IPLSSoknadKvitteringArbeidstid;
        opptjeningAktivitet: {
            selvstendigNæringsdrivende?: IPLSSoknadKvitteringSelvstendigNaeringsdrivendePeriode[];
            frilanser?: IPLSSoknadKvitteringFrilanser;
        };
        lovbestemtFerie: { perioder: IPLSSoknadKvitteringLovbestemtFerie };
        bosteder: { perioder: IPLSSoknadKvitteringBosteder };
        utenlandsopphold: { perioder: IPLSSoknadKvitteringUtenlandsopphold };
        trekkKravPerioder: string[];
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
