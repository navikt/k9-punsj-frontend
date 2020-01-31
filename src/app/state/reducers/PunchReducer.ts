import {PunchActionKeys, PunchStep}            from 'app/models/enums';
import {IPunchState}                           from 'app/models/types';
import {IPunchActionTypes}                     from 'app/state/actions';
import {LOCATION_CHANGE, LocationChangeAction} from 'react-router-redux';

export const initialState: IPunchState = {
    step: PunchStep.FORDELING,
    ident1: '',
    ident2: null,
    journalpost: undefined
};

export function PunchReducer(
    punchState: IPunchState = initialState,
    action: IPunchActionTypes | LocationChangeAction
): IPunchState {
    switch (action.type) {

        case LOCATION_CHANGE:
        case PunchActionKeys.RESET:
            return initialState;

        case PunchActionKeys.IDENT_SET:
            return {
                ...punchState,
                ident1: action.ident1,
                ident2: action.ident2
            };

        case PunchActionKeys.STEP_SET:
            return {
                ...punchState,
                step: action.step
            };

        case PunchActionKeys.BACK_FROM_FORM:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD
            };

        case PunchActionKeys.BACK_FROM_MAPPER:
            return {
                ...punchState,
                step: PunchStep.IDENT,
                ident1: '',
                ident2: null
            };

        case PunchActionKeys.JOURNALPOST_SET:
            return {
                ...punchState,
                journalpost: action.journalpost,
                isJournalpostLoading: false,
                journalpostRequestError: undefined
            };

        case PunchActionKeys.JOURNALPOST_LOAD:
            return {
                ...punchState,
                journalpost: undefined,
                isJournalpostLoading: true,
                journalpostRequestError: undefined
            };

        case PunchActionKeys.JOURNALPOST_REQUEST_ERROR:
            return {
                ...punchState,
                journalpost: undefined,
                isJournalpostLoading: false,
                journalpostRequestError: undefined
            };

        default:
            return punchState;
    }
}