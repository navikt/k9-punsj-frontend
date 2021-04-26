import {IError, IJournalpost} from "../../models/types";
import {JournalposterPerIdentActionKeys} from "../../models/enums/JournalposterPerIdentActionKeys";
import {convertResponseToError, get, post} from "../../utils";
import {ApiPath} from "../../apiConfig";
import {IHentSoknad} from "../../models/types/HentSoknad";
import {findSoknaderErrorAction, findSoknaderLoadingAction, setSoknaderAction} from "./SoknaderVisningActions";

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

export type IJournalposterPerIdentActions =
    ISetJournalposterPerIdentAction
    | IGetJournalposterPerIdentLoadAction
    | IGetJournalposterPerIdentErrorAction;

export function setJournalposterPerIdentAction(
    journalposter: IJournalpost[]
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
            undefined, {'X-Nav-NorskIdent': norskIdent}, requestBody, (response, journalposter) => {
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
