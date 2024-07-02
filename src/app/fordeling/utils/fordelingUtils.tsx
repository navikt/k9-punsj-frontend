import {
    FordelingDokumenttype,
    dokumenttyperForPsbOmsOlp,
    dokumenttyperMedPleietrengende,
    dokumenttyperOMS,
    sakstyperMedPleietrengende,
} from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/rules';
import Fagsak from 'app/types/Fagsak';

export const isDokumenttypeMedPleietrengende = (dokumenttype?: FordelingDokumenttype) =>
    dokumenttype && dokumenttyperMedPleietrengende.includes(dokumenttype);

// Brukes for å sjekke om det trenges å vise behandlingsår velgeren
export const isDokumenttypeMedBehandlingsårValg = (dokumenttype?: FordelingDokumenttype) =>
    dokumenttype === FordelingDokumenttype.OMSORGSPENGER_UT || dokumenttype === FordelingDokumenttype.KORRIGERING_IM;

// Brukes for å sjekke om det trenges å lagre behandlingsår i journalposten før klassifisering
export const isDokumenttypeOMS = (dokumenttype?: FordelingDokumenttype) =>
    !!dokumenttype && dokumenttyperOMS.includes(dokumenttype);

export const isSakstypeMedPleietrengende = (journalpost: IJournalpost) =>
    journalpost.sak?.sakstype && sakstyperMedPleietrengende.includes(journalpost.sak?.sakstype);

export const jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende = (journalpost: IJournalpost) =>
    !journalpost.erFerdigstilt &&
    !!journalpost.sak?.fagsakId &&
    !!journalpost?.norskIdent &&
    !(!isSakstypeMedPleietrengende(journalpost) || !!journalpost.sak.pleietrengendeIdent);

export const jpErFerdigstiltOgUtenPleietrengende = (journalpost: IJournalpost) =>
    journalpost.erFerdigstilt &&
    !!journalpost.sak?.fagsakId &&
    !!journalpost?.norskIdent &&
    !(!isSakstypeMedPleietrengende(journalpost) || !!journalpost.sak.pleietrengendeIdent);

export const isFagsakMedValgtBehandlingsår = (
    fagsaker: Fagsak[],
    reserverSaksnummerTilNyFagsak: boolean,
    dokumenttype?: FordelingDokumenttype,
    valgteBehandlingsår?: string,
): boolean => {
    if (isDokumenttypeMedBehandlingsårValg(dokumenttype) && reserverSaksnummerTilNyFagsak) {
        return fagsaker.some((f) => {
            return f.behandlingsår?.toString() === valgteBehandlingsår;
        });
    }
    return false;
};

export const gjelderPsbOmsOlp = (dokumenttype?: FordelingDokumenttype) =>
    !!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);

export const kanJournalforingsoppgaveOpprettesiGosys = (journalpost?: IJournalpost) =>
    !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

export const disableVidereMidlertidigAlene = (identState: IIdentState, dokumenttype?: FordelingDokumenttype) =>
    dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
    (!identState.annenPart || !!(identState.annenPart && IdentRules.erUgyldigIdent(identState.annenPart)));

export const isJournalførKnapperDisabled = (
    journalpost: IJournalpost,
    identState: IIdentState,
    fagsaker: Fagsak[],
    harFagsaker: boolean,
    reserverSaksnummerTilNyFagsak: boolean,
    ingenInfoOmPleitrengende: boolean,
    toSokereIJournalpost: boolean,
    barnetHarIkkeFnr: boolean,
    behandlingsAar?: string,
    valgtFagsak?: Fagsak,
    dokumenttype?: FordelingDokumenttype,
    barnMedFagsak?: Fagsak,
) => {
    if (isDokumenttypeMedPleietrengende(dokumenttype)) {
        if (journalpost.erFerdigstilt && journalpost.sak?.reservertSaksnummer) {
            return true;
        }

        if (harFagsaker && !reserverSaksnummerTilNyFagsak && !ingenInfoOmPleitrengende) {
            return !valgtFagsak;
        }

        if (barnMedFagsak) {
            return true;
        }

        if (identState.søkerId === identState.pleietrengendeId) {
            return true;
        }

        if (identState.søkerId === identState.annenSokerIdent) {
            return true;
        }

        if (identState.pleietrengendeId === identState.annenSokerIdent) {
            return true;
        }

        if (!!journalpost?.kanKopieres && toSokereIJournalpost) {
            return (
                IdentRules.erUgyldigIdent(identState.søkerId) ||
                IdentRules.erUgyldigIdent(identState.annenSokerIdent) ||
                !identState.pleietrengendeId
            );
        }

        if (!barnetHarIkkeFnr && !ingenInfoOmPleitrengende && IdentRules.erUgyldigIdent(identState.pleietrengendeId)) {
            return true;
        }
    }

    if (isDokumenttypeMedBehandlingsårValg(dokumenttype) && !behandlingsAar) {
        return true;
    }

    if (isFagsakMedValgtBehandlingsår(fagsaker, reserverSaksnummerTilNyFagsak, dokumenttype, behandlingsAar)) {
        return true;
    }

    return IdentRules.erUgyldigIdent(identState.søkerId) || disableVidereMidlertidigAlene(identState, dokumenttype);
};

export const isVidereKnappDisabled = (
    identState: IIdentState,
    dokumenttype?: FordelingDokumenttype,
    barnMedFagsak?: Fagsak,
) => {
    if (isDokumenttypeMedPleietrengende(dokumenttype)) {
        if (barnMedFagsak) {
            return true;
        }

        if (identState.søkerId === identState.pleietrengendeId) {
            return true;
        }

        if (IdentRules.erUgyldigIdent(identState.pleietrengendeId)) {
            return true;
        }
    }

    return IdentRules.erUgyldigIdent(identState.søkerId);
};

export const isFagsakSelectVisible = (
    journalpost: IJournalpost,
    identState: IIdentState,
    harFagsaker: boolean,
    dokumenttype?: FordelingDokumenttype,
) =>
    gjelderPsbOmsOlp(dokumenttype) &&
    harFagsaker &&
    identState.søkerId.length === 11 &&
    !jpErFerdigstiltOgUtenPleietrengende(journalpost);

// TODO Endre navn til variabel ingenInfoOmPleitrengende ser ut at ikke logisk navn
export const isPleietrengendeComponentVisible = (
    journalpost: IJournalpost,
    identState: IIdentState,
    isFetchingFagsaker: boolean,
    visSokersBarn: boolean,
    ingenInfoOmPleitrengende: boolean,
    reserverSaksnummerTilNyFagsak: boolean,
    dokumenttype?: FordelingDokumenttype,
) =>
    !isFetchingFagsaker &&
    !!isDokumenttypeMedPleietrengende(dokumenttype) &&
    !ingenInfoOmPleitrengende &&
    visSokersBarn &&
    !IdentRules.erUgyldigIdent(identState.søkerId) &&
    (reserverSaksnummerTilNyFagsak ||
        jpErFerdigstiltOgUtenPleietrengende(journalpost) ||
        jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende(journalpost));

// TODO Sjekk ang valgtFagsak?.reservert && !valgtFagsak?.gyldigPeriode
export const isValgAvBehandlingsårVisible = (
    journalpost: IJournalpost,
    identState: IIdentState,
    reserverSaksnummerTilNyFagsak: boolean,
    valgtFagsak?: Fagsak,
    dokumenttype?: FordelingDokumenttype,
) =>
    isDokumenttypeMedBehandlingsårValg(dokumenttype) &&
    identState.søkerId.length === 11 &&
    (reserverSaksnummerTilNyFagsak || (valgtFagsak?.reservert && !valgtFagsak?.behandlingsår)) &&
    !journalpost.erFerdigstilt;
