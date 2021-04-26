import {IError}  from 'app/models/types/Error';
import {IJournalpost} from "./Journalpost";

export interface IJournalposterPerIdentState {
    journalposter:                      IJournalpost[];
    isJournalposterLoading?:            boolean;
    journalposterRequestError?:         IError;
}
