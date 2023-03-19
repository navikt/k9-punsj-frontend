/* eslint-disable import/prefer-default-export */
import FordelingFerdigstillJournalpostKeys from 'app/models/enums/FordelingFerdigstillJournalpostKeys';
import FordelingFerdigstillJournalpostState from 'app/models/types/FordelingFerdigstillJournalpostState';

import { FordelingFerdigstillJournalpostActions } from '../actions/FordelingFerdigstillJournalpostActions';

const initialState: FordelingFerdigstillJournalpostState = {
    ferdigstillJournalpostError: undefined,
    ferdigstillJournalpostSuccess: undefined,
};

export function FordelingFerdigstillJournalpostReducer(
    fordelingFerdigstillJournalpostState: FordelingFerdigstillJournalpostState,
    action: FordelingFerdigstillJournalpostActions,
): FordelingFerdigstillJournalpostState {
    if (typeof fordelingFerdigstillJournalpostState === 'undefined') {
        return initialState;
    }
    switch (action.type) {
        case FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL:
            return {
                ...fordelingFerdigstillJournalpostState,
            };

        case FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_ERROR:
            return {
                ...fordelingFerdigstillJournalpostState,
                ferdigstillJournalpostSuccess: false,
                ferdigstillJournalpostError: action.error,
            };

        case FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_SUCCESS:
            return {
                ...fordelingFerdigstillJournalpostState,
                ferdigstillJournalpostSuccess: true,
                ferdigstillJournalpostError: undefined,
            };

        case FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_RESET:
            return {
                ...fordelingFerdigstillJournalpostState,
                ferdigstillJournalpostSuccess: false,
                ferdigstillJournalpostError: undefined,
            };
        default:
            return fordelingFerdigstillJournalpostState;
    }
}
