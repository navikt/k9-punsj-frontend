import { ApiPath } from 'app/apiConfig';
import { IError, PersonEnkel } from 'app/models/types';
import { convertResponseToError, get, post } from 'app/utils';
import { EksisterendeOMPUTSoknaderActionKeys } from '../../types/EksisterendeOMPUTSoknaderActionKeys';
import { IOMPUTSoknad } from '../../types/OMPUTSoknad';
import { IOMPUTSoknadSvar } from '../../types/OMPUTSoknadSvar';

interface ISetEksisterendeOMPUTSoknaderAction {
    type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_SET;
    eksisterendeOMPUTSoknaderSvar: IOMPUTSoknadSvar;
}

interface IFindEksisterendeOMPUTSoknaderLoadingAction {
    type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_LOAD;
    isLoading: boolean;
}

interface IFindEksisterendeOMPUTSoknaderErrorAction {
    type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_REQUEST_ERROR;
    error: IError;
}

interface IOpenEksisterendeOMPUTSoknadAction {
    type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_OPEN;
    soknadInfo: IOMPUTSoknad;
}

interface ICloseEksisterendeOMPUTSoknadAction {
    type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_CLOSE;
}

interface IChooseOMPUTSoknadAction {
    type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_CHOOSE;
    soknadInfo: IOMPUTSoknad;
}

interface IUndoChoiceOfOMPUTSoknadAction {
    type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_UNDO_CHOICE;
}

interface ICreateOMPUTSoknadRequestAction {
    type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_REQUEST;
}

interface ICreateOMPUTSoknadSuccessAction {
    type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_SUCCESS;
    id: string;
}

interface ICreateOMPUTSoknadErrorAction {
    type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_ERROR;
    error: IError;
}

interface IResetOMPUTSoknadidAction {
    type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNADID_RESET;
}

interface IOpprettOMPUTSoknad {
    journalpostId: string;
    norskIdent: string;
    barn: PersonEnkel[];
}

type IMapperOMPUTActionTypes =
    | ISetEksisterendeOMPUTSoknaderAction
    | IFindEksisterendeOMPUTSoknaderErrorAction
    | IFindEksisterendeOMPUTSoknaderLoadingAction;

type IOMPUTSoknadinfoActionTypes =
    | IOpenEksisterendeOMPUTSoknadAction
    | ICloseEksisterendeOMPUTSoknadAction
    | IChooseOMPUTSoknadAction
    | IUndoChoiceOfOMPUTSoknadAction;

type ICreateOMPUTSoknadActions =
    | ICreateOMPUTSoknadRequestAction
    | ICreateOMPUTSoknadErrorAction
    | ICreateOMPUTSoknadSuccessAction;

export type IEksisterendeOMPUTSoknaderActionTypes =
    | IMapperOMPUTActionTypes
    | IOMPUTSoknadinfoActionTypes
    | ICreateOMPUTSoknadActions
    | IResetOMPUTSoknadidAction;

export function setEksisterendeOMPUTSoknaderAction(
    EksisterendeOMPUTSoknaderSvar: IOMPUTSoknadSvar
): ISetEksisterendeOMPUTSoknaderAction {
    return {
        type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_SET,
        eksisterendeOMPUTSoknaderSvar: EksisterendeOMPUTSoknaderSvar,
    };
}

export function findEksisterendeOMPUTSoknaderLoadingAction(
    isLoading: boolean
): IFindEksisterendeOMPUTSoknaderLoadingAction {
    return {
        type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_LOAD,
        isLoading,
    };
}

export function findEksisterendeOMPUTSoknaderErrorAction(error: IError): IFindEksisterendeOMPUTSoknaderErrorAction {
    return {
        type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_REQUEST_ERROR,
        error,
    };
}

export function findEksisterendeOMPUTSoknader(ident1: string, ident2: string | null) {
    return (dispatch: any) => {
        dispatch(findEksisterendeOMPUTSoknaderLoadingAction(true));
        const idents = ident2 ? `${ident1},${ident2}` : ident1;
        return get(
            ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND,
            undefined,
            { 'X-Nav-NorskIdent': idents },
            (response, soknader) => {
                if (response.ok) {
                    return dispatch(setEksisterendeOMPUTSoknaderAction(soknader));
                }
                return dispatch(findEksisterendeOMPUTSoknaderErrorAction(convertResponseToError(response)));
            }
        );
    };
}

export function openEksisterendeOMPUTSoknadAction(soknadInfo: IOMPUTSoknad): IOpenEksisterendeOMPUTSoknadAction {
    return {
        type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_OPEN,
        soknadInfo,
    };
}

export function closeEksisterendeOMPUTSoknadAction(): ICloseEksisterendeOMPUTSoknadAction {
    return { type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_CLOSE };
}

export function chooseEksisterendeOMPUTSoknadAction(soknadInfo: IOMPUTSoknad): IChooseOMPUTSoknadAction {
    return {
        type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_CHOOSE,
        soknadInfo,
    };
}

export function undoChoiceOfEksisterendeOMPUTSoknadAction(): IUndoChoiceOfOMPUTSoknadAction {
    return {
        type: EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_UNDO_CHOICE,
    };
}

export function createOMPUTSoknadRequestAction(): ICreateOMPUTSoknadRequestAction {
    return { type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_REQUEST };
}

export function createOMPUTSoknadSuccessAction(id: string): ICreateOMPUTSoknadSuccessAction {
    return { type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_SUCCESS, id };
}

export function createOMPUTSoknadErrorAction(error: IError): ICreateOMPUTSoknadErrorAction {
    return { type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_ERROR, error };
}

export function resetOMPUTSoknadidAction(): IResetOMPUTSoknadidAction {
    return { type: EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNADID_RESET };
}

export function createOMPUTSoknad(journalpostid: string, ident1: string, barn: PersonEnkel[]) {
    return (dispatch: any) => {
        dispatch(createOMPUTSoknadRequestAction());

        const requestBody: IOpprettOMPUTSoknad = {
            journalpostId: journalpostid,
            norskIdent: ident1,
            barn,
        };

        post(ApiPath.OMP_UT_SOKNAD_CREATE, undefined, undefined, requestBody, (response, soknad) => {
            if (response.status === 201) {
                return dispatch(createOMPUTSoknadSuccessAction(soknad.soeknadId));
            }
            return dispatch(createOMPUTSoknadErrorAction(convertResponseToError(response)));
        });
    };
}
