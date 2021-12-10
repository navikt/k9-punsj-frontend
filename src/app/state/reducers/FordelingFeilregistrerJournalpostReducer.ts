/* eslint-disable import/prefer-default-export */

import FordelingFeilregistrerJournalpostKeys from 'app/models/enums/FordelingFeilregistrerJournalpostKeys';
import FordelingFeilregistrerJournalpostState from 'app/models/types/FordelingFeilregistrerJournalpostState';
import { FordelingFeilregistrerJournalpostActions } from '../actions/FordelingFeilregistrerJournalpostActions';

const initialState: FordelingFeilregistrerJournalpostState = {
    feilregistrerJournalpostError: undefined,
    feilregistrerJournalpostSuccess: undefined,
};

export function FordelingFeilregistrerJournalpostReducer(
    fordelingFeilregistrerJournalpostState: FordelingFeilregistrerJournalpostState = initialState,
    action: FordelingFeilregistrerJournalpostActions
): FordelingFeilregistrerJournalpostState {
    switch (action.type) {
        case FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER:
            return {
                ...fordelingFeilregistrerJournalpostState,
            };

        case FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_ERROR:
            return {
                ...fordelingFeilregistrerJournalpostState,
                feilregistrerJournalpostSuccess: false,
                feilregistrerJournalpostError: action.error,
            };

        case FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_SUCCESS:
            return {
                ...fordelingFeilregistrerJournalpostState,
                feilregistrerJournalpostSuccess: true,
                feilregistrerJournalpostError: undefined,
            };

        case FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_RESET:
            return {
                ...fordelingFeilregistrerJournalpostState,
                feilregistrerJournalpostSuccess: false,
                feilregistrerJournalpostError: undefined,
            };
        default:
            return fordelingFeilregistrerJournalpostState;
    }
}
