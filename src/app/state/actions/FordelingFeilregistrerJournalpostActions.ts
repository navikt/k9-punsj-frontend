import { ApiPath } from 'app/apiConfig';
import FordelingFeilregistrerJournalpostKeys from 'app/models/enums/FordelingFeilregistrerJournalpostKeys';
import { IError } from 'app/models/types';
import { convertResponseToError, post } from 'app/utils';

interface IFeilregistrerJournalpostAction {
    type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER;
}

interface IFeilregistrerJournalpostSuccessAction {
    type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_SUCCESS;
}
interface IFeilregistrerJournalpostErrorAction {
    type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_ERROR;
    error: IError;
}

interface IFeilregistrerJournalpostResetAction {
    type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_RESET;
}

export function feilregistrerJournalpostAction(): IFeilregistrerJournalpostAction {
    return { type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER };
}
export function feilregistrerJournalpostSuccessAction(): IFeilregistrerJournalpostSuccessAction {
    return {
        type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_SUCCESS,
    };
}
export function feilregistrerJournalpostErrorAction(error: IError): IFeilregistrerJournalpostErrorAction {
    return {
        type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_ERROR,
        error,
    };
}

export function feilregistrerJournalpostResetAction(): IFeilregistrerJournalpostResetAction {
    return {
        type: FordelingFeilregistrerJournalpostKeys.JOURNALPOST_FEILREGISTRER_RESET,
    };
}

export function feilregistrerJournalpost(journalpostid: string) {
    return (dispatch: any) => {
        dispatch(feilregistrerJournalpostAction());
        return post(ApiPath.JOURNALPOST_UTGÅTT, { journalpostId: journalpostid }, undefined, undefined, (response) => {
            if (response.ok) {
                return dispatch(feilregistrerJournalpostSuccessAction());
            }
            return dispatch(feilregistrerJournalpostErrorAction(convertResponseToError(response)));
        });
    };
}

export type FordelingFeilregistrerJournalpostActions =
    | IFeilregistrerJournalpostAction
    | IFeilregistrerJournalpostSuccessAction
    | IFeilregistrerJournalpostErrorAction
    | IFeilregistrerJournalpostResetAction;
