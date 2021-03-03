import {PunchFormActionKeys}                   from 'app/models/enums';
import {IPunchFormState}                       from 'app/models/types';
import {IPunchFormActionTypes}                 from 'app/state/actions/PunchFormActions';
import {LocationChangeAction, LOCATION_CHANGE} from 'react-router-redux';

const initialState: IPunchFormState = {
    isSoknadLoading: false,
    isComplete: false
};

export function PunchFormReducer(
    punchFormState: IPunchFormState = initialState,
    action: IPunchFormActionTypes | LocationChangeAction
): IPunchFormState {

    switch (action.type) {

        case LOCATION_CHANGE:
        case PunchFormActionKeys.RESET:
            return initialState;

        case PunchFormActionKeys.SOKNAD_LOAD:
            return {
                ...punchFormState,
                isSoknadLoading: true
            };

        case PunchFormActionKeys.SOKNAD_REQUEST_ERROR:
            return {
                ...punchFormState,
                isSoknadLoading: false,
                error: action.error
            };

        case PunchFormActionKeys.SOKNAD_SET:
            return {
                ...punchFormState,
                isSoknadLoading: false,
                soknad: action.soknad
            };

        case PunchFormActionKeys.SOKNAD_RESET:
            return {
                ...punchFormState,
                isSoknadLoading: false,
                soknad: undefined
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_REQUEST:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: true,
                updateSoknadError: undefined
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: false,
                inputErrors1: action.errors1,
                inputErrors2: action.errors2,
                updateSoknadError: undefined
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_ERROR:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: false,
                updateSoknadError: action.error
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: true,
                submitSoknadError: undefined
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitSoknadError: undefined,
                inputErrors1: undefined,
                inputErrors2: undefined,
                isComplete: true
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitSoknadError: undefined,
                inputErrors1: action.errors1,
                inputErrors2: action.errors2
            };

        case PunchFormActionKeys.SOKAND_SUBMIT_ERROR:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitSoknadError: action.error
            };

        default: return punchFormState;
    }
}
