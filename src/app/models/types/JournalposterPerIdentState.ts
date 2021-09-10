import { IError } from 'app/models/types/Error';
import { IJournalpost, IJournalpostInfo } from './Journalpost';

export interface IJournalposterPerIdentState {
    journalposter: IJournalpostInfo[];
    isJournalposterLoading?: boolean;
    journalposterRequestError?: IError;
}
