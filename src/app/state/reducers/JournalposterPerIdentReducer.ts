import { IJournalposterPerIdentState } from '../../models/types/JournalposterPerIdentState';
import { IJournalposterPerIdentActions } from '../actions/JournalposterPerIdentActions';
import { JournalposterPerIdentActionKeys } from '../../models/enums/JournalposterPerIdentActionKeys';

const initialState: IJournalposterPerIdentState = {
    journalposter: [],
    isJournalposterLoading: false,
    journalposterRequestError: undefined,
};

// eslint-disable-next-line import/prefer-default-export
export function JournalposterPerIdentReducer(
    journalposterPerIdentState: IJournalposterPerIdentState = initialState,
    action: IJournalposterPerIdentActions
): IJournalposterPerIdentState {
    switch (action.type) {
        case JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_SET:
            return {
                ...journalposterPerIdentState,
                journalposter: action.journalposter,
                isJournalposterLoading: false,
                journalposterRequestError: undefined,
            };

        case JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_LOAD:
            return {
                ...journalposterPerIdentState,
                isJournalposterLoading: action.isLoading,
                journalposterRequestError: undefined,
            };
        case JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_REQUEST_ERROR:
            return {
                ...journalposterPerIdentState,
                isJournalposterLoading: false,
                journalposterRequestError: action.error,
            };

        default:
            return journalposterPerIdentState;
    }
}
