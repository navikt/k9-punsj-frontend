import { IError } from 'app/models/types/Error';

import { IJournalpostInfo } from './Journalpost';

export interface IJournalposterPerIdentState {
    journalposter: IJournalpostInfo[];
    isJournalposterLoading?: boolean;
    journalposterRequestError?: IError;
}

export interface IAlleJournalposterPerIdent {
    poster: IJournalpostInfo[];
}
