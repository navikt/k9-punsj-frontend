import {IError} from "../../models/types";
import {SoknaderVisningActionKeys} from "../../models/enums/SoknaderVisningActionKeys";
import {IHentSoknad, ISoknadPeriode} from "../../models/types/HentSoknad";
import {convertResponseToError, post} from "../../utils";
import {ApiPath} from "../../apiConfig";
import {ISoknadInfo, ISoknadSvar} from "../../models/types/SoknadSvar";

interface ISetSoknaderAction                  {type: SoknaderVisningActionKeys.SOKNADER_SET, soknadSvar: ISoknadSvar}
interface IFindSoknaderLoadingAction          {type: SoknaderVisningActionKeys.SOKNADER_LOAD, isLoading: boolean}
interface IFindSoknaderErrorAction            {type: SoknaderVisningActionKeys.SOKNADER_REQUEST_ERROR, error: IError}

interface IOpenSoknadAction                  {type: SoknaderVisningActionKeys.SOKNAD_OPEN, soknad: ISoknadInfo}
interface ICloseSoknadAction                 {type: SoknaderVisningActionKeys.SOKNAD_CLOSE}
interface IChooseSoknadAction                {type: SoknaderVisningActionKeys.SOKNAD_CHOOSE, soknad: ISoknadInfo}
interface IUndoChoiceOfSoknadAction          {type: SoknaderVisningActionKeys.SOKNAD_UNDO_CHOICE}

export function openSoknadAction(soknad: ISoknadInfo):                 IOpenSoknadAction                {return {type: SoknaderVisningActionKeys.SOKNAD_OPEN, soknad}}
export function closeSoknadAction():                             ICloseSoknadAction               {return {type: SoknaderVisningActionKeys.SOKNAD_CLOSE}}
export function chooseSoknadAction(soknad: ISoknadInfo):               IChooseSoknadAction              {return {type: SoknaderVisningActionKeys.SOKNAD_CHOOSE, soknad}}
export function undoChoiceOfSoknadAction():                      IUndoChoiceOfSoknadAction        {return {type: SoknaderVisningActionKeys.SOKNAD_UNDO_CHOICE}}

export function resetSoknadidAction():                           IResetSoknadidAction             {return {type: SoknaderVisningActionKeys.SOKNADID_RESET}}

type        ISoknaderActionTypes      = ISetSoknaderAction | IFindSoknaderErrorAction | IFindSoknaderLoadingAction;
type        ISoknadinfoActionTypes   = IOpenSoknadAction | ICloseSoknadAction | IChooseSoknadAction | IUndoChoiceOfSoknadAction;

export type ISoknaderVisningActionTypes = ISoknaderActionTypes | ISoknadinfoActionTypes | IResetSoknadidAction;

export function setSoknaderAction(soknadSvar: ISoknadSvar):              ISetSoknaderAction                {return {type: SoknaderVisningActionKeys.SOKNADER_SET, soknadSvar}}
export function findSoknaderLoadingAction(isLoading: boolean):    IFindSoknaderLoadingAction        {return {type: SoknaderVisningActionKeys.SOKNADER_LOAD, isLoading}}
export function findSoknaderErrorAction(error: IError):           IFindSoknaderErrorAction          {return {type: SoknaderVisningActionKeys.SOKNADER_REQUEST_ERROR, error}}

interface IResetSoknadidAction               {type: SoknaderVisningActionKeys.SOKNADID_RESET}


export function sokPsbSoknader(ident: string, periode: ISoknadPeriode) {return (dispatch: any) => {
    const requestBody: IHentSoknad =
        {
            norskIdent: ident,
            periode
        }
    dispatch(findSoknaderLoadingAction(true));
    return post(ApiPath.PSB_MAPPE_SOK, undefined, {'X-Nav-NorskIdent': ident}, requestBody, (response, soknadSvar) => {
        if (response.ok) {
            return dispatch(setSoknaderAction(soknadSvar));
        }

        return dispatch(findSoknaderErrorAction(convertResponseToError(response)));
    });
}}



