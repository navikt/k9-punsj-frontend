import {
    DokumenttypeForkortelse,
    dokumenttyperMedBehandlingsår,
    dokumenttyperMedBehandlingsårValg,
    dokumenttyperMedPleietrengende,
    FordelingDokumenttype,
    sakstyperMedPleietrengende,
} from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/rules';
import Fagsak, { FagsakForSelect } from 'app/types/Fagsak';

export const isDokumenttypeMedPleietrengende = (dokumenttype?: FordelingDokumenttype) =>
    dokumenttype !== undefined && dokumenttyperMedPleietrengende.includes(dokumenttype);

export const isSakstypeMedPleietrengende = (sakstype?: DokumenttypeForkortelse) =>
    sakstype !== undefined && sakstyperMedPleietrengende.includes(sakstype);

export const isDokumenttypeMedBehandlingsårValg = (dokumenttype?: FordelingDokumenttype) =>
    dokumenttype !== undefined && dokumenttyperMedBehandlingsårValg.includes(dokumenttype);

export const isDokumenttypeMedBehandlingsår = (dokumenttype?: FordelingDokumenttype) =>
    dokumenttype !== undefined && dokumenttyperMedBehandlingsår.includes(dokumenttype);

export const isFagsakMedValgtBehandlingsår = (
    fagsaker: FagsakForSelect[],
    dokumenttypeMedBehandlingsårValg: boolean,
    reserverSaksnummerTilNyFagsak: boolean,
    behandlingsAar?: string,
): boolean => {
    if (dokumenttypeMedBehandlingsårValg && reserverSaksnummerTilNyFagsak) {
        return fagsaker.some((f) => {
            return f.behandlingsår?.toString() === behandlingsAar;
        });
    }
    return false;
};

export const isJournalførKnapperDisabled = (
    journalpost: IJournalpost,
    identState: IIdentState,
    ingenInfoOmPleitrengende: boolean,
    barnetHarIkkeFnr: boolean,
    toSokereIJournalpost: boolean,
    harFagsaker: boolean,
    reserverSaksnummerTilNyFagsak: boolean,
    dokumenttypeMedPleietrengende: boolean,
    dokumenttypeMedBehandlingsårValg: boolean,
    dokumenttypeMedAnnenPart: boolean,
    fagsakMedValgtBehandlingsår: boolean,
    fagsak?: Fagsak,
    behandlingsAar?: string,
    barnMedFagsak?: FagsakForSelect,
) => {
    if (dokumenttypeMedPleietrengende) {
        if (journalpost.erFerdigstilt && journalpost.sak?.reservertSaksnummer) {
            return true;
        }

        if (harFagsaker && !reserverSaksnummerTilNyFagsak && !ingenInfoOmPleitrengende && !toSokereIJournalpost) {
            return fagsak === undefined;
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

    if (dokumenttypeMedBehandlingsårValg && !behandlingsAar) {
        return true;
    }

    if (fagsakMedValgtBehandlingsår) {
        return true;
    }

    const disableVidereMidlertidigAlene =
        dokumenttypeMedAnnenPart &&
        (!identState.annenPart ||
            !!(identState.annenPart && IdentRules.erUgyldigIdent(identState.annenPart)) ||
            identState.annenPart === identState.søkerId);

    return IdentRules.erUgyldigIdent(identState.søkerId) || disableVidereMidlertidigAlene;
};

// For journalførte journalposter
export const isRedirectVidereDisabled = (
    identState: IIdentState,
    dokumenttypeMedPleietrengende: boolean,
    barnMedFagsak?: FagsakForSelect,
) => {
    if (dokumenttypeMedPleietrengende) {
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
