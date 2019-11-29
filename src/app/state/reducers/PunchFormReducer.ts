import {PunchFormActionKeys}   from 'app/models/enums';
import {IPunchFormState}       from 'app/models/types';
import {IPunchFormActionTypes} from 'app/state/actions/PunchFormActions';

const initialState: IPunchFormState = {
    isMappeLoading: false,
    isComplete: false
};

export function PunchFormReducer(
    punchFormState: IPunchFormState = initialState,
    action: IPunchFormActionTypes
): IPunchFormState {

    switch (action.type) {

        case PunchFormActionKeys.MAPPE_LOAD:
            return {
                ...punchFormState,
                isMappeLoading: true
            };

        case PunchFormActionKeys.MAPPE_REQUEST_ERROR:
            return {
                ...punchFormState,
                isMappeLoading: false,
                error: action.error
            };

        case PunchFormActionKeys.MAPPE_SET:
            return {
                ...punchFormState,
                isMappeLoading: false,
                mappe: action.mappe
            };

        case PunchFormActionKeys.MAPPE_RESET:
            return {
                ...punchFormState,
                isMappeLoading: false,
                mappe: undefined
            };

        case PunchFormActionKeys.SOKNAD_SET:
            return {
                ...punchFormState,
                mappe: {
                    ...punchFormState.mappe,
                    innhold: action.soknad
                }
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_REQUEST:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: true,
                updateMappeError: undefined
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: false,
                inputErrors: action.errors,
                updateMappeError: undefined
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_ERROR:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: false,
                updateMappeError: action.error
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: true,
                submitMappeError: undefined
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitMappeError: undefined,
                inputErrors: undefined,
                isComplete: true
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitMappeError: undefined,
                inputErrors: action.errors
            };

        case PunchFormActionKeys.SOKAND_SUBMIT_ERROR:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitMappeError: action.error
            };

        default: return punchFormState;
    }
}