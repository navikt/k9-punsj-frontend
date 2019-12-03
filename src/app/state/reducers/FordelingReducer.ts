import {FordelingActionKeys, Sakstype} from 'app/models/enums';
import {IFordelingState}               from 'app/models/types';
import {IFordelingActionTypes}         from 'app/state/actions';

const initialState: IFordelingState = {
    sakstype: Sakstype.PPSB
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

        default:
            return {...fordelingState};
    }
}