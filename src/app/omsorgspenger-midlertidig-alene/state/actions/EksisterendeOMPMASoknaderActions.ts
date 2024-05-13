import { ApiPath } from 'app/apiConfig';
import { IError } from 'app/models/types';
import { convertResponseToError, get, post } from 'app/utils';

import { EksisterendeOMPMASoknaderActionKeys } from '../../types/EksisterendeOMPMASoknaderActionKeys';
import { IOMPMASoknad } from '../../types/OMPMASoknad';
import { IOMPMASoknadSvar } from '../../types/OMPMASoknadSvar';

interface ISetEksisterendeOMPMASoknaderAction {
    type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_SET;
    eksisterendeOMPMASoknaderSvar: IOMPMASoknadSvar;
}

interface IFindEksisterendeOMPMASoknaderLoadingAction {
    type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_LOAD;
    isLoading: boolean;
}

interface IFindEksisterendeOMPMASoknaderErrorAction {
    type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_REQUEST_ERROR;
    error: IError;
}

interface IOpenEksisterendeOMPMASoknadAction {
    type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_OPEN;
    soknadInfo: IOMPMASoknad;
}

interface ICloseEksisterendeOMPMASoknadAction {
    type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_CLOSE;
}

interface IChooseOMPMASoknadAction {
    type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_CHOOSE;
    soknadInfo: IOMPMASoknad;
}

interface IUndoChoiceOfOMPMASoknadAction {
    type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_UNDO_CHOICE;
}

interface ICreateOMPMASoknadRequestAction {
    type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_REQUEST;
}

interface ICreateOMPMASoknadSuccessAction {
    type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_SUCCESS;
    id: string;
}

interface ICreateOMPMASoknadErrorAction {
    type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_ERROR;
    error: IError;
}

interface IResetOMPMASoknadidAction {
    type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNADID_RESET;
}

interface IOpprettMASoknad {
    journalpostId: string;
    norskIdent: string;
    annenPart: string;
    barn: string[];
    k9saksnummer?: string;
}

type IMapperOMPMAActionTypes =
    | ISetEksisterendeOMPMASoknaderAction
    | IFindEksisterendeOMPMASoknaderErrorAction
    | IFindEksisterendeOMPMASoknaderLoadingAction;

type IOMPMASoknadinfoActionTypes =
    | IOpenEksisterendeOMPMASoknadAction
    | ICloseEksisterendeOMPMASoknadAction
    | IChooseOMPMASoknadAction
    | IUndoChoiceOfOMPMASoknadAction;

type ICreateOMPMASoknadActions =
    | ICreateOMPMASoknadRequestAction
    | ICreateOMPMASoknadErrorAction
    | ICreateOMPMASoknadSuccessAction;

export type IEksisterendeOMPMASoknaderActionTypes =
    | IMapperOMPMAActionTypes
    | IOMPMASoknadinfoActionTypes
    | ICreateOMPMASoknadActions
    | IResetOMPMASoknadidAction;

export function setEksisterendeOMPMASoknaderAction(
    EksisterendeOMPMASoknaderSvar: IOMPMASoknadSvar,
): ISetEksisterendeOMPMASoknaderAction {
    return {
        type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_SET,
        eksisterendeOMPMASoknaderSvar: EksisterendeOMPMASoknaderSvar,
    };
}

export function findEksisterendeOMPMASoknaderLoadingAction(
    isLoading: boolean,
): IFindEksisterendeOMPMASoknaderLoadingAction {
    return {
        type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_LOAD,
        isLoading,
    };
}

export function findEksisterendeOMPMASoknaderErrorAction(error: IError): IFindEksisterendeOMPMASoknaderErrorAction {
    return {
        type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_REQUEST_ERROR,
        error,
    };
}

export function findEksisterendeOMPMASoknader(søkerId: string) {
    return (dispatch: any) => {
        dispatch(findEksisterendeOMPMASoknaderLoadingAction(true));
        const idents = søkerId;
        return get(
            ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND,
            undefined,
            { 'X-Nav-NorskIdent': idents },
            (response, soknader) => {
                if (response.ok) {
                    return dispatch(setEksisterendeOMPMASoknaderAction(soknader));
                }
                return dispatch(findEksisterendeOMPMASoknaderErrorAction(convertResponseToError(response)));
            },
        );
    };
}

export function openEksisterendeOMPMASoknadAction(soknadInfo: IOMPMASoknad): IOpenEksisterendeOMPMASoknadAction {
    return {
        type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_OPEN,
        soknadInfo,
    };
}

export function closeEksisterendeOMPMASoknadAction(): ICloseEksisterendeOMPMASoknadAction {
    return { type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_CLOSE };
}

export function chooseEksisterendeOMPMASoknadAction(soknadInfo: IOMPMASoknad): IChooseOMPMASoknadAction {
    return {
        type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_CHOOSE,
        soknadInfo,
    };
}

export function undoChoiceOfEksisterendeOMPMASoknadAction(): IUndoChoiceOfOMPMASoknadAction {
    return {
        type: EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_UNDO_CHOICE,
    };
}

export function createOMPMASoknadRequestAction(): ICreateOMPMASoknadRequestAction {
    return { type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_REQUEST };
}

export function createOMPMASoknadSuccessAction(id: string): ICreateOMPMASoknadSuccessAction {
    return { type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_SUCCESS, id };
}

export function createOMPMASoknadErrorAction(error: IError): ICreateOMPMASoknadErrorAction {
    return { type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_ERROR, error };
}

export function resetOMPMASoknadidAction(): IResetOMPMASoknadidAction {
    return { type: EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNADID_RESET };
}

export function createOMPMASoknad(journalpostid: string, søkerId: string, annenPart: string, k9saksnummer?: string) {
    return (dispatch: any) => {
        dispatch(createOMPMASoknadRequestAction());

        const requestBody: IOpprettMASoknad = {
            journalpostId: journalpostid,
            norskIdent: søkerId,
            annenPart,
            // 07.05.2022 barn kan fjernes etter backend tillater opprettelse av søknad uten
            barn: [],
            k9saksnummer,
        };

        post(ApiPath.OMP_MA_SOKNAD_CREATE, undefined, undefined, requestBody, (response, soknad) => {
            if (response.status === 201) {
                return dispatch(createOMPMASoknadSuccessAction(soknad.soeknadId));
            }
            return dispatch(createOMPMASoknadErrorAction(convertResponseToError(response)));
        });
    };
}
