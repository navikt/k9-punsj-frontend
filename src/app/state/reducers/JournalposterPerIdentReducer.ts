import { JournalposterPerIdentActionKeys } from '../../models/enums/Journalpost/JournalposterPerIdentActionKeys';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { RESET_ALL } from '../actions/GlobalActions';
import { IJournalposterPerIdentActions } from '../actions/JournalposterPerIdentActions';

const initialState: IJournalposterPerIdentState = {
    journalposter: [],
    isJournalposterLoading: false,
    journalposterRequestError: undefined,
};

export function JournalposterPerIdentReducer(
    journalposterPerIdentState: IJournalposterPerIdentState = initialState,
    action: IJournalposterPerIdentActions,
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
        case RESET_ALL: {
            return { ...initialState };
        }

        default:
            return journalposterPerIdentState;
    }
}
