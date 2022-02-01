/* eslint-disable import/prefer-default-export */

import FordelingSettPåVentKeys from 'app/models/enums/FordelingSettPåVentKeys';
import FordelingSettPaaVentState from 'app/models/types/FordelingSettPaaVentState';
import { FordelingSettPaaVentActions } from '../actions/FordelingSettPaaVentActions';

const initialState: FordelingSettPaaVentState = {
    settPaaVentError: undefined,
    settPaaVentSuccess: undefined,
};

export function FordelingSettPåVentReducer(
    fordelingSettPåVentState: FordelingSettPaaVentState,
    action: FordelingSettPaaVentActions
): FordelingSettPaaVentState {
    if (typeof fordelingSettPåVentState === 'undefined') {
        return initialState;
    }
    switch (action.type) {
        case FordelingSettPåVentKeys.JOURNALPOST_SETT_PAA_VENT:
            return {
                ...fordelingSettPåVentState,
            };

        case FordelingSettPåVentKeys.JOURNALPOST_SETT_PAA_VENT_ERROR:
            return {
                ...fordelingSettPåVentState,
                settPaaVentSuccess: false,
                settPaaVentError: action.error,
            };

        case FordelingSettPåVentKeys.JOURNALPOST_SETT_PAA_VENT_SUCCESS:
            return {
                ...fordelingSettPåVentState,
                settPaaVentSuccess: true,
                settPaaVentError: undefined,
            };

        case FordelingSettPåVentKeys.JOURNALPOST_SETT_PAA_VENT_RESET:
            return {
                ...fordelingSettPåVentState,
                settPaaVentSuccess: false,
                settPaaVentError: undefined,
            };
        default:
            return fordelingSettPåVentState;
    }
}
