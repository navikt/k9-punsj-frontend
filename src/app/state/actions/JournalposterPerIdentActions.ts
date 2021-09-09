import {IError, IJournalpostInfo} from "../../models/types";
import {JournalposterPerIdentActionKeys} from "../../models/enums/Journalpost/JournalposterPerIdentActionKeys";
import {convertResponseToError, get, post} from "../../utils";
import {ApiPath} from "../../apiConfig";
import {IHentSoknad} from "../../models/types/RequestBodies";

interface ISetJournalposterPerIdentAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_SET;
    journalposter: IJournalpostInfo[];
}

interface IGetJournalposterPerIdentLoadAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_LOAD,
    isLoading: boolean
}

interface IGetJournalposterPerIdentErrorAction {
    type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_REQUEST_ERROR;
    error: IError;
}

export type IJournalposterPerIdentActions =
    ISetJournalposterPerIdentAction
    | IGetJournalposterPerIdentLoadAction
    | IGetJournalposterPerIdentErrorAction;

export function setJournalposterPerIdentAction(
    journalposter: IJournalpostInfo[]
): ISetJournalposterPerIdentAction {
    return {type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_SET, journalposter};
}

export function getJournalposterPerIdentLoadAction(isLoading: boolean): IGetJournalposterPerIdentLoadAction {
    return {type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_LOAD, isLoading};
}

export function getJournalposterPerIdentErrorAction(
    error: IError
): IGetJournalposterPerIdentErrorAction {
    return {type: JournalposterPerIdentActionKeys.JOURNALPOSTER_PER_IDENT_REQUEST_ERROR, error};
}

export function hentAlleJournalposterForIdent(norskIdent: string) {
    const requestBody: IHentSoknad = {norskIdent}
    return (dispatch: any) => {
        dispatch(getJournalposterPerIdentLoadAction(true));
        return post(
            ApiPath.JOURNALPOST_HENT,
            undefined, {'X-Nav-NorskIdent': norskIdent}, requestBody, (response, svar) => {
                if (response.ok) {
                    return dispatch(setJournalposterPerIdentAction(svar.poster));
                }
                return dispatch(
                    getJournalposterPerIdentErrorAction(convertResponseToError(response))
                );
            }
        );
    };
}
