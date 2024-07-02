import Kvittering from 'app/models/forms/soeknader/Kvittering';
import { ArbeidstidPeriodeMedTimer } from 'app/models/types';
import BegrunnelseForInnsending from 'app/models/types/BegrunnelseForInnsending';
import { FrilanserAktivitet, SelvstendigNaeringsdrivendeAktivitet } from 'app/models/types/KvitteringTyper';

export interface IOLPSoknadKvittering extends Kvittering {
    ytelse: {
        type: string;
        barn: Barn;
        søknadsperiode: string[];
        trekkKravPerioder: any[];
        opptjeningAktivitet: OpptjeningAktivitet;
        dataBruktTilUtledning: null;
        bosteder: Bosteder;
        utenlandsopphold: Utenlandsopphold;
        lovbestemtFerie: LovbestemtFerie;
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

export interface Bosteder {
    perioder: PerioderSomSkalSlettesClass;
    perioderSomSkalSlettes: PerioderSomSkalSlettesClass;
}

export interface Kurs {
    kursholder: Kursholder;
    kursperioder: KursperioderSoknadKvittering[];
}

export interface Kursholder {
    holder: null;
    institusjonsidentifikator: string;
}

export interface KursperioderSoknadKvittering {
    periode: string;
    avreise: string;
    hjemkomst: string;
    begrunnelseReisetidTil: null;
    begrunnelseReisetidHjem: null;
}

export interface LovbestemtFerie {
    perioder: LovbestemtFeriePerioder;
}

export interface IOLPSoknadKvitteringLovbestemtFerie {
    [key: string]: { skalHaFerie: boolean };
}

export interface Omsorg {
    relasjonTilBarnet: string;
    beskrivelseAvOmsorgsrollen: string;
}

export interface OpptjeningAktivitet {
    selvstendigNæringsdrivende: SelvstendigNaeringsdrivendeAktivitet[];
    frilanser: FrilanserAktivitet;
}

export interface Utenlandsopphold {
    perioder: UtenlandsoppholdPerioder;
    perioderSomSkalSlettes: PerioderSomSkalSlettesClass;
}

export interface UtenlandsoppholdPerioder {
    [key: string]: IOLPSoknadKvitteringUtenlandsoppholdInfo;
}

export interface IOLPSoknadKvitteringUtenlandsoppholdInfo {
    land: string;
    årsak: null;
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
