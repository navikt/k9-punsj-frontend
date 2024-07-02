import { ApiPath } from 'app/apiConfig';
import { IError } from 'app/models/types';
import { convertResponseToError, get, post } from 'app/utils';

import { IOpprettSoknad } from 'app/models/types/RequestBodies';
import { EksisterendeOMPKSSoknaderActionKeys } from '../../types/EksisterendeOMPKSSoknaderActionKeys';
import { IOMPKSSoknad } from '../../types/OMPKSSoknad';
import { IOMPKSSoknadSvar } from '../../types/OMPKSSoknadSvar';

interface ISetEksisterendeOMPKSSoknaderAction {
    type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_SET;
    eksisterendeOMPKSSoknaderSvar: IOMPKSSoknadSvar;
}

interface IFindEksisterendeOMPKSSoknaderLoadingAction {
    type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_LOAD;
    isLoading: boolean;
}

interface IFindEksisterendeOMPKSSoknaderErrorAction {
    type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_REQUEST_ERROR;
    error: IError;
}

interface IOpenEksisterendeOMPKSSoknadAction {
    type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_OPEN;
    soknadInfo: IOMPKSSoknad;
}

interface ICloseEksisterendeOMPKSSoknadAction {
    type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CLOSE;
}

interface IChooseOMPKSSoknadAction {
    type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CHOOSE;
    soknadInfo: IOMPKSSoknad;
}

interface IUndoChoiceOfOMPKSSoknadAction {
    type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_UNDO_CHOICE;
}

interface ICreateOMPKSSoknadRequestAction {
    type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_REQUEST;
}

interface ICreateOMPKSSoknadSuccessAction {
    type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_SUCCESS;
    id: string;
}

interface ICreateOMPKSSoknadErrorAction {
    type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_ERROR;
    error: IError;
}

interface IResetOMPKSSoknadidAction {
    type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNADID_RESET;
}

type IMapperOMPKSActionTypes =
    | ISetEksisterendeOMPKSSoknaderAction
    | IFindEksisterendeOMPKSSoknaderErrorAction
    | IFindEksisterendeOMPKSSoknaderLoadingAction;

type IOMPKSSoknadinfoActionTypes =
    | IOpenEksisterendeOMPKSSoknadAction
    | ICloseEksisterendeOMPKSSoknadAction
    | IChooseOMPKSSoknadAction
    | IUndoChoiceOfOMPKSSoknadAction;

type ICreateOMPKSSoknadActions =
    | ICreateOMPKSSoknadRequestAction
    | ICreateOMPKSSoknadErrorAction
    | ICreateOMPKSSoknadSuccessAction;

export type IEksisterendeOMPKSSoknaderActionTypes =
    | IMapperOMPKSActionTypes
    | IOMPKSSoknadinfoActionTypes
    | ICreateOMPKSSoknadActions
    | IResetOMPKSSoknadidAction;

export function setEksisterendeOMPKSSoknaderAction(
    EksisterendeOMPKSSoknaderSvar: IOMPKSSoknadSvar,
): ISetEksisterendeOMPKSSoknaderAction {
    return {
        type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_SET,
        eksisterendeOMPKSSoknaderSvar: EksisterendeOMPKSSoknaderSvar,
    };
}

export function findEksisterendeOMPKSSoknaderLoadingAction(
    isLoading: boolean,
): IFindEksisterendeOMPKSSoknaderLoadingAction {
    return {
        type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_LOAD,
        isLoading,
    };
}

export function findEksisterendeOMPKSSoknaderErrorAction(error: IError): IFindEksisterendeOMPKSSoknaderErrorAction {
    return {
        type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_REQUEST_ERROR,
        error,
    };
}

export function findEksisterendeOMPKSSoknader(søkerId: string, pleietrengendeId: string | null) {
    return (dispatch: any) => {
        dispatch(findEksisterendeOMPKSSoknaderLoadingAction(true));
        const idents = pleietrengendeId ? `${søkerId},${pleietrengendeId}` : søkerId;
        return get(
            ApiPath.OMP_KS_EKSISTERENDE_SOKNADER_FIND,
            undefined,
            { 'X-Nav-NorskIdent': idents },
            (response, soknader) => {
                if (response.ok) {
                    return dispatch(setEksisterendeOMPKSSoknaderAction(soknader));
                }
                return dispatch(findEksisterendeOMPKSSoknaderErrorAction(convertResponseToError(response)));
            },
        );
    };
}

export function openEksisterendeOMPKSSoknadAction(soknadInfo: IOMPKSSoknad): IOpenEksisterendeOMPKSSoknadAction {
    return {
        type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_OPEN,
        soknadInfo,
    };
}

export function closeEksisterendeOMPKSSoknadAction(): ICloseEksisterendeOMPKSSoknadAction {
    return { type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CLOSE };
}

export function chooseEksisterendeOMPKSSoknadAction(soknadInfo: IOMPKSSoknad): IChooseOMPKSSoknadAction {
    return {
        type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CHOOSE,
        soknadInfo,
    };
}

export function undoChoiceOfEksisterendeOMPKSSoknadAction(): IUndoChoiceOfOMPKSSoknadAction {
    return {
        type: EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_UNDO_CHOICE,
    };
}

export function createOMPKSSoknadRequestAction(): ICreateOMPKSSoknadRequestAction {
    return { type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_REQUEST };
}

export function createOMPKSSoknadSuccessAction(id: string): ICreateOMPKSSoknadSuccessAction {
    return { type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_SUCCESS, id };
}

export function createOMPKSSoknadErrorAction(error: IError): ICreateOMPKSSoknadErrorAction {
    return { type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_ERROR, error };
}

export function resetOMPKSSoknadidAction(): IResetOMPKSSoknadidAction {
    return { type: EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNADID_RESET };
}

export function createOMPKSSoknad(
    journalpostid: string,
    søkerId: string,
    barnIdent: string | null,
    k9saksnummer?: string,
) {
    return (dispatch: any) => {
        dispatch(createOMPKSSoknadRequestAction());

        const requestBody: IOpprettSoknad = {
            journalpostId: journalpostid,
            norskIdent: søkerId,
            pleietrengendeIdent: barnIdent,
            k9saksnummer,
        };

        post(ApiPath.OMP_KS_SOKNAD_CREATE, undefined, undefined, requestBody, (response, soknad) => {
            if (response.status === 201) {
                return dispatch(createOMPKSSoknadSuccessAction(soknad.soeknadId));
            }
            return dispatch(createOMPKSSoknadErrorAction(convertResponseToError(response)));
        });
    };
}
