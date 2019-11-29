import {PunchActionKeys, PunchStep} from 'app/models/enums';
import {IPunchState}                from 'app/models/types';
import {IPunchActionTypes}          from 'app/state/actions';

const initialState: IPunchState = {
    step: PunchStep.START,
    ident: "",
    journalpost: undefined
};

export function PunchReducer(
    punchState: IPunchState = initialState,
    action: IPunchActionTypes
): IPunchState {
    switch (action.type) {

        case PunchActionKeys.IDENT_SET:
            return {
                ...punchState,
                ident: action.ident,
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
                step: PunchStep.START,
                ident: ''
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

        default: return punchState;
    }
}