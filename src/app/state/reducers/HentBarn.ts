import { get} from "../../utils";
import {ApiPath} from "../../apiConfig";
import {IBarn} from "../../models/types/Barn";

export enum ActiontypesHentBarn {
    HENTBARN_SUCCESS = 'FELLES/HENTBARN_SUCCESS',
    HENTBARN_FORBIDDEN = 'FELLES/HENTBARN_FORBIDDEN',
    HENTBARN_ERROR = 'FELLES/HENTBARN_ERROR',
    HENTBARN_REQUEST = 'FELLES/HENTBARN_REQUEST'
}

export interface IHentBarnForbiddenAction {type: ActiontypesHentBarn.HENTBARN_FORBIDDEN;}
export interface IHentBarnSuccessAction {type: ActiontypesHentBarn.HENTBARN_SUCCESS; barn: IBarn[];}
export interface IHentBarnRequestAction {type: ActiontypesHentBarn.HENTBARN_REQUEST;}
export interface IHentBarnErrorAction {type: ActiontypesHentBarn.HENTBARN_ERROR;}

export function getHentBarnForbiddenAction(): IHentBarnForbiddenAction {
    return { type: ActiontypesHentBarn.HENTBARN_FORBIDDEN };
}

export function getHentBarnRequestAction(): IHentBarnRequestAction {
    return { type: ActiontypesHentBarn.HENTBARN_REQUEST };
}

export function getHentBarnSuccessAction(barn: IBarn[]): IHentBarnSuccessAction {
    return { type: ActiontypesHentBarn.HENTBARN_SUCCESS, barn };
}

export function getHentBarnErrorAction(): IHentBarnErrorAction {
    return { type: ActiontypesHentBarn.HENTBARN_ERROR };
}

export function hentBarn(norskIdent: string) {
    return (dispatch: any) => {
        dispatch(getHentBarnRequestAction());
        return get(ApiPath.BARN_GET, { norskIdent }, {'X-Nav-NorskIdent': norskIdent}, (response, barn) => {
                switch (response.status) {
                    case 200: return dispatch(getHentBarnSuccessAction(barn.barn));
                    case 403: return dispatch(getHentBarnForbiddenAction());
                    default: return dispatch(getHentBarnErrorAction());
                }
            }
        );
    };
}