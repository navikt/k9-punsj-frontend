import { ApiPath } from '../../apiConfig';
import { JournalposterPerIdentActionKeys } from '../../models/enums/Journalpost/JournalposterPerIdentActionKeys';
import { IError, IJournalpostInfo } from '../../models/types';
import { IHentSoknad } from '../../models/types/RequestBodies';
import { convertResponseToError, get, post } from '../../utils';

interface ISetJournalposterPerIdentAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_SET;
    journalposter: IJournalpostInfo[];
}

interface IGetJournalposterPerIdentLoadAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_LOAD;
    isLoading: boolean;
}

interface IGetJournalposterPerIdentErrorAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_REQUEST_ERROR;
    error: IError;
}

export type IJournalposterPerIdentActions =
    | ISetJournalposterPerIdentAction
    | IGetJournalposterPerIdentLoadAction
    | IGetJournalposterPerIdentErrorAction;

export function setJournalposterPerIdentAction(journalposter: IJournalpostInfo[]): ISetJournalposterPerIdentAction {
    return {
        type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_SET,
        journalposter,
    };
}

export function getJournalposterPerIdentLoadAction(isLoading: boolean): IGetJournalposterPerIdentLoadAction {
    return {
        type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_LOAD,
        isLoading,
    };
}

export function getJournalposterPerIdentErrorAction(error: IError): IGetJournalposterPerIdentErrorAction {
    return {
        type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_REQUEST_ERROR,
        error,
    };
}
