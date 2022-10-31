export interface SelvstendigNaeringsdrivendeAktivitet {
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

export interface FrilanserAktivitet {
    startdato: number[] | null;
    sluttdato: number[] | null;
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
