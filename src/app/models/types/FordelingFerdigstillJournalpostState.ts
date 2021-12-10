import { IError } from 'app/models/types';

interface FordelingFerdigstillJournalpostState {
    ferdigstillJournalpostError?: IError;
    ferdigstillJournalpostSuccess?: boolean;
}

export default FordelingFerdigstillJournalpostState;
