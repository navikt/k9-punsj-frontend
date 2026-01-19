import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/rules';
import Fagsak, { FagsakForSelect } from 'app/types/Fagsak';

export const checkIfFagsakMedValgtBehandlingsår = (
    fagsaker: FagsakForSelect[],
    isDokumenttypeMedBehandlingsårValg: boolean,
    reserverSaksnummerTilNyFagsak: boolean,
    behandlingsÅr?: string,
): boolean =>
    isDokumenttypeMedBehandlingsårValg &&
    reserverSaksnummerTilNyFagsak &&
    fagsaker.some((f) => f.behandlingsår?.toString() === behandlingsÅr);

export const isJournalførKnapperDisabled = (
    journalpost: IJournalpost,
    identState: IIdentState,
    ingenInfoOmPleitrengende: boolean,
    barnetHarIkkeFnr: boolean,
    toSokereIJournalpost: boolean,
    harFagsaker: boolean,
    reserverSaksnummerTilNyFagsak: boolean,
    isDokumenttypeMedPleietrengende: boolean,
    isDokumenttypeMedBehandlingsårValg: boolean,
    isDokumenttypeMedAnnenPart: boolean,
    isDokumenttypeMedFosterbarn: boolean,
    isFagsakMedValgtBehandlingsår: boolean,
    gjelderOlp: boolean,
    tillatPSBMBarnMedFagsakVidere: boolean,
    fagsak?: Fagsak,
    behandlingsÅr?: string,
    barnMedFagsak?: FagsakForSelect,
) => {
    if (isDokumenttypeMedPleietrengende) {
        if (journalpost.erFerdigstilt && journalpost.sak?.reservertSaksnummer) {
            return true;
        }

        if (harFagsaker && !reserverSaksnummerTilNyFagsak && !ingenInfoOmPleitrengende && !toSokereIJournalpost) {
            return fagsak === undefined;
        }

        if (!gjelderOlp && !tillatPSBMBarnMedFagsakVidere && !!barnMedFagsak) {
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

    if ((isDokumenttypeMedBehandlingsårValg && !behandlingsÅr) || isFagsakMedValgtBehandlingsår) {
        return true;
    }

    /* 
    if (isDokumenttypeMedFosterbarn && identState.fosterbarn) {
        return (
            identState.fosterbarn.some((barn) => IdentRules.erUgyldigIdent(barn)) ||
            identState.fosterbarn.some((barn) => barn === identState.søkerId) ||
            (toSokereIJournalpost && identState.fosterbarn.some((barn) => barn === identState.annenSokerIdent)) ||
            (isDokumenttypeMedAnnenPart &&
                !!identState.annenPart &&
                identState.fosterbarn.some((barn) => barn === identState.annenPart))
        );
    }
        */

    const notValidFosterbarn =
        isDokumenttypeMedFosterbarn &&
        identState.fosterbarn &&
        (identState.fosterbarn.some((barn) => IdentRules.erUgyldigIdent(barn)) ||
            identState.fosterbarn.some((barn) => barn === identState.søkerId) ||
            (toSokereIJournalpost && identState.fosterbarn.some((barn) => barn === identState.annenSokerIdent)) ||
            (isDokumenttypeMedAnnenPart &&
                !!identState.annenPart &&
                identState.fosterbarn.some((barn) => barn === identState.annenPart)));

    const disableVidereMidlertidigAlene =
        isDokumenttypeMedAnnenPart &&
        (!identState.annenPart ||
            !!(identState.annenPart && IdentRules.erUgyldigIdent(identState.annenPart)) ||
            identState.annenPart === identState.søkerId);

    return IdentRules.erUgyldigIdent(identState.søkerId) || disableVidereMidlertidigAlene || notValidFosterbarn;
};

// For journalførte journalposter
export const isRedirectVidereDisabled = (
    identState: IIdentState,
    isDokumenttypeMedPleietrengende: boolean,
    gjelderOlp: boolean,
    tillatPSBMBarnMedFagsakVidere: boolean,
    barnMedFagsak?: FagsakForSelect,
) => {
    if (isDokumenttypeMedPleietrengende) {
        if (!tillatPSBMBarnMedFagsakVidere && !gjelderOlp && !!barnMedFagsak) {
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
