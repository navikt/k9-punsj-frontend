import { FordelingActionKeys } from 'app/models/enums';
import { IFordelingState } from 'app/models/types';
import { IFordelingActionTypes } from 'app/state/actions';

const initialState: IFordelingState = {
    sakstype: undefined,
    omfordelingDone: false,
    isAwaitingOmfordelingResponse: false,
    isAwaitingSjekkTilK9Response: false,
    isAwaitingLukkOppgaveResponse: false,
    lukkOppgaveDone: false,
    skalTilK9: undefined,
    erIdent1Bekreftet: false,
    valgtGosysKategori: '',
    kanIkkeGaaTilK9: [],
};

// eslint-disable-next-line import/prefer-default-export
export function FordelingReducer(
    fordelingState: IFordelingState = initialState,
    action: IFordelingActionTypes
): IFordelingState {
    switch (action.type) {
        case FordelingActionKeys.SAKSTYPE_SET:
            return {
                ...fordelingState,
                sakstype: action.sakstype,
            };

        case FordelingActionKeys.OMFORDELING_REQUEST:
            return {
                ...fordelingState,
                omfordelingDone: false,
                isAwaitingOmfordelingResponse: true,
                omfordelingError: undefined,
            };

        case FordelingActionKeys.OMFORDELING_SUCCESS:
            return {
                ...fordelingState,
                omfordelingDone: true,
                isAwaitingOmfordelingResponse: false,
                omfordelingError: undefined,
            };

        case FordelingActionKeys.OMFORDELING_ERROR:
            return {
                ...fordelingState,
                omfordelingDone: false,
                isAwaitingOmfordelingResponse: false,
                omfordelingError: action.error,
            };

        case FordelingActionKeys.SJEKK_SKAL_TIL_K9_REQUEST:
            return {
                ...fordelingState,
                isAwaitingSjekkTilK9Response: true,
                sjekkTilK9Error: undefined,
            };

        case FordelingActionKeys.SJEKK_SKAL_TIL_K9_ERROR:
            return {
                ...fordelingState,
                isAwaitingSjekkTilK9Response: false,
                sjekkTilK9Error: action.error,
            };

        case FordelingActionKeys.SJEKK_SKAL_TIL_K9_SUCCESS:
            return {
                ...fordelingState,
                isAwaitingSjekkTilK9Response: false,
                sjekkTilK9Error: undefined,
                skalTilK9: action.k9sak,
            };

        case FordelingActionKeys.SJEKK_SKAL_TIL_K9_JOURNALPOST_STOTTES_IKKE:
            return {
                ...fordelingState,
                isAwaitingSjekkTilK9Response: false,
                sjekkTilK9Error: undefined,
                sjekkTilK9JournalpostStottesIkke: true,
            };

        case FordelingActionKeys.LUKK_OPPGAVE_REQUEST:
            return {
                ...fordelingState,
                lukkOppgaveDone: false,
                isAwaitingLukkOppgaveResponse: true,
                lukkOppgaveError: undefined,
            };

        case FordelingActionKeys.LUKK_OPPGAVE_SUCCESS:
            return {
                ...fordelingState,
                lukkOppgaveDone: true,
                isAwaitingLukkOppgaveResponse: false,
                lukkOppgaveError: undefined,
            };

        case FordelingActionKeys.LUKK_OPPGAVE_ERROR:
            return {
                ...fordelingState,
                lukkOppgaveDone: false,
                isAwaitingLukkOppgaveResponse: false,
                lukkOppgaveError: action.error,
            };

        case FordelingActionKeys.LUKK_OPPGAVE_RESET:
            return {
                ...fordelingState,
                lukkOppgaveDone: false,
                isAwaitingLukkOppgaveResponse: false,
                lukkOppgaveError: undefined,
            };

        case FordelingActionKeys.IDENT_BEKREFT_IDENT1:
            return {
                ...fordelingState,
                erIdent1Bekreftet: action.erIdent1Bekreftet,
            };

        case FordelingActionKeys.GOSYS_GJELDER_REQUEST:
            return {
                ...fordelingState,
                isAwaitingGosysGjelderResponse: true,
            };

        case FordelingActionKeys.GOSYS_GJELDER_SUCCESS:
            return {
                ...fordelingState,
                isAwaitingGosysGjelderResponse: false,
                gosysGjelderKategorier: action.gjelderKategorierFraGosys,
            };

        case FordelingActionKeys.GOSYS_GJELDER_ERROR:
            return {
                ...fordelingState,
                isAwaitingGosysGjelderResponse: false,
                gosysGjelderKategorierError: action.error,
            };

        case FordelingActionKeys.VALGT_GOSYS_KATEGORI:
            return {
                ...fordelingState,
                valgtGosysKategori: action.valgtGosysKategori,
            };

        default:
            return { ...fordelingState };
    }
}
