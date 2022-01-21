/* eslint-disable import/prefer-default-export */

import FordelingSettPaaVentKeys from 'app/models/enums/FordelingSettPaaVentKeys';
import FordelingSettPaaVentState from 'app/models/types/FordelingSettPaaVentState';
import { FordelingSettPaaVentActions } from '../actions/FordelingSettPaaVentActions';

const initialState: FordelingSettPaaVentState = {
    settPaaVentError: undefined,
    settPaaVentSuccess: undefined,
};

export function FordelingSettPaaVentReducer(
    fordelingSettPåVentState: FordelingSettPaaVentState,
    action: FordelingSettPaaVentActions
): FordelingSettPaaVentState {
    if (typeof fordelingSettPåVentState === 'undefined') {
        return initialState;
    }
    switch (action.type) {
        case FordelingSettPaaVentKeys.JOURNALPOST_SETT_PAA_VENT:
            return {
                ...fordelingSettPåVentState,
            };

        case FordelingSettPaaVentKeys.JOURNALPOST_SETT_PAA_VENT_ERROR:
            return {
                ...fordelingSettPåVentState,
                settPaaVentSuccess: false,
                settPaaVentError: action.error,
            };

        case FordelingSettPaaVentKeys.JOURNALPOST_SETT_PAA_VENT_SUCCESS:
            return {
                ...fordelingSettPåVentState,
                settPaaVentSuccess: true,
                settPaaVentError: undefined,
            };

        case FordelingSettPaaVentKeys.JOURNALPOST_SETT_PAA_VENT_RESET:
            return {
                ...fordelingSettPåVentState,
                settPaaVentSuccess: false,
                settPaaVentError: undefined,
            };
        default:
            return fordelingSettPåVentState;
    }
}
