import {PunchStep}    from 'app/models/enums';
import {IJournalpost} from 'app/models/types';
import {IError}       from './Error';

export interface IPunchState {
    step:                       PunchStep;
    ident:                      string;
    journalpost?:               IJournalpost;
    isJournalpostLoading?:      boolean;
    journalpostRequestError?:   IError;
}