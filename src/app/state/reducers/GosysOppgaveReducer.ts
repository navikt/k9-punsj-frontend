
import {GosysOppgaveActionKeys} from "../../models/enums/GosysOppgaveActionKeys";
import {IOpprettGosysOppgaveActionTypes} from "../actions/GosysOppgaveActions";
import {IGosysOppgaveState} from "../../models/types/GosysOppgaveState";

const initialState: IGosysOppgaveState = {
    isAwaitingGosysOppgaveRequestResponse: false
};

export function GosysOppgaveReducer(
    gosysOppgaveState: IGosysOppgaveState = initialState,
    action: IOpprettGosysOppgaveActionTypes
): IGosysOppgaveState {
    switch (action.type) {

        case GosysOppgaveActionKeys.OPPRETT_OPPGAVE_REQUEST:
            return {
                ...gosysOppgaveState,
                isAwaitingGosysOppgaveRequestResponse: true,
                gosysOppgaveRequestSuccess: undefined,
                gosysOppgaveRequestError: undefined
            };

        case GosysOppgaveActionKeys.OPPRETT_OPPGAVE_SUCCESS:
            return {
                ...gosysOppgaveState,
                isAwaitingGosysOppgaveRequestResponse: false,
                gosysOppgaveRequestSuccess: true,
                gosysOppgaveRequestError: undefined
            };

        case GosysOppgaveActionKeys.OPPRETT_OPPGAVE_ERROR:
            return {
                ...gosysOppgaveState,
                isAwaitingGosysOppgaveRequestResponse: false,
                gosysOppgaveRequestSuccess: false,
                gosysOppgaveRequestError: action.error
            };

        case GosysOppgaveActionKeys.OPPRETT_OPPGAVE_RESET:
            return {
                ...gosysOppgaveState,
                isAwaitingGosysOppgaveRequestResponse: false,
                gosysOppgaveRequestSuccess: false,
                gosysOppgaveRequestError: undefined
            };

        default:
            return gosysOppgaveState;
    }
}
