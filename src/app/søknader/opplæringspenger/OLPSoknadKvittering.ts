import Kvittering from 'app/models/forms/soeknader/Kvittering';
import { ArbeidstidPeriodeMedTimer } from 'app/models/types';
import BegrunnelseForInnsending from 'app/models/types/BegrunnelseForInnsending';
import { Reise } from 'app/models/types/Kurs';
import {
    FrilanserAktivitet,
    ISoknadKvitteringBosteder,
    ISoknadKvitteringLovbestemtFerie,
    ISoknadKvitteringUtenlandsopphold,
    SelvstendigNaeringsdrivendeAktivitet,
} from 'app/models/types/KvitteringTyper';

export interface IOLPSoknadKvittering extends Kvittering {
    ytelse: {
        type: string;
        barn: Barn;
        søknadsperiode: string[];
        trekkKravPerioder: any[];
        opptjeningAktivitet: OpptjeningAktivitet;
        dataBruktTilUtledning: null;
        bosteder: {
            perioder: ISoknadKvitteringBosteder;
            perioderSomSkalSlettes: ISoknadKvitteringBosteder;
        };
        utenlandsopphold: {
            perioder: ISoknadKvitteringUtenlandsopphold;
            perioderSomSkalSlettes: ISoknadKvitteringUtenlandsopphold;
        };
        lovbestemtFerie: {
            perioder: ISoknadKvitteringLovbestemtFerie;
        };
        arbeidstid: Arbeidstid;
        uttak: Uttak;
        omsorg: Omsorg;
        kurs: Kurs;
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}

export interface Arbeidstid {
    arbeidstakerList: ArbeidstakerList[];
    frilanserArbeidstidInfo: null | {
        perioder: IOLPSoknadKvitteringArbeidstidInfo;
    };
    selvstendigNæringsdrivendeArbeidstidInfo: SelvstendigNæringsdrivendeArbeidstidInfo;
}

export interface ArbeidstakerList {
    norskIdentitetsnummer: null;
    organisasjonsnummer: string;
    arbeidstidInfo: { perioder: IOLPSoknadKvitteringArbeidstidInfo };
}

export interface IOLPSoknadKvitteringArbeidstidInfo {
    [key: string]: {
        jobberNormaltTimerPerDag: string;
        faktiskArbeidTimerPerDag: string;
    };
}

export interface SelvstendigNæringsdrivendeArbeidstidInfo {
    perioder: SelvstendigNæringsdrivendeArbeidstidInfoPerioder;
}

export interface SelvstendigNæringsdrivendeArbeidstidInfoPerioder {
    [key: string]: ArbeidstidPeriodeMedTimer;
}

export interface Barn {
    norskIdentitetsnummer: string;
    fødselsdato: null;
}

export interface Kurs {
    kursholder: Kursholder;
    kursperioder: string[];
    reise: Reise;
}

export interface Kursholder {
    navn: string;
    institusjonsidentifikator: string;
}

export interface Omsorg {
    relasjonTilBarnet: string;
    beskrivelseAvOmsorgsrollen: string;
}

export interface OpptjeningAktivitet {
    selvstendigNæringsdrivende: SelvstendigNaeringsdrivendeAktivitet[];
    frilanser: FrilanserAktivitet;
}

export interface Uttak {
    perioder: UttakPerioder;
}

export interface UttakPerioder {
    [key: string]: UttakPeriode;
}

export interface UttakPeriode {
    timerPleieAvBarnetPerDag: string;
}
