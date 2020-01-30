import {PunchStep}    from 'app/models/enums';
import {IJournalpost} from 'app/models/types';
import {IError}       from './Error';

export interface IPunchState {
    step:                       PunchStep;
    ident1:                     string;
    ident2:                     string | null;
    journalpost?:               IJournalpost;
    isJournalpostLoading?:      boolean;
    journalpostRequestError?:   IError;
}