import {PunchFormActionKeys}   from 'app/models/enums';
import {IPunchFormState}       from 'app/models/types';
import {IPunchFormActionTypes} from 'app/state/actions/PunchFormActions';

const initialState: IPunchFormState = {
    isMappeLoading: false
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

        default: return punchFormState;
    }
}