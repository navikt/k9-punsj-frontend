import { SignaturActionKeys } from 'app/models/enums';
import { ISignaturState } from 'app/models/types';
import { SignaturActionTypes } from 'app/state/actions';

const initialState: ISignaturState = {
    signert: null,
    isAwaitingUsignertRequestResponse: false,
};

// eslint-disable-next-line import/prefer-default-export
export function SignaturReducer(
    signaturState: ISignaturState = initialState,
    action: SignaturActionTypes,
): ISignaturState {
    switch (action.type) {
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
