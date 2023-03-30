import { ApiPath } from 'app/apiConfig';
import { IError } from 'app/models/types';
import { convertResponseToError, get, post } from 'app/utils';

import { IOpprettSoknad } from '../../../models/types/RequestBodies';
import { EksisterendePLSSoknaderActionKeys } from '../../types/EksisterendePLSSoknaderActionKeys';
import { IPLSSoknad } from '../../types/PLSSoknad';
import { IPLSSoknadSvar } from '../../types/PLSSoknadSvar';

interface ISetEksisterendePLSSoknaderAction {
    type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_SET;
    eksisterendeSoknaderSvar: IPLSSoknadSvar;
}

interface IFindEksisterendePLSSoknaderLoadingAction {
    type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_LOAD;
    isLoading: boolean;
}

interface IFindEksisterendePLSSoknaderErrorAction {
    type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_REQUEST_ERROR;
    error: IError;
}

interface IOpenEksisterendePLSSoknadAction {
    type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_OPEN;
    soknadInfo: IPLSSoknad;
}

interface ICloseEksisterendePLSSoknadAction {
    type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_CLOSE;
}

interface IChoosePLSSoknadAction {
    type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_CHOOSE;
    soknadInfo: IPLSSoknad;
}

interface IUndoChoiceOfPLSSoknadAction {
    type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_UNDO_CHOICE;
}

interface ICreatePLSSoknadRequestAction {
    type: EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_REQUEST;
}

interface ICreatePLSSoknadSuccessAction {
    type: EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_SUCCESS;
    id: string;
}

interface ICreatePLSSoknadErrorAction {
    type: EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_ERROR;
    error: IError;
}

interface IResetPLSSoknadidAction {
    type: EksisterendePLSSoknaderActionKeys.PLS_SOKNADID_RESET;
}

type IMapperPLSActionTypes =
    | ISetEksisterendePLSSoknaderAction
    | IFindEksisterendePLSSoknaderErrorAction
    | IFindEksisterendePLSSoknaderLoadingAction;

type IPLSSoknadinfoActionTypes =
    | IOpenEksisterendePLSSoknadAction
    | ICloseEksisterendePLSSoknadAction
    | IChoosePLSSoknadAction
    | IUndoChoiceOfPLSSoknadAction;

type ICreatePLSSoknadActions =
    | ICreatePLSSoknadRequestAction
    | ICreatePLSSoknadErrorAction
    | ICreatePLSSoknadSuccessAction;

export type IEksisterendePLSSoknaderActionTypes =
    | IMapperPLSActionTypes
    | IPLSSoknadinfoActionTypes
    | ICreatePLSSoknadActions
    | IResetPLSSoknadidAction;

export function setEksisterendePLSSoknaderAction(
    eksisterendeSoknaderSvar: IPLSSoknadSvar,
): ISetEksisterendePLSSoknaderAction {
    return {
        type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_SET,
        eksisterendeSoknaderSvar,
    };
}

export function findEksisterendePLSSoknaderLoadingAction(
    isLoading: boolean,
): IFindEksisterendePLSSoknaderLoadingAction {
    return {
        type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_LOAD,
        isLoading,
    };
}

export function findEksisterendePLSSoknaderErrorAction(error: IError): IFindEksisterendePLSSoknaderErrorAction {
    return {
        type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_REQUEST_ERROR,
        error,
    };
}

export function findEksisterendePLSSoknader(søkerId: string, pleietrengendeId: string | null) {
    return (dispatch: any) => {
        dispatch(findEksisterendePLSSoknaderLoadingAction(true));
        const idents = pleietrengendeId ? `${søkerId},${pleietrengendeId}` : søkerId;
        return get(
            ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND,
            undefined,
            { 'X-Nav-NorskIdent': idents },
            (response, soknader) => {
                if (response.ok) {
                    return dispatch(setEksisterendePLSSoknaderAction(soknader));
                }
                return dispatch(findEksisterendePLSSoknaderErrorAction(convertResponseToError(response)));
            },
        );
    };
}

export function sokEksisterendePLSSoknader(søkerId: string, pleietrengendeId: string | null) {
    return (dispatch: any) => {
        dispatch(findEksisterendePLSSoknaderLoadingAction(true));
        const idents = pleietrengendeId ? `${søkerId},${pleietrengendeId}` : søkerId;
        return get(ApiPath.EKSISTERENDE_SOKNADER_SOK, undefined, { 'X-Nav-NorskIdent': idents }, (response) => {
            if (response.ok) {
                return response.json().then((r) => {
                    const { mapper } = r;
                    dispatch(setEksisterendePLSSoknaderAction(mapper));
                });
            }
            return dispatch(findEksisterendePLSSoknaderErrorAction(convertResponseToError(response)));
        });
    };
}

export function openEksisterendePLSSoknadAction(soknadInfo: IPLSSoknad): IOpenEksisterendePLSSoknadAction {
    return {
        type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_OPEN,
        soknadInfo,
    };
}

export function closeEksisterendePLSSoknadAction(): ICloseEksisterendePLSSoknadAction {
    return { type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_CLOSE };
}

export function chooseEksisterendePLSSoknadAction(soknadInfo: IPLSSoknad): IChoosePLSSoknadAction {
    return {
        type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_CHOOSE,
        soknadInfo,
    };
}

export function undoChoiceOfEksisterendePLSSoknadAction(): IUndoChoiceOfPLSSoknadAction {
    return {
        type: EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_UNDO_CHOICE,
    };
}

export function createPLSSoknadRequestAction(): ICreatePLSSoknadRequestAction {
    return { type: EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_REQUEST };
}

export function createPLSSoknadSuccessAction(id: string): ICreatePLSSoknadSuccessAction {
    return { type: EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_SUCCESS, id };
}

export function createPLSSoknadErrorAction(error: IError): ICreatePLSSoknadErrorAction {
    return { type: EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_ERROR, error };
}

export function resetPLSSoknadidAction(): IResetPLSSoknadidAction {
    return { type: EksisterendePLSSoknaderActionKeys.PLS_SOKNADID_RESET };
}

export function createPLSSoknad(journalpostid: string, søkerId: string, barnIdent: string | null) {
    return (dispatch: any) => {
        dispatch(createPLSSoknadRequestAction());

        const requestBody: IOpprettSoknad = {
            journalpostId: journalpostid,
            norskIdent: søkerId,
            pleietrengendeIdent: barnIdent,
        };

        post(ApiPath.PLS_SOKNAD_CREATE, undefined, undefined, requestBody, (response, soknad) => {
            if (response.status === 201) {
                return dispatch(createPLSSoknadSuccessAction(soknad.soeknadId));
            }
            return dispatch(createPLSSoknadErrorAction(convertResponseToError(response)));
        });
    };
}
