/* eslint-disable import/prefer-default-export */

import FordelingSettPåVentKeys from 'app/models/enums/FordelingSettPaaVentKeys';
import FordelingSettPåVentState from 'app/models/types/FordelingSettPaaVentState';
import { FordelingSettPåVentActions } from '../actions/FordelingSettPaaVentActions';

const initialState: FordelingSettPåVentState = {
    settPaaVentError: undefined,
    settPaaVentSuccess: undefined,
};

export function FordelingSettPåVentReducer(
    fordelingSettPåVentState: FordelingSettPåVentState = initialState,
    action: FordelingSettPåVentActions
): FordelingSettPåVentState {
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
