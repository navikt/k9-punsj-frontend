import { ApiPath } from 'app/apiConfig';
import FordelingFerdigstillJournalpostKeys from 'app/models/enums/FordelingFerdigstillJournalpostKeys';
import { IError } from 'app/models/types';
import { convertResponseToError, post } from 'app/utils';
import { IResetStateAction } from './GlobalActions';

interface IFerdigstillJournalpostAction {
    type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL;
}

interface IFerdigstillJournalpostSuccessAction {
    type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_SUCCESS;
}
interface IFerdigstillJournalpostErrorAction {
    type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_ERROR;
    error: IError;
}

interface IFerdigstillJournalpostResetAction {
    type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_RESET;
}

export function ferdigstillJournalpostAction(): IFerdigstillJournalpostAction {
    return { type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL };
}
export function ferdigstillJournalpostSuccessAction(): IFerdigstillJournalpostSuccessAction {
    return {
        type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_SUCCESS,
    };
}
export function ferdigstillJournalpostErrorAction(error: IError): IFerdigstillJournalpostErrorAction {
    return {
        type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_ERROR,
        error,
    };
}

export function ferdigstillJournalpostResetAction(): IFerdigstillJournalpostResetAction {
    return {
        type: FordelingFerdigstillJournalpostKeys.JOURNALPOST_FERDIGSTILL_RESET,
    };
}

export function ferdigstillJournalpost(journalpostid: string, søkerId: string) {
    return (dispatch: any) => {
        dispatch(ferdigstillJournalpostAction());
        return post(
            ApiPath.JOURNALPOST_FERDIGSTILL,
            undefined,
            undefined,
            { journalpostId: journalpostid, norskIdent: søkerId },
            (response) => {
                if (response.ok) {
                    return dispatch(ferdigstillJournalpostSuccessAction());
                }
                return dispatch(ferdigstillJournalpostErrorAction(convertResponseToError(response)));
            },
        );
    };
}

export type FordelingFerdigstillJournalpostActions =
    | IFerdigstillJournalpostAction
    | IFerdigstillJournalpostSuccessAction
    | IFerdigstillJournalpostErrorAction
    | IFerdigstillJournalpostResetAction
    | IResetStateAction;
