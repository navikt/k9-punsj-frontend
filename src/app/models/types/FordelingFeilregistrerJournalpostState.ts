import { IError } from 'app/models/types';

interface FordelingFeilregistrerJournalpostState {
    feilregistrerJournalpostError?: IError;
    feilregistrerJournalpostSuccess?: boolean;
}

export default FordelingFeilregistrerJournalpostState;
