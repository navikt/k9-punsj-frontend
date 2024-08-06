import { FordelingActionKeys } from 'app/models/enums';
import { IFordelingState } from 'app/models/types';
import { IFordelingActionTypes } from 'app/state/actions';
import { RESET_ALL } from '../actions/GlobalActions';

const initialState: IFordelingState = {
    sakstype: undefined,
    omfordelingDone: false,
    isAwaitingOmfordelingResponse: false,
    isAwaitingLukkOppgaveResponse: false,
    lukkOppgaveDone: false,
    erSøkerIdBekreftet: false,
    valgtGosysKategori: '',
    fagsak: undefined,
    dokumenttype: undefined,
};

export function FordelingReducer(
    fordelingState: IFordelingState = initialState,
    action: IFordelingActionTypes,
): IFordelingState {
    switch (action.type) {
        case FordelingActionKeys.SAKSTYPE_SET:
            return {
                ...fordelingState,
                sakstype: action.sakstype,
            };
        case FordelingActionKeys.DOKUMENTTYPE_SET:
            return {
                ...fordelingState,
                dokumenttype: action.dokumenttype,
            };

        case FordelingActionKeys.FAGSAK_SET:
            return {
                ...fordelingState,
                fagsak: action.fagsak,
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
                erSøkerIdBekreftet: action.erSøkerIdBekreftet,
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

        case FordelingActionKeys.RESET_FORDELING:
            return {
                ...initialState,
            };

        case RESET_ALL:
            return {
                ...initialState,
            };

        default:
            return { ...fordelingState };
    }
}
