import {FordelingActionKeys} from 'app/models/enums';
import {IFordelingState} from 'app/models/types';
import {IFordelingActionTypes} from 'app/state/actions';
import {LOCATION_CHANGE, LocationChangeAction} from 'react-router-redux';

const initialState: IFordelingState = {
    sakstype: undefined,
    omfordelingDone: false,
    isAwaitingOmfordelingResponse: false,
    isAwaitingSjekkTilK9Response: false,
    skalTilK9: undefined,
};

export function FordelingReducer(
    fordelingState: IFordelingState = initialState,
    action: IFordelingActionTypes | LocationChangeAction
): IFordelingState {

    switch (action.type) {

        case LOCATION_CHANGE:
            return initialState;

        case FordelingActionKeys.SAKSTYPE_SET:
            return {
                ...fordelingState,
                sakstype: action.sakstype
            };

        case FordelingActionKeys.OMFORDELING_REQUEST:
            return {
                ...fordelingState,
                omfordelingDone: false,
                isAwaitingOmfordelingResponse: true,
                omfordelingError: undefined
            };

        case FordelingActionKeys.OMFORDELING_SUCCESS:
            return {
                ...fordelingState,
                omfordelingDone: true,
                isAwaitingOmfordelingResponse: false,
                omfordelingError: undefined
            };

        case FordelingActionKeys.OMFORDELING_ERROR:
            return {
                ...fordelingState,
                omfordelingDone: false,
                isAwaitingOmfordelingResponse: false,
                omfordelingError: action.error
            };

        case FordelingActionKeys.SJEKK_SKAL_TIL_K9_REQUEST:
            return {
                ...fordelingState,
                isAwaitingSjekkTilK9Response: true,
                sjekkTilK9Error: undefined
            };

        case FordelingActionKeys.SJEKK_SKAL_TIL_K9_ERROR:
            return {
                ...fordelingState,
                isAwaitingSjekkTilK9Response: false,
                sjekkTilK9Error: action.error
            };

        case FordelingActionKeys.SJEKK_SKAL_TIL_K9_SUCCESS:
            return {
                ...fordelingState,
                isAwaitingSjekkTilK9Response: false,
                sjekkTilK9Error: undefined,
                skalTilK9: action.k9sak
            };

        default:
            return {...fordelingState};
    }
}
