export interface SelvstendigNaeringsdrivendeAktivitet {
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

export interface FrilanserAktivitet {
    startdato: string | null;
    sluttdato: string | null;
    jobberFortsattSomFrilans: boolean;
}

export interface Fravaersperiode {
    aktivitetFravær: string[];
    arbeidsforholdId?: string;
    arbeidsgiverOrgNr?: string;
    duration: string;
    delvisFravær: {
        fravær: string;
        normalarbeidstid: string;
    };
    periode: string;
    søknadÅrsak: string;
    årsak: string;
}

export interface ISoknadKvitteringBosteder {
    [key: string]: { land: string };
}

export interface ISoknadKvitteringUtenlandsopphold {
    [key: string]: {
        land: string;
        årsak?: null | string;
    };
}

export interface ISoknadKvitteringLovbestemtFerie {
    [key: string]: { skalHaFerie: string };
}

export interface ISoknadKvitteringArbeidstidInfo {
    [key: string]: {
        jobberNormaltTimerPerDag: string;
        faktiskArbeidTimerPerDag: string;
    };
}

export interface ISoknadKvitteringArbeidstid {
    arbeidstakerList: {
        norskIdentitetsnummer: null | string;
        organisasjonsnummer: null | string;
        arbeidstidInfo: { perioder: ISoknadKvitteringArbeidstidInfo };
    }[];
    frilanserArbeidstidInfo: null | {
        perioder: ISoknadKvitteringArbeidstidInfo;
    };
    selvstendigNæringsdrivendeArbeidstidInfo: null | {
        perioder: ISoknadKvitteringArbeidstidInfo;
    };
}

export interface ISoknadKvitteringJournalpost {
    inneholderInformasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}
