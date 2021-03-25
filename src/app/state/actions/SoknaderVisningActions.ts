import {IError} from "../../models/types";
import {SoknaderVisningActionKeys} from "../../models/enums/SoknaderVisningActionKeys";
import {IHentSoknad, ISoknadPeriode} from "../../models/types/HentSoknad";
import {convertResponseToError, post} from "../../utils";
import {ApiPath} from "../../apiConfig";
import {ISoknadV2} from "../../models/types/Soknadv2";

interface ISetSoknaderAction                  {type: SoknaderVisningActionKeys.SOKNADER_SET, soknadSvar: ISoknadV2[]}
interface IFindSoknaderLoadingAction          {type: SoknaderVisningActionKeys.SOKNADER_LOAD, isLoading: boolean}
interface IFindSoknaderErrorAction            {type: SoknaderVisningActionKeys.SOKNADER_REQUEST_ERROR, error: IError}
interface IFindSoknaderForbiddenErrorAction   {type: SoknaderVisningActionKeys.SOKNADER_FORBIDDEN_ERROR, isForbidden: boolean}

interface IOpenSoknadAction                  {type: SoknaderVisningActionKeys.SOKNAD_OPEN, soknad: ISoknadV2}
interface ICloseSoknadAction                 {type: SoknaderVisningActionKeys.SOKNAD_CLOSE}
interface IChooseSoknadAction                {type: SoknaderVisningActionKeys.SOKNAD_CHOOSE, soknad: ISoknadV2}
interface IUndoChoiceOfSoknadAction          {type: SoknaderVisningActionKeys.SOKNAD_UNDO_CHOICE}

export function openSoknadAction(soknad: ISoknadV2):                 IOpenSoknadAction                {return {type: SoknaderVisningActionKeys.SOKNAD_OPEN, soknad}}
export function closeSoknadAction():                             ICloseSoknadAction               {return {type: SoknaderVisningActionKeys.SOKNAD_CLOSE}}
export function chooseSoknadAction(soknad: ISoknadV2):               IChooseSoknadAction              {return {type: SoknaderVisningActionKeys.SOKNAD_CHOOSE, soknad}}
export function undoChoiceOfSoknadAction():                      IUndoChoiceOfSoknadAction        {return {type: SoknaderVisningActionKeys.SOKNAD_UNDO_CHOICE}}

export function resetSoknadidAction():                           IResetSoknadidAction             {return {type: SoknaderVisningActionKeys.SOKNADID_RESET}}

type        ISoknaderActionTypes      = ISetSoknaderAction | IFindSoknaderErrorAction | IFindSoknaderLoadingAction | IFindSoknaderForbiddenErrorAction;
type        ISoknadinfoActionTypes   = IOpenSoknadAction | ICloseSoknadAction | IChooseSoknadAction | IUndoChoiceOfSoknadAction;

export type ISoknaderVisningActionTypes = ISoknaderActionTypes | ISoknadinfoActionTypes | IResetSoknadidAction;

export function setSoknaderAction(soknadSvar: ISoknadV2[]):              ISetSoknaderAction                 {return {type: SoknaderVisningActionKeys.SOKNADER_SET, soknadSvar}}
export function findSoknaderLoadingAction(isLoading: boolean):    IFindSoknaderLoadingAction                {return {type: SoknaderVisningActionKeys.SOKNADER_LOAD, isLoading}}
export function findSoknaderErrorAction(error: IError):           IFindSoknaderErrorAction                  {return {type: SoknaderVisningActionKeys.SOKNADER_REQUEST_ERROR, error}}
export function findSoknaderForbiddenErrorAction(isForbidden: boolean):           IFindSoknaderForbiddenErrorAction             {return {type: SoknaderVisningActionKeys.SOKNADER_FORBIDDEN_ERROR, isForbidden}}

interface IResetSoknadidAction               {type: SoknaderVisningActionKeys.SOKNADID_RESET}


export function sokPsbSoknader(ident: string) {return (dispatch: any) => {
    const requestBody: IHentSoknad =
        {
            norskIdent: ident,
        }
    dispatch(findSoknaderLoadingAction(true));
    return post(ApiPath.PSB_MAPPE_SOK, undefined, {'X-Nav-NorskIdent': ident}, requestBody, (response, soknadSvar) => {
        if (response.ok) {
            return dispatch(setSoknaderAction(soknadSvar));
        } else if (response.status === 403) {
            return dispatch(findSoknaderForbiddenErrorAction(true))
        }
        return dispatch(findSoknaderErrorAction(convertResponseToError(response)));
    });
}}



