import BegrunnelseForInnsending from './BegrunnelseForInnsending';
import {
    FrilanserAktivitet,
    ISoknadKvitteringArbeidstid,
    ISoknadKvitteringBosteder,
    ISoknadKvitteringJournalpost,
    ISoknadKvitteringLovbestemtFerie,
    ISoknadKvitteringUtenlandsopphold,
    SelvstendigNaeringsdrivendeAktivitet,
} from './KvitteringTyper';

export interface IPSBSoknadKvitteringBeredskapNattevak {
    [key: string]: { tilleggsinformasjon: string };
}

export interface IPSBSoknadKvitteringTilsynsordning {
    [key: string]: { etablertTilsynTimerPerDag: string };
}

export interface IPSBSoknadKvitteringOmsorg {
    relasjonTilBarnet: null | string;
    beskrivelseAvOmsorgsrollen: null | string;
}

export interface IPSBSoknadKvitteringUttak {
    [key: string]: { timerPleieAvBarnetPerDag: string };
}

export interface IPSBSoknadKvittering {
    mottattDato: string;
    journalposter: ISoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
        barn: {
            norskIdentitetsnummer: string;
            fødselsdato: string | null;
        };
        søknadsperiode: string[];
        bosteder: { perioder: ISoknadKvitteringBosteder };
        utenlandsopphold: { perioder: ISoknadKvitteringUtenlandsopphold };
        beredskap: { perioder: IPSBSoknadKvitteringBeredskapNattevak };
        nattevåk: { perioder: IPSBSoknadKvitteringBeredskapNattevak };
        tilsynsordning: { perioder: IPSBSoknadKvitteringTilsynsordning };
        lovbestemtFerie: { perioder: ISoknadKvitteringLovbestemtFerie };
        arbeidstid: ISoknadKvitteringArbeidstid;
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
