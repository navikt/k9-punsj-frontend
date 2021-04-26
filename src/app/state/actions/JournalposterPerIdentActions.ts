import {IError, IJournalpost} from "../../models/types";
import {JournalposterPerIdentActionKeys} from "../../models/enums/JournalposterPerIdentActionKeys";
import {convertResponseToError, get} from "../../utils";
import {ApiPath} from "../../apiConfig";

interface ISetJournalposterPerIdentAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_SET;
    journalposter: IJournalpost[];
}
interface IGetJournalposterPerIdentLoadAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_LOAD,
    isLoading: boolean
}

interface IGetJournalposterPerIdentErrorAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_REQUEST_ERROR;
    error: IError;
}

export type IJournalposterPerIdentActions = ISetJournalposterPerIdentAction | IGetJournalposterPerIdentLoadAction | IGetJournalposterPerIdentErrorAction;

export function setJournalposterPerIdentAction(
    journalposter: IJournalpost[]
): ISetJournalposterPerIdentAction {
    return { type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_SET, journalposter };
}
export function getJournalposterPerIdentLoadAction(isLoading: boolean): IGetJournalposterPerIdentLoadAction {
    return { type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_LOAD, isLoading };
}
export function getJournalposterPerIdentErrorAction(
    error: IError
): IGetJournalposterPerIdentErrorAction {
    return { type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_REQUEST_ERROR, error };
}


export function hentAlleJournalposterForIdent(norskIdent: string) {
    return (dispatch: any) => {
        dispatch(getJournalposterPerIdentLoadAction(true));
        return get(
            ApiPath.JOURNALPOST_HENT,
            { norskIdent },
            undefined,
            (response, journalposter) => {
                if (response.ok) {
                    return dispatch(setJournalposterPerIdentAction(journalposter));
                }
                return dispatch(
                    getJournalposterPerIdentErrorAction(convertResponseToError(response))
                );
            }
        );
    };
}
