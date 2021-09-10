import { SignaturActionKeys } from 'app/models/enums';
import { ISignaturState } from 'app/models/types';
import { SignaturActionTypes } from 'app/state/actions';
import { LocationChangeAction, LOCATION_CHANGE } from 'react-router-redux';

const initialState: ISignaturState = {
    signert: null,
    isAwaitingUsignertRequestResponse: false,
};

export function SignaturReducer(
    signaturState: ISignaturState = initialState,
    action: SignaturActionTypes | LocationChangeAction
): ISignaturState {
    switch (action.type) {
        case LOCATION_CHANGE:
            return initialState;

        case SignaturActionKeys.SET:
            return {
                ...signaturState,
                signert: action.signert,
            };

        case SignaturActionKeys.USIGNERT_REQUEST:
            return {
                ...signaturState,
                isAwaitingUsignertRequestResponse: true,
                usignertRequestSuccess: undefined,
                usignertRequestError: undefined,
            };

        case SignaturActionKeys.USIGNERT_SUCCESS:
            return {
                ...signaturState,
                isAwaitingUsignertRequestResponse: false,
                usignertRequestSuccess: true,
                usignertRequestError: undefined,
            };

        case SignaturActionKeys.USIGNERT_ERROR:
            return {
                ...signaturState,
                isAwaitingUsignertRequestResponse: false,
                usignertRequestSuccess: false,
                usignertRequestError: action.error,
            };

        case SignaturActionKeys.USIGNERT_RESET:
            return {
                ...signaturState,
                isAwaitingUsignertRequestResponse: false,
                usignertRequestSuccess: undefined,
                usignertRequestError: undefined,
            };

        default:
            return signaturState;
    }
}
