import { ApiPath } from 'app/apiConfig';
import FordelingSettPåVentKeys from 'app/models/enums/FordelingSettPåVentKeys';
import { IError } from 'app/models/types';
import { convertResponseToError, post } from 'app/utils';

interface ISettJournalpostPaaVentAction {
    type: FordelingSettPåVentKeys.JOURNALPOST_SETT_PAA_VENT;
}

interface ISettJournalpostPaaVentSuccessAction {
    type: FordelingSettPåVentKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_SUCCESS;
}
interface ISettJournalpostPaaVentErrorAction {
    type: FordelingSettPåVentKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_ERROR;
    error: IError;
}

interface ISettJournalpostPaaVentResetAction {
    type: FordelingSettPåVentKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_RESET;
}

export function setJournalpostPaaVentAction(): ISettJournalpostPaaVentAction {
    return { type: FordelingSettPåVentKeys.JOURNALPOST_SETT_PAA_VENT };
}
export function setJournalpostPaaVentSuccessAction(): ISettJournalpostPaaVentSuccessAction {
    return {
        type: FordelingSettPåVentKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_SUCCESS,
    };
}
export function setJournalpostPaaVentErrorAction(error: IError): ISettJournalpostPaaVentErrorAction {
    return {
        type: FordelingSettPåVentKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_ERROR,
        error,
    };
}

export function setJournalpostPaaVentResetAction(): ISettJournalpostPaaVentResetAction {
    return {
        type: FordelingSettPåVentKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_RESET,
    };
}

export function settJournalpostPaaVent(journalpostid: string) {
    return (dispatch: any) => {
        dispatch(setJournalpostPaaVentAction());
        return post(
            ApiPath.JOURNALPOST_SETT_PAA_VENT,
            { journalpostId: journalpostid },
            undefined,
            undefined,
            (response) => {
                if (response.ok) {
                    return dispatch(setJournalpostPaaVentSuccessAction());
                }
                return dispatch(setJournalpostPaaVentErrorAction(convertResponseToError(response)));
            }
        );
    };
}

export type FordeingSettPåVentActions =
    | ISettJournalpostPaaVentAction
    | ISettJournalpostPaaVentSuccessAction
    | ISettJournalpostPaaVentErrorAction
    | ISettJournalpostPaaVentResetAction;
