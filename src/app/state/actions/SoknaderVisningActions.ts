import { ApiPath } from '../../apiConfig';
import { SoknaderVisningActionKeys } from '../../models/enums/SoknaderVisningActionKeys';
import { IError } from '../../models/types';
import { IPSBSoknad } from '../../models/types/PSBSoknad';
import { IHentSoknad } from '../../models/types/RequestBodies';
import { convertResponseToError, post } from '../../utils';

interface ISetSoknaderAction {
    type: SoknaderVisningActionKeys.SOKNADER_SET;
    soknadSvar: IPSBSoknad[];
}
interface IFindSoknaderLoadingAction {
    type: SoknaderVisningActionKeys.SOKNADER_LOAD;
    isLoading: boolean;
}
interface IFindSoknaderErrorAction {
    type: SoknaderVisningActionKeys.SOKNADER_REQUEST_ERROR;
    error: IError;
}
interface IFindSoknaderForbiddenErrorAction {
    type: SoknaderVisningActionKeys.SOKNADER_FORBIDDEN_ERROR;
    isForbidden: boolean;
}

interface IOpenSoknadAction {
    type: SoknaderVisningActionKeys.SOKNAD_OPEN;
    soknad: IPSBSoknad;
}
interface ICloseSoknadAction {
    type: SoknaderVisningActionKeys.SOKNAD_CLOSE;
}
interface IChooseSoknadAction {
    type: SoknaderVisningActionKeys.SOKNAD_CHOOSE;
    soknad: IPSBSoknad;
}
interface IUndoChoiceOfSoknadAction {
    type: SoknaderVisningActionKeys.SOKNAD_UNDO_CHOICE;
}

export function openSoknadAction(soknad: IPSBSoknad): IOpenSoknadAction {
    return { type: SoknaderVisningActionKeys.SOKNAD_OPEN, soknad };
}
export function closeSoknadAction(): ICloseSoknadAction {
    return { type: SoknaderVisningActionKeys.SOKNAD_CLOSE };
}
export function chooseSoknadAction(soknad: IPSBSoknad): IChooseSoknadAction {
    return { type: SoknaderVisningActionKeys.SOKNAD_CHOOSE, soknad };
}
export function undoChoiceOfSoknadAction(): IUndoChoiceOfSoknadAction {
    return { type: SoknaderVisningActionKeys.SOKNAD_UNDO_CHOICE };
}

export function resetSoknadidAction(): IResetSoknadidAction {
    return { type: SoknaderVisningActionKeys.SOKNADID_RESET };
}

type ISoknaderActionTypes =
    | ISetSoknaderAction
    | IFindSoknaderErrorAction
    | IFindSoknaderLoadingAction
    | IFindSoknaderForbiddenErrorAction;
type ISoknadinfoActionTypes = IOpenSoknadAction | ICloseSoknadAction | IChooseSoknadAction | IUndoChoiceOfSoknadAction;

export type ISoknaderVisningActionTypes = ISoknaderActionTypes | ISoknadinfoActionTypes | IResetSoknadidAction;

export function setSoknaderAction(soknadSvar: IPSBSoknad[]): ISetSoknaderAction {
    return { type: SoknaderVisningActionKeys.SOKNADER_SET, soknadSvar };
}
export function findSoknaderLoadingAction(isLoading: boolean): IFindSoknaderLoadingAction {
    return { type: SoknaderVisningActionKeys.SOKNADER_LOAD, isLoading };
}
export function findSoknaderErrorAction(error: IError): IFindSoknaderErrorAction {
    return { type: SoknaderVisningActionKeys.SOKNADER_REQUEST_ERROR, error };
}

interface IResetSoknadidAction {
    type: SoknaderVisningActionKeys.SOKNADID_RESET;
}

export function sokPsbSoknader(ident: string) {
    return (dispatch: any) => {
        const requestBody: IHentSoknad = {
            norskIdent: ident,
        };
        dispatch(findSoknaderLoadingAction(true));
        return post(
            ApiPath.PSB_MAPPE_SOK,
            undefined,
            { 'X-Nav-NorskIdent': ident },
            requestBody,
            (response, soknadSvar) => {
                if (response.ok) {
                    return dispatch(setSoknaderAction(soknadSvar));
                }
                return dispatch(findSoknaderErrorAction(convertResponseToError(response)));
            },
        );
    };
}
