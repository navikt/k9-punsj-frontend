import {FordelingActionKeys, Sakstype} from 'app/models/enums';
import {IFordelingState}               from 'app/models/types';
import {IFordelingActionTypes}         from 'app/state/actions';

const initialState: IFordelingState = {
    sakstype: Sakstype.PLEIEPENGER_SYKT_BARN,
    omfordelingDone: false,
    isAwaitingOmfordelingResponse: false
};

export function FordelingReducer(
    fordelingState: IFordelingState = initialState,
    action: IFordelingActionTypes
): IFordelingState {

    switch (action.type) {

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

        default:
            return {...fordelingState};
    }
}